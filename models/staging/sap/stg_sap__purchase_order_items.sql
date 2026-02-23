{{
  config(
    materialized='view'
  )
}}

SELECT
    purchase_order,
    purchase_order_item,
    material,
    plant,
    order_quantity,
    net_price_amount,
    material_group
FROM {{ source('sap', 'a_purchaseorderitemtype') }}
