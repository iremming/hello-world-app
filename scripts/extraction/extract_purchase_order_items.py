import os
import sys
import asyncio
import json
import httpx
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

# SAP OData API configuration
SAP_BASE_URL = os.getenv('SAP_BASE_URL')
SAP_API_KEY = os.getenv('SAP_API_KEY')
ENTITY_NAME = 'A_PurchaseOrderItemType'
SERVICE_NAME = 'API_PURCHASEORDER_PROCESS_SRF'

def convert_sap_date(sap_date_str: Optional[str]) -> Optional[str]:
    """Convert SAP /Date(milliseconds)/ format to ISO 8601 format"""
    if not sap_date_str or not sap_date_str.startswith('/Date('):
        return sap_date_str
    
    try:
        # Extract milliseconds from format: /Date(1476662400000+0000)/
        timestamp_str = sap_date_str.split('(')[1].split(')')[0]
        if '+' in timestamp_str:
            milliseconds = int(timestamp_str.split('+')[0])
        else:
            milliseconds = int(timestamp_str)
        
        # Convert to datetime and format as ISO 8601
        dt = datetime.fromtimestamp(milliseconds / 1000, timezone.utc)
        return dt.isoformat()
    except (ValueError, IndexError):
        return sap_date_str

async def extract_purchase_order_items(
    client: httpx.AsyncClient,
    skip: int = 0,
    top: int = 1000,
    filters: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """Extract purchase order items from SAP OData API"""
    
    # Define the fields to select based on the schema
    select_fields = [
        "PurchaseOrder", "PurchaseOrderItem", "Material", "Plant", "StorageLocation",
        "OrderQuantity", "PurchaseOrderQuantityUnit", "OrderPriceUnit", "NetPriceAmount",
        "MaterialGroup", "PurchaseOrderItemText", "AccountAssignmentCategory",
        "SupplierMaterialNumber", "DocumentCurrency", "TaxCode", "PurchaseOrderItemCategory",
        "GoodsReceiptIsExpected", "InvoiceIsExpected", "ItemNetWeight", "ItemWeightUnit",
        "PurchaseRequisition", "PurchaseRequisitionItem", "IsReturnsItem", "RequisitionerName",
        "InternationalArticleNumber", "ManufacturerMaterial", "ProductType", "Batch",
        "PurchasingItemIsFreeOfCharge", "CreationDate", "LastChangeDateTime"
    ]
    
    # Build the query parameters
    params = {
        '$format': 'json',
        '$top': top,
        '$skip': skip,
        '$select': ','.join(select_fields)
    }
    
    # Add filters if provided
    if filters:
        params['$filter'] = ' and '.join(filters)
    
    try:
        # Make the API request
        response = await client.get(
            f"{SAP_BASE_URL}/{SERVICE_NAME}/{ENTITY_NAME}",
            params=params,
            headers={'APIKey': SAP_API_KEY}
        )
        response.raise_for_status()
        
        # Parse the response
        data = response.json()
        items = data.get('d', {}).get('results', [])
        
        # Convert SAP date formats
        for item in items:
            for key, value in item.items():
                if value and isinstance(value, str) and value.startswith('/Date('):
                    item[key] = convert_sap_date(value)
        
        return items
        
    except httpx.HTTPStatusError as e:
        print(f"HTTP error: {e.response.status_code} - {e.response.text}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Error extracting data: {str(e)}", file=sys.stderr)
        return []

async def main():
    """Main function to extract all purchase order items"""
    if not SAP_BASE_URL or not SAP_API_KEY:
        print("Error: SAP_BASE_URL and SAP_API_KEY environment variables must be set", file=sys.stderr)
        sys.exit(1)
    
    all_items = []
    skip = 0
    batch_size = 1000
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        while True:
            items = await extract_purchase_order_items(client, skip=skip, top=batch_size)
            if not items:
                break
            
            all_items.extend(items)
            
            # If we got fewer items than requested, we've reached the end
            if len(items) < batch_size:
                break
                
            skip += batch_size
    
    # Output the results as JSON
    print(json.dumps(all_items, indent=2))

if __name__ == '__main__':
    asyncio.run(main())
