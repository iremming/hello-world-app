#!/usr/bin/env python3
"""
SAP OData API Extraction Script
Extracts data from SAP OData services for purchasing and product data.
"""

import os
import sys
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SAPODataExtractor:
    """Extract data from SAP OData services."""
    
    def __init__(self, base_url: str):
        """Initialize the extractor with base URL and API key."""
        self.base_url = base_url.rstrip('/')
        self.api_key = os.getenv('SAP_API_KEY')
        if not self.api_key:
            raise ValueError("SAP_API_KEY environment variable is required")
        
        self.client = httpx.AsyncClient(
            headers={
                'APIKey': self.api_key,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout=30.0
        )
    
    def convert_sap_date(self, date_str: Optional[str]) -> Optional[str]:
        """Convert SAP date format (/Date(ms)/) to ISO 8601."""
        if not date_str or not isinstance(date_str, str):
            return date_str
        
        if date_str.startswith('/Date(') and date_str.endswith(')/'):
            try:
                # Extract milliseconds from /Date(1476662400000+0000)/
                timestamp_str = date_str[6:-2].split('+')[0].split('-')[0]
                timestamp_ms = int(timestamp_str)
                timestamp_sec = timestamp_ms / 1000.0
                dt = datetime.fromtimestamp(timestamp_sec)
                return dt.isoformat()
            except (ValueError, IndexError):
                logger.warning(f"Failed to parse date: {date_str}")
                return date_str
        return date_str
    
    def process_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process response data to convert dates and handle SAP formatting."""
        if 'd' in data:
            results = data['d']
            if 'results' in results:
                for item in results['results']:
                    for key, value in item.items():
                        if isinstance(value, str):
                            item[key] = self.convert_sap_date(value)
                return results['results']
            return results
        return data
    
    async def fetch_entity_data(
        self,
        service_name: str,
        entity_name: str,
        query_params: Optional[Dict[str, str]] = None,
        batch_size: int = 1000
    ) -> List[Dict[str, Any]]:
        """Fetch data from an OData entity with pagination."""
        url = f"{self.base_url}/{service_name}/{entity_name}"
        all_results = []
        skip = 0
        
        default_params = {
            '$format': 'json',
            '$top': str(batch_size)
        }
        if query_params:
            default_params.update(query_params)
        
        while True:
            params = default_params.copy()
            params['$skip'] = str(skip)
            
            try:
                logger.info(f"Fetching {entity_name} (skip: {skip})")
                response = await self.client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                processed_data = self.process_response(data)
                
                if not processed_data:
                    break
                
                if isinstance(processed_data, list):
                    batch_results = processed_data
                else:
                    batch_results = [processed_data]
                
                if not batch_results:
                    break
                
                all_results.extend(batch_results)
                logger.info(f"Fetched {len(batch_results)} records from {entity_name}")
                
                # Check if we should continue pagination
                if len(batch_results) < batch_size:
                    break
                
                skip += batch_size
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error fetching {entity_name}: {e}")
                break
            except httpx.RequestError as e:
                logger.error(f"Request error fetching {entity_name}: {e}")
                break
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error fetching {entity_name}: {e}")
                break
        
        return all_results
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


async def extract_sap_data():
    """Main extraction function for all SAP entities."""
    base_url = os.getenv('SAP_BASE_URL')
    if not base_url:
        logger.error("SAP_BASE_URL environment variable is required")
        sys.exit(1)
    
    extractor = SAPODataExtractor(base_url)
    
    try:
        # Define entities to extract with their services and query parameters
        entities_to_extract = [
            {
                'service': 'API_PURCHASEORDER_PROCESS_SRV',
                'entity': 'A_PurchaseOrderItem',
                'params': {
                    '$select': 'PurchaseOrder,PurchaseOrderItem,Material,Plant,StorageLocation,'
                             'OrderQuantity,PurchaseOrderQuantityUnit,NetPriceAmount,'
                             'MaterialGroup,PurchaseOrderItemText,AccountAssignmentCategory,'
                             'CreationDate,CreatedByUser'
                }
            },
            {
                'service': 'API_PRODUCT_SRV',
                'entity': 'A_ProductType',
                'params': {
                    '$select': 'Product,ProductType,ProductGroup,BaseUnit,GrossWeight,'
                             'WeightUnit,CreationDate,CreatedByUser,LastChangeDate'
                }
            },
            {
                'service': 'API_PRODUCT_SRV',
                'entity': 'A_ProductPlantType',
                'params': {
                    '$select': 'Product,Plant,PurchasingGroup,CountryOfOrigin,'
                             'MRPType,ABCIndicator,ProcurementType,BaseUnit'
                }
            }
        ]
        
        extracted_data = {}
        
        for entity_config in entities_to_extract:
            service_name = entity_config['service']
            entity_name = entity_config['entity']
            query_params = entity_config.get('params', {})
            
            logger.info(f"Extracting data from {service_name}/{entity_name}")
            data = await extractor.fetch_entity_data(
                service_name, entity_name, query_params
            )
            
            extracted_data[f"{service_name}_{entity_name}"] = data
            logger.info(f"Completed extraction of {entity_name}: {len(data)} records")
        
        # Output the extracted data as JSON to stdout
        json.dump(extracted_data, sys.stdout, indent=2, default=str)
        
    except Exception as e:
        logger.error(f"Error during extraction: {e}")
        sys.exit(1)
    finally:
        await extractor.close()


if __name__ == "__main__":
    asyncio.run(extract_sap_data())
