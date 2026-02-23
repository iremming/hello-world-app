{{
  config(
    materialized='table'
  )
}}

WITH purchase_order_items AS (
    SELECT * FROM {{ ref('stg_sap__purchase_order_items') }}
),

purchase_orders AS (
    SELECT * FROM {{ ref('stg_sap__purchase_orders') }}
)

SELECT
    po.purchase_order_number,
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
    poi.order_quantity,
    poi.net_price_amount,
    poi.material_group,
    -- Calculate spend amount
    poi.order_quantity * poi.net_price_amount AS total_spend_amount
FROM purchase_orders po
INNER JOIN purchase_order_items poi
    ON po.purchase_order_number = poi.purchase_order
