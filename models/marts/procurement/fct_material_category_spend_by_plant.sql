{{
    config(
        materialized='table',
        description='Aggregates spend by material group (category) and plant. Uses SAP purchase order data joined with product and business partner information.'
    )
}}

WITH purchase_orders AS (
    SELECT
        po.purchase_order,
        po.purchase_order_type,
        po.supplier,
        po.company_code,
        po.purchasing_organization,
        po.purchasing_group,
        po.document_currency,
        CAST(po.purchase_order_date AS DATE) AS purchase_order_date,
        po.created_by_user,
        CAST(po.creation_date AS DATE) AS creation_date,
        po.payment_terms,
        po.incoterms_classification
    FROM {{ source('sap', 'a_purchaseordertype') }} po
),

purchase_order_items AS (
    SELECT
        poi.purchase_order,
        poi.purchase_order_item,
        poi.material,
        poi.plant,
        poi.storage_location,
        poi.order_quantity,
        poi.purchase_order_quantity_unit,
        poi.order_price_unit,
        poi.net_price_amount,
        poi.material_group,
        poi.purchase_order_item_text,
        poi.account_assignment_category
    FROM {{ source('sap', 'a_purchaseorderitemtype') }} poi
),

products AS (
    SELECT
        p.product,
        p.product_type,
        p.product_group,
        p.base_unit,
        p.gross_weight,
        p.weight_unit,
        CAST(p.creation_date AS DATE) AS creation_date
    FROM {{ source('sap', 'a_producttype') }} p
),

business_partners AS (
    SELECT
        bp.business_partner,
        bp.business_partner_category,
        bp.business_partner_full_name,
        bp.first_name,
        bp.last_name,
        bp.search_term1,
        bp.organization_bp_name1,
        CAST(bp.creation_date AS DATE) AS creation_date
    FROM {{ source('sap', 'a_businesspartnertype') }} bp
),

joined_data AS (
    SELECT
        poi.purchase_order,
        poi.purchase_order_item,
        po.purchase_order_type,
        po.supplier,
        po.company_code,
        po.purchasing_organization,
        po.purchasing_group,
        po.document_currency,
        po.purchase_order_date,
        po.created_by_user,
        po.creation_date,
        po.payment_terms,
        po.incoterms_classification,
        poi.material,
        poi.plant,
        poi.storage_location,
        poi.order_quantity,
        poi.purchase_order_quantity_unit,
        poi.order_price_unit,
        poi.net_price_amount,
        poi.material_group,
        poi.purchase_order_item_text,
        poi.account_assignment_category,
        p.product_type,
        p.product_group AS product_product_group,
        p.base_unit,
        p.gross_weight,
        p.weight_unit,
        p.creation_date AS product_creation_date,
        bp.business_partner_category,
        bp.business_partner_full_name,
        bp.first_name,
        bp.last_name,
        bp.search_term1,
        bp.organization_bp_name1,
        bp.creation_date AS bp_creation_date,
        -- Calculate spend amount
        poi.net_price_amount * poi.order_quantity AS total_spend_amount
    FROM purchase_order_items poi
    INNER JOIN purchase_orders po
        ON poi.purchase_order = po.purchase_order
    LEFT JOIN products p
        ON poi.material = p.product
    LEFT JOIN business_partners bp
        ON po.supplier = bp.business_partner
)

SELECT
    plant,
    material_group,
    document_currency,
    COUNT(DISTINCT purchase_order) AS purchase_order_count,
    COUNT(DISTINCT purchase_order_item) AS purchase_order_item_count,
    SUM(order_quantity) AS total_quantity,
    SUM(total_spend_amount) AS total_spend_amount,
    AVG(net_price_amount) AS average_net_price,
    MIN(purchase_order_date) AS earliest_order_date,
    MAX(purchase_order_date) AS latest_order_date,
    COUNT(DISTINCT supplier) AS unique_suppliers_count
FROM joined_data
GROUP BY plant, material_group, document_currency
ORDER BY plant, material_group, total_spend_amount DESC
