import asyncio
import os
import json
import sys
from datetime import datetime
from typing import Dict, List, Optional
import httpx

# SAP OData API Configuration
SAP_BASE_URL = os.getenv("SAP_BASE_URL", "https://your-sap-system.com")
SAP_API_KEY = os.getenv("SAP_API_KEY")
SAP_SERVICE_PURCHASE = "API_PURCHASEORDER_PROCESS_SRV"
SAP_SERVICE_BUSINESS_PARTNER = "API_BUSINESS_PARTNER"

# Headers for authentication
HEADERS = {
    "APIKey": SAP_API_KEY,
    "Accept": "application/json"
}

def convert_sap_date(date_str: Optional[str]) -> Optional[str]:
    """
    Convert SAP date format (/Date(ms)/) to ISO 8601 format.
    Returns None if input is None or empty.
    """
    if not date_str:
        return None
        
    if date_str.startswith("/Date(") and date_str.endswith(")/"):
        # Extract milliseconds from /Date(ms)/
        try:
            ms_str = date_str[6:-2]
            ms = int(ms_str)
            # Convert to datetime object (assuming UTC)
            dt = datetime.utcfromtimestamp(ms / 1000.0)
            return dt.isoformat() + "Z"
        except (ValueError, IndexError):
            return date_str
    return date_str

def convert_sap_datetimeoffset(date_str: Optional[str]) -> Optional[str]:
    """
    Convert SAP DateTimeOffset format to ISO 8601 format.
    Returns None if input is None or empty.
    """
    if not date_str:
        return None
        
    try:
        # Try to parse various SAP datetime formats
        for fmt in ["%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%d"]:
            try:
                dt = datetime.strptime(date_str.split("+")[0].split("-")[0], fmt)
                return dt.isoformat()
            except ValueError:
                continue
        return date_str
    except Exception:
        return date_str

def process_entity_data(entity_data: Dict) -> Dict:
    """
    Process entity data to convert SAP date formats to ISO 8601.
    """
    processed = {}
    for key, value in entity_data.items():
        if value is None:
            processed[key] = None
        elif isinstance(value, str):
            if "Date" in key or "DateTime" in key:
                processed[key] = convert_sap_date(value)
            else:
                processed[key] = value
        else:
            processed[key] = value
    return processed

async def fetch_odata_entity(
    client: httpx.AsyncClient,
    service: str,
    entity: str,
    query_params: Optional[Dict] = None,
    top: int = 1000,
    skip: int = 0
) -> List[Dict]:
    """
    Fetch data from SAP OData API with pagination.
    """
    if query_params is None:
        query_params = {}
    
    # Set default query parameters
    default_params = {
        "$format": "json",
        "$top": str(top),
        "$skip": str(skip)
    }
    query_params.update(default_params)
    
    url = f"{SAP_BASE_URL}/sap/opu/odata/sap/{service}/{entity}"
    
    try:
        response = await client.get(url, params=query_params, headers=HEADERS)
        response.raise_for_status()
        
        data = response.json()
        entities = data.get("d", {}).get("results", [])
        
        # Process each entity to convert date formats
        processed_entities = [process_entity_data(entity) for entity in entities]
        
        return processed_entities
        
    except httpx.HTTPStatusError as e:
        print(f"HTTP error fetching {entity}: {e}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Error fetching {entity}: {e}", file=sys.stderr)
        return []

async def extract_purchase_orders() -> List[Dict]:
    """
    Extract purchase orders from SAP OData API.
    """
    async with httpx.AsyncClient() as client:
        query_params = {
            "$select": "PurchaseOrder,CompanyCode,PurchaseOrderType,Supplier,PurchasingOrganization,"
                      "PurchasingGroup,DocumentCurrency,PurchaseOrderDate,CreatedByUser,CreationDate,"
                      "PaymentTerms,IncotermsClassification,LastChangeDateTime",
            "$filter": "PurchaseOrderType eq 'NB'",  # Example filter for standard purchase orders
            "$orderby": "CreationDate desc"
        }
        
        all_orders = []
        skip = 0
        batch_size = 1000
        
        while True:
            orders = await fetch_odata_entity(
                client, SAP_SERVICE_PURCHASE, "A_PurchaseOrderType",
                query_params, batch_size, skip
            )
            
            if not orders:
                break
                
            all_orders.extend(orders)
            skip += batch_size
            
            # Break if we got fewer results than requested (end of data)
            if len(orders) < batch_size:
                break
        
        return all_orders

async def extract_purchase_order_items() -> List[Dict]:
    """
    Extract purchase order items from SAP OData API.
    """
    async with httpx.AsyncClient() as client:
        query_params = {
            "$select": "PurchaseOrder,PurchaseOrderItem,Material,Plant,StorageLocation,OrderQuantity,"
                      "PurchaseOrderQuantityUnit,NetPriceAmount,MaterialGroup,PurchaseOrderItemText,"
                      "AccountAssignmentCategory,IsCompletelyDelivered,IsFinallyInvoiced",
            "$orderby": "PurchaseOrder,PurchaseOrderItem"
        }
        
        all_items = []
        skip = 0
        batch_size = 1000
        
        while True:
            items = await fetch_odata_entity(
                client, SAP_SERVICE_PURCHASE, "A_PurchaseOrderItemType",
                query_params, batch_size, skip
            )
            
            if not items:
                break
                
            all_items.extend(items)
            skip += batch_size
            
            # Break if we got fewer results than requested (end of data)
            if len(items) < batch_size:
                break
        
        return all_items

async def extract_suppliers() -> List[Dict]:
    """
    Extract suppliers from SAP OData API.
    """
    async with httpx.AsyncClient() as client:
        query_params = {
            "$select": "Supplier,SupplierName,Country,PostalCode,City,Region,AccountGroup,PaymentTerms,"
                      "SupplierAccountGroup,CreationDate,CreatedByUser",
            "$orderby": "Supplier"
        }
        
        all_suppliers = []
        skip = 0
        batch_size = 1000
        
        while True:
            suppliers = await fetch_odata_entity(
                client, SAP_SERVICE_BUSINESS_PARTNER, "A_SupplierType",
                query_params, batch_size, skip
            )
            
            if not suppliers:
                break
                
            all_suppliers.extend(suppliers)
            skip += batch_size
            
            # Break if we got fewer results than requested (end of data)
            if len(suppliers) < batch_size:
                break
        
        return all_suppliers

async def main():
    """
    Main function to extract purchase data from SAP OData APIs.
    Outputs JSON data to stdout.
    """
    if not SAP_API_KEY:
        print("Error: SAP_API_KEY environment variable is required", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Extract data from all three entities
        purchase_orders = await extract_purchase_orders()
        purchase_order_items = await extract_purchase_order_items()
        suppliers = await extract_suppliers()
        
        # Combine all data into a single structure
        result = {
            "purchase_orders": purchase_orders,
            "purchase_order_items": purchase_order_items,
            "suppliers": suppliers,
            "extraction_timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        # Output as JSON to stdout
        json.dump(result, sys.stdout, indent=2, default=str)
        
    except Exception as e:
        print(f"Error in extraction process: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
