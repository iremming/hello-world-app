import os
import sys
import json
import asyncio
import httpx
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SAPODataExtractor:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            headers={
                'APIKey': self.api_key,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout=30.0
        )
    
    async def close(self):
        await self.client.aclose()
    
    def _convert_sap_date(self, date_str: Optional[str]) -> Optional[str]:
        """Convert SAP OData date format (/Date(ms)/) to ISO 8601"""
        if not date_str:
            return None
        
        # Handle regular date strings
        if date_str.startswith('/Date('):
            try:
                # Extract milliseconds from /Date(1476662400000+0000)/
                timestamp_str = date_str[6:-2].split('+')[0].split('-')[0]
                timestamp_ms = int(timestamp_str)
                dt = datetime.fromtimestamp(timestamp_ms / 1000)
                return dt.isoformat()
            except (ValueError, IndexError):
                logger.warning(f"Failed to parse SAP date format: {date_str}")
                return None
        else:
            # Assume it's already in ISO format or regular date string
            try:
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                return dt.isoformat()
            except ValueError:
                logger.warning(f"Failed to parse date string: {date_str}")
                return None
    
    async def extract_entity_data(self, entity_name: str, select_fields: List[str], 
                                filters: Optional[str] = None, batch_size: int = 1000) -> List[Dict]:
        """Extract data from SAP OData entity with pagination"""
        all_results = []
        skip = 0
        has_more = True
        
        while has_more:
            params = {
                '$format': 'json',
                '$select': ','.join(select_fields),
                '$top': batch_size,
                '$skip': skip
            }
            
            if filters:
                params['$filter'] = filters
            
            try:
                url = f"{self.base_url}/{entity_name}"
                response = await self.client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                results = data.get('d', {}).get('results', [])
                
                # Convert SAP date formats
                for result in results:
                    for key, value in result.items():
                        if isinstance(value, str) and ('Date' in key or 'date' in key.lower()):
                            result[key] = self._convert_sap_date(value)
                
                all_results.extend(results)
                
                # Check if we have more data
                has_more = len(results) == batch_size
                skip += batch_size
                
                logger.info(f"Extracted {len(results)} records from {entity_name}, total: {len(all_results)}")
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error extracting {entity_name}: {e}")
                break
            except Exception as e:
                logger.error(f"Error extracting {entity_name}: {e}")
                break
        
        return all_results

async def extract_purchase_orders():
    """Main function to extract purchase orders and items"""
    
    # Configuration
    base_url = os.getenv('SAP_BASE_URL')
    api_key = os.getenv('SAP_API_KEY')
    
    if not base_url or not api_key:
        logger.error("Missing required environment variables: SAP_BASE_URL and SAP_API_KEY")
        sys.exit(1)
    
    extractor = SAPODataExtractor(base_url, api_key)
    
    try:
        # Define fields to extract based on the staging models
        po_fields = [
            'PurchaseOrder', 'CompanyCode', 'PurchaseOrderType', 'Supplier',
            'PurchasingOrganization', 'PurchasingGroup', 'DocumentCurrency',
            'PurchaseOrderDate', 'CreationDate', 'LastChangeDateTime',
            'CreatedByUser', 'PaymentTerms', 'IncotermsClassification',
            'PurchasingProcessingStatus', 'PurchasingDocumentDeletionCode',
            'PurchasingCompletenessStatus', 'ReleaseIsNotCompleted',
            'PurchaseOrderSubtype', 'Language', 'PurchasingDocumentOrigin',
            'ExchangeRate', 'ExchangeRateIsFixed', 'ValidityStartDate',
            'ValidityEndDate', 'AddressCityName', 'AddressName',
            'AddressPostalCode', 'AddressStreetName', 'AddressRegion',
            'AddressCountry'
        ]
        
        po_item_fields = [
            'PurchaseOrder', 'PurchaseOrderItem', 'Material', 'Plant',
            'StorageLocation', 'MaterialGroup', 'PurchaseOrderItemText',
            'PurchasingInfoRecord', 'SupplierMaterialNumber', 'OrderQuantity',
            'PurchaseOrderQuantityUnit', 'OrderPriceUnit', 'DocumentCurrency',
            'NetPriceAmount', 'NetPriceQuantity', 'TaxCode', 'ShippingInstruction',
            'TaxDeterminationDate', 'TaxCountry', 'PriceIsToBePrinted',
            'ValuationType', 'IsCompletelyDelivered', 'IsFinallyInvoiced',
            'PurchaseOrderItemCategory', 'AccountAssignmentCategory',
            'GoodsReceiptIsExpected', 'GoodsReceiptIsNonValuated',
            'InvoiceIsExpected', 'InvoiceIsGoodsReceiptBased', 'ItemNetWeight',
            'ItemWeightUnit', 'ItemVolume', 'ItemVolumeUnit', 'Subcontractor',
            'SupplierIsSubcontractor', 'PurchaseContract', 'PurchaseContractItem',
            'Customer', 'PurchaseRequisition', 'PurchaseRequisitionItem',
            'IsReturnsItem', 'RequisitionerName', 'IncotermsClassification',
            'IncotermsTransferLocation', 'Batch', 'PurchasingItemIsFreeOfCharge',
            'BR_MaterialUsage', 'BR_MaterialOrigin', 'BR_CFOPCategory',
            'BR_IsProducedInHouse', 'ConsumptionTaxCtrlCode'
        ]
        
        # Extract purchase orders
        logger.info("Extracting purchase orders...")
        purchase_orders = await extractor.extract_entity_data(
            'A_PurchaseOrderType', po_fields
        )
        
        # Extract purchase order items
        logger.info("Extracting purchase order items...")
        purchase_order_items = await extractor.extract_entity_data(
            'A_PurchaseOrderItemType', po_item_fields
        )
        
        # Output results as JSON to stdout
        output = {
            'purchase_orders': purchase_orders,
            'purchase_order_items': purchase_order_items,
            'extraction_timestamp': datetime.utcnow().isoformat(),
            'record_counts': {
                'purchase_orders': len(purchase_orders),
                'purchase_order_items': len(purchase_order_items)
            }
        }
        
        json.dump(output, sys.stdout, indent=2, default=str)
        
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        sys.exit(1)
    finally:
        await extractor.close()

if __name__ == "__main__":
    asyncio.run(extract_purchase_orders())
