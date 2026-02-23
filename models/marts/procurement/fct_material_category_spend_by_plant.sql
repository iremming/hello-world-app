{{
  config(
    materialized='table'
  )
}}

SELECT
    plant,
    material_group,
    SUM(total_spend_amount) AS total_spend_amount,
    COUNT(DISTINCT purchase_order_number) AS purchase_order_count,
    COUNT(DISTINCT material) AS unique_material_count
FROM {{ ref('int_material_spend_by_plant') }}
GROUP BY plant, material_group
