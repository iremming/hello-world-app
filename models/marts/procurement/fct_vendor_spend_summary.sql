{% macro sap_field_mapping(field_name) %}
  {{ return(adapter.dispatch('sap_field_mapping', 'sap')(field_name)) }}
{% endmacro %}

WITH purchase_order_items AS (
    SELECT 
        po.purchase_order,
        po.company_code,
        po.purchase_order_type,
        po.supplier,
        po.purchasing_organization,
        po.purchasing_group,
        po.document_currency,
        po.purchase_order_date,
        po.created_by_user,
        po.creation_date,
        po.payment_terms,
        po.incoterms_classification,
        poi.purchase_order_item,
        poi.material,
        poi.plant,
        poi.storage_location,
        poi.order_quantity,
        poi.order_price_unit,
        poi.net_price_amount,
        poi.material_group,
        poi.purchase_order_item_text,
        poi.account_assignment_category,
        -- Calculate total spend for each item
        (poi.order_quantity * poi.net_price_amount / CASE WHEN poi.order_price_unit = 0 THEN 1 ELSE poi.order_price_unit END) AS item_total_spend
    FROM {{ source('sap', 'a_purchaseordertype') }} po
    INNER JOIN {{ source('sap', 'a_purchaseorderitemtype') }} poi
        ON po.purchase_order = poi.purchase_order
),

supplier_data AS (
    SELECT
        supplier,
        supplier_name,
        country,
        postal_code,
        city,
        region,
        account_group,
        payment_terms AS supplier_payment_terms
    FROM {{ source('sap', 'a_suppliertype') }}
),

final_summary AS (
    SELECT
        -- Supplier information
        s.supplier,
        s.supplier_name,
        s.country,
        s.postal_code,
        s.city,
        s.region,
        s.account_group,
        s.supplier_payment_terms,
        
        -- Purchase information
        COUNT(DISTINCT poi.purchase_order) AS total_purchase_orders,
        COUNT(poi.purchase_order_item) AS total_purchase_order_items,
        SUM(poi.order_quantity) AS total_ordered_quantity,
        
        -- Financial summary
        SUM(poi.item_total_spend) AS total_spend,
        AVG(poi.net_price_amount) AS avg_item_price,
        MIN(poi.purchase_order_date) AS first_purchase_date,
        MAX(poi.purchase_order_date) AS last_purchase_date,
        
        -- Currency and organizational info
        poi.document_currency,
        COUNT(DISTINCT poi.company_code) AS company_codes_used,
        COUNT(DISTINCT poi.purchasing_organization) AS purchasing_organizations_used,
        COUNT(DISTINCT poi.purchasing_group) AS purchasing_groups_used,
        
        -- Material information
        COUNT(DISTINCT poi.material) AS unique_materials_ordered,
        COUNT(DISTINCT poi.material_group) AS unique_material_groups,
        COUNT(DISTINCT poi.plant) AS unique_plants
        
    FROM purchase_order_items poi
    LEFT JOIN supplier_data s ON poi.supplier = s.supplier
    GROUP BY 
        s.supplier,
        s.supplier_name,
        s.country,
        s.postal_code,
        s.city,
        s.region,
        s.account_group,
        s.supplier_payment_terms,
        poi.document_currency
)

SELECT
    supplier,
    supplier_name,
    country,
    postal_code,
    city,
    region,
    account_group,
    supplier_payment_terms,
    total_purchase_orders,
    total_purchase_order_items,
    total_ordered_quantity,
    total_spend,
    avg_item_price,
    first_purchase_date,
    last_purchase_date,
    document_currency,
    company_codes_used,
    purchasing_organizations_used,
    purchasing_groups_used,
    unique_materials_ordered,
    unique_material_groups,
    unique_plants,
    -- Calculate days between first and last purchase
    {{ dbt.datediff('first_purchase_date', 'last_purchase_date', 'day') }} AS days_of_activity,
    -- Calculate spend per order
    CASE WHEN total_purchase_orders > 0 THEN total_spend / total_purchase_orders ELSE 0 END AS avg_spend_per_order,
    -- Calculate average order quantity
    CASE WHEN total_purchase_order_items > 0 THEN total_ordered_quantity / total_purchase_order_items ELSE 0 END AS avg_order_quantity
FROM final_summary
ORDER BY total_spend DESC
