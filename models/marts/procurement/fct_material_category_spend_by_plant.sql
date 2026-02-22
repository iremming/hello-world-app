{% set sql_engine = 'snowflake' %}  -- Adjust if needed for other databases
WITH 
purchase_orders_with_products AS (
    SELECT * FROM {{ ref('int_purchase_orders_with_products') }}
)

SELECT
    plant,
    material_group,
    document_currency,
    SUM(net_price_amount * order_quantity) AS total_spend,
    COUNT(DISTINCT purchase_order) AS unique_purchase_orders,
    SUM(order_quantity) AS total_quantity
FROM purchase_orders_with_products
WHERE material_group IS NOT NULL
  AND plant IS NOT NULL
GROUP BY plant, material_group, document_currency
ORDER BY plant, material_group
