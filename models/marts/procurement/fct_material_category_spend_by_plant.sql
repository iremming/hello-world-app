{{
    config(
        materialized='table',
        unique_key=['plant', 'material_group']
    )
}}

with purchase_order_spend as (
    select *
    from {{ ref('int_purchase_order_spend') }}
),

aggregated_spend as (
    select
        plant,
        material_group,
        sum(total_spend_amount) as total_spend_amount,
        sum(calculated_spend_amount) as calculated_spend_amount,
        count(distinct purchase_order) as purchase_order_count,
        count(distinct purchase_order_item) as purchase_order_item_count,
        sum(order_quantity) as total_order_quantity,
        avg(net_price_amount) as avg_net_price_amount
    from purchase_order_spend
    where material_group is not null
    group by plant, material_group
)

select
    plant,
    material_group,
    total_spend_amount,
    calculated_spend_amount,
    purchase_order_count,
    purchase_order_item_count,
    total_order_quantity,
    avg_net_price_amount
from aggregated_spend
