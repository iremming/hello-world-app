{% set source_model = source('sap', 'A_PurchaseOrderItemType') %}

with purchase_order_items as (
    select
        {{ source_model }}.purchaseorder as purchase_order_number,
        {{ source_model }}.purchaseorderitem as purchase_order_item_number,
        {{ source_model }}.material as material_number,
        {{ source_model }}.plant as plant_code,
        {{ source_model }}.storagelocation as storage_location,
        {{ source_model }}.orderquantity as order_quantity,
        {{ source_model }}.orderpriceunit as order_price_unit,
        {{ source_model }}.netpriceamount as net_price_amount,
        {{ source_model }}.materialgroup as material_group,
        {{ source_model }}.purchaseorderitemtext as purchase_order_item_text,
        {{ source_model }}.accountassignmentcategory as account_assignment_category,
        cast({{ source_model }}.orderquantity as numeric) as order_quantity_numeric,
        cast({{ source_model }}.netpriceamount as numeric) as net_price_amount_numeric
    from {{ source_model }}
)

select *
from purchase_order_items
