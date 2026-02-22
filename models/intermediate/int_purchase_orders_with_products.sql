{{
    config(
        materialized='table',
        alias='int_purchase_orders_with_products'
    )
}}

WITH purchase_order_items AS (
    SELECT * 
    FROM {{ ref('stg_sap__purchase_order_items') }}
),

products AS (
    SELECT * 
    FROM {{ ref('stg_sap__products') }}
)

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
    poi.account_assignment_category,
    p.product_type,
    p.product_group,
    p.base_unit,
    p.gross_weight,
    p.weight_unit,
    p.creation_date
FROM purchase_order_items poi
LEFT JOIN products p
    ON poi.material = p.product
