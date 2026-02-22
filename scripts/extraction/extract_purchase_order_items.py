import asyncio
import os
import sys
import json
import httpx
from datetime import datetime
from typing import Dict, List, Optional

# SAP OData API configuration
SAP_BASE_URL = os.getenv('SAP_BASE_URL')
SAP_API_KEY = os.getenv('SAP_API_KEY')
SAP_ENTITY = 'A_PurchaseOrderItemType'

async def extract_purchase_order_items(output_file: Optional[str] = None) -> None:
    """
    Extract A_PurchaseOrderItemType data from SAP OData API.
    """
    if not SAP_BASE_URL or not SAP_API_KEY:
        raise ValueError("SAP_BASE_URL and SAP_API_KEY environment variables must be set")
    
    # Define the fields to select
    select_fields = [
        'PurchaseOrder',
        'PurchaseOrderItem', 
        'Material',
        'Plant',
        'OrderQuantity',
        'NetPriceAmount',
        'MaterialGroup'
    ]
    
    headers = {
        'APIKey': SAP_API_KEY,
        'Accept': 'application/json'
    }
    
    async with httpx.AsyncClient() as client:
        url = f"{SAP_BASE_URL}/{SAP_ENTITY}"
        params = {
            '$select': ','.join(select_fields),
            '$format': 'json'
        }
        
        try:
            response = await client.get(url, headers=headers, params=params, timeout=30.0)
            response.raise_for_status()
            
            data = response.json()
            items = data.get('d', {}).get('results', [])
            
            # Process and convert dates
            processed_items = []
            for item in items:
                processed_item = {}
                for key, value in item.items():
                    if key.startswith('__'):  # Skip metadata
                        continue
                    # Convert SAP date format (/Date(ms)/) to ISO 8601
                    if isinstance(value, str) and value.startswith('/Date('):
                        try:
                            timestamp_ms = int(value[6:-2])
                            processed_item[key] = datetime.fromtimestamp(timestamp_ms / 1000).isoformat()
                        except (ValueError, TypeError):
                            processed_item[key] = value
                    else:
                        processed_item[key] = value
                processed_items.append(processed_item)
            
            # Output to file or stdout
            if output_file:
                with open(output_file, 'w') as f:
                    json.dump(processed_items, f, indent=2)
                print(f"Extracted {len(processed_items)} items to {output_file}")
            else:
                json.dump(processed_items, sys.stdout, indent=2)
                
        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
            sys.exit(1)
        except httpx.RequestError as e:
            print(f"Request error occurred: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"Unexpected error: {e}")
            sys.exit(1)

if __name__ == "__main__":
    output_file = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(extract_purchase_order_items(output_file))
