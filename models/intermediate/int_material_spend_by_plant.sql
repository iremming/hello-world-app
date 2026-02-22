{{
  config(
    materialized='table'
  )
}}

WITH purchase_order_spend AS (
    SELECT * FROM {{ ref('int_purchase_order_spend') }}
),

products AS (
    SELECT * FROM {{ ref('stg_sap__products') }}
)

SELECT
    pos.purchase_order_number,
    pos.purchase_order_item,
    pos.material,
    pos.plant,
    pos.order_quantity,
    pos.net_price_amount,
    pos.total_spend_amount,
    pos.material_group,
    prd.product_type,
    prd.product_group,
    prd.base_unit,
    prd.gross_weight,
    prd.weight_unit,
    prd.creation_date AS product_creation_date
FROM purchase_order_spend pos
LEFT JOIN products prd
    ON pos.material = prd.product
