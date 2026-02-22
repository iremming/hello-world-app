import asyncio
import os
import sys
import json
from datetime import datetime
import httpx
from typing import List, Dict, Any, Optional

def convert_sap_date(sap_date_str: Optional[str]) -> Optional[str]:
    """Convert SAP date format (/Date(ms)/) to ISO 8601 format"""
    if not sap_date_str or not sap_date_str.startswith("/Date("):
        return sap_date_str
    
    try:
        timestamp_str = sap_date_str.replace("/Date(", "").replace(")/", "")
        if "+" in timestamp_str:
            timestamp_ms = int(timestamp_str.split("+")[0])
        elif "-" in timestamp_str:
            timestamp_ms = int(timestamp_str.split("-")[0])
        else:
            timestamp_ms = int(timestamp_str)
        
        return datetime.fromtimestamp(timestamp_ms / 1000).isoformat()
    except (ValueError, AttributeError):
        return sap_date_str

async def extract_products_to_file(
    base_url: str,
    api_key: str,
    output_file: str = None,
    batch_size: int = 1000
):
    """
    Extract all A_ProductType data from SAP OData API and write to file or stdout
    """
    headers = {
        "APIKey": api_key,
        "Accept": "application/json"
    }
    
    fields = [
        "Product", "ProductType", "CrossPlantStatus", "CrossPlantStatusValidityDate",
        "CreationDate", "CreatedByUser", "LastChangeDate", "LastChangedByUser",
        "LastChangeDateTime", "IsMarkedForDeletion", "ProductOldID", "GrossWeight",
        "PurchaseOrderQuantityUnit", "SourceOfSupply", "WeightUnit", "NetWeight",
        "CountryOfOrigin", "CompetitorID", "ProductGroup", "BaseUnit", "ItemCategoryGroup",
        "ProductHierarchy", "Division", "VarblPurOrdUnitIsActive", "VolumeUnit",
        "MaterialVolume", "ANPCode", "Brand", "ProcurementRule", "ValidityStartDate",
        "LowLevelCode", "ProdNoInGenProdInPrepackProd", "SerialIdentifierAssgmtProfile",
        "SizeOrDimensionText", "IndustryStandardName", "ProductStandardID",
        "InternationalArticleNumberCat", "ProductIsConfigurable", "IsBatchManagementRequired",
        "ExternalProductGroup", "CrossPlantConfigurableProduct", "SerialNoExplicitnessLevel",
        "ProductManufacturerNumber", "ManufacturerNumber", "ManufacturerPartProfile",
        "QltyMgmtInProcmtIsActive", "IndustrySector", "ChangeNumber", "MaterialRevisionLevel",
        "HandlingIndicator", "WarehouseProductGroup", "WarehouseStorageCondition",
        "StandardHandlingUnitType", "SerialNumberProfile", "AdjustmentProfile",
        "PreferredUnitOfMeasure", "IsPilferable", "IsRelevantForHzdsSubstances",
        "QuarantinePeriod", "TimeUnitForQuarantinePeriod", "QualityInspectionGroup",
        "AuthorizationGroup", "DocumentIsCreatedByCAD", "HandlingUnitType",
        "HasVariableTareWeight", "MaximumPackagingLength", "MaximumPackagingWidth",
        "MaximumPackagingHeight", "UnitForMaxPackagingDimensions", "YY1_BonusValidityEnd_PRD",
        "YY1_BonusPercentage_PRD", "YY1_BonusPercentage_PRDU", "YY1_BonusValidityStart_PRD"
    ]
    
    select_params = ",".join(fields)
    skip = 0
    all_products = []
    
    async with httpx.AsyncClient() as client:
        while True:
            params = {
                "$format": "json",
                "$select": select_params,
                "$top": batch_size,
                "$skip": skip
            }
            
            try:
                response = await client.get(
                    f"{base_url}/API_PRODUCT_SRV/A_ProductType",
                    headers=headers,
                    params=params,
                    timeout=30.0
                )
                response.raise_for_status()
                
                data = response.json()
                products = data.get("d", {}).get("results", [])
                
                if not products:
                    break
                
                # Process date conversions
                for product in products:
                    product["LastChangeDateTime"] = convert_sap_date(product.get("LastChangeDateTime"))
                    product["CrossPlantStatusValidityDate"] = convert_sap_date(product.get("CrossPlantStatusValidityDate"))
                    product["ValidityStartDate"] = convert_sap_date(product.get("ValidityStartDate"))
                    product["YY1_BonusValidityEnd_PRD"] = convert_sap_date(product.get("YY1_BonusValidityEnd_PRD"))
                    product["YY1_BonusValidityStart_PRD"] = convert_sap_date(product.get("YY1_BonusValidityStart_PRD"))
                
                all_products.extend(products)
                skip += len(products)
                
                print(f"Fetched {len(products)} products, total: {len(all_products)}", file=sys.stderr)
                
                # Check if we have more data
                if len(products) < batch_size:
                    break
                    
            except httpx.HTTPStatusError as e:
                print(f"HTTP error: {e}", file=sys.stderr)
                break
            except Exception as e:
                print(f"Error fetching data: {e}", file=sys.stderr)
                break
    
    # Output results
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_products, f, indent=2, ensure_ascii=False)
        print(f"Data written to {output_file}", file=sys.stderr)
    else:
        print(json.dumps(all_products, indent=2, ensure_ascii=False))

def main():
    base_url = os.getenv('SAP_BASE_URL')
    api_key = os.getenv('SAP_API_KEY')
    output_file = os.getenv('OUTPUT_FILE')
    
    if not base_url or not api_key:
        print("Error: SAP_BASE_URL and SAP_API_KEY environment variables must be set", file=sys.stderr)
        sys.exit(1)
    
    asyncio.run(extract_products_to_file(base_url, api_key, output_file))

if __name__ == "__main__":
    main()
