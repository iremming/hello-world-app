{{
  config(
    materialized='view',
    schema='staging'
  )
}}

SELECT
  CAST(poi."PurchaseOrder" AS VARCHAR(10)) AS purchase_order_number,
  CAST(poi."PurchaseOrderItem" AS VARCHAR(5)) AS purchase_order_item,
  CAST(poi."Material" AS VARCHAR(18)) AS material_number,
  CAST(poi."Plant" AS VARCHAR(4)) AS plant,
  CAST(poi."StorageLocation" AS VARCHAR(4)) AS storage_location,
  CAST(poi."MaterialGroup" AS VARCHAR(9)) AS material_group,
  CAST(poi."OrderQuantity" AS DECIMAL(13,3)) AS order_quantity,
  CAST(poi."PurchaseOrderQuantityUnit" AS VARCHAR(3)) AS order_unit,
  CAST(poi."NetPriceAmount" AS DECIMAL(11,2)) AS net_price,
  CAST(poi."DocumentCurrency" AS VARCHAR(5)) AS currency,
  CAST(poi."PurchaseOrderItemText" AS VARCHAR(40)) AS item_description,
  CAST(poi."AccountAssignmentCategory" AS VARCHAR(1)) AS account_assignment_category,
  CAST(po."Supplier" AS VARCHAR(10)) AS supplier_number,
  CAST(s."SupplierName" AS VARCHAR(35)) AS supplier_name,
  CAST(po."PurchaseOrderDate" AS DATE) AS order_date,
  CAST(po."CreatedByUser" AS VARCHAR(12)) AS created_by,
  CAST(po."CreationDate" AS DATE) AS creation_date,
  CAST(po."PaymentTerms" AS VARCHAR(4)) AS payment_terms,
  CAST(po."PurchasingOrganization" AS VARCHAR(4)) AS purchasing_organization,
  CAST(po."PurchasingGroup" AS VARCHAR(3)) AS purchasing_group,
  CAST(po."DocumentCurrency" AS VARCHAR(5)) AS document_currency,
  CAST(po."IncotermsClassification" AS VARCHAR(3)) AS incoterms,
  CAST(s."Country" AS VARCHAR(3)) AS supplier_country,
  CAST(s."PostalCode" AS VARCHAR(10)) AS supplier_postal_code,
  CAST(s."City" AS VARCHAR(25)) AS supplier_city,
  CAST(s."Region" AS VARCHAR(3)) AS supplier_region,
  CAST(s."AccountGroup" AS VARCHAR(4)) AS supplier_account_group
FROM {{ source('sap', 'A_PurchaseOrderItemType') }} poi
LEFT JOIN {{ source('sap', 'A_PurchaseOrderType') }} po 
  ON poi."PurchaseOrder" = po."PurchaseOrder"
LEFT JOIN {{ source('sap', 'A_SupplierType') }} s 
  ON po."Supplier" = s."Supplier"
