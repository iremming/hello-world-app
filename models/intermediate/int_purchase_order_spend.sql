{{
    config(
        materialized='view'
    )
}}

with purchase_order_items as (
    select *
    from {{ ref('stg_sap__purchase_order_items') }}
),

purchase_orders as (
    select *
    from {{ ref('stg_sap__purchase_orders') }}
),

joined as (
    select
        -- Primary keys
        poi.purchase_order,
        poi.purchase_order_item,
        
        -- Purchase order header information
        po.company_code,
        po.purchase_order_type,
        po.supplier,
        po.purchasing_organization,
        po.purchasing_group,
        po.document_currency,
        po.purchase_order_date,
        po.creation_date,
        po.created_by_user,
        po.payment_terms,
        po.incoterms_classification,
        
        -- Purchase order item information
        poi.material_number,
        poi.plant,
        poi.storage_location,
        poi.material_group,
        poi.purchase_order_item_text,
        poi.order_quantity,
        poi.order_quantity_unit,
        poi.order_price_unit,
        poi.net_price_amount,
        poi.net_price_quantity,
        poi.purchase_order_item_category,
        poi.account_assignment_category,
        
        -- Calculated spend fields
        poi.order_quantity * poi.net_price_amount as total_spend_amount,
        case 
            when poi.order_quantity_unit = poi.order_price_unit then poi.order_quantity * poi.net_price_amount
            else null  -- Handle unit conversion if needed in future
        end as calculated_spend_amount
        
    from purchase_order_items poi
    inner join purchase_orders po
        on poi.purchase_order = po.purchase_order
)

select *
from joined
