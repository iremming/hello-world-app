{{
    config(
        materialized='table',
        alias='int_purchase_order_details',
        tags=['intermediate']
    )
}}

with purchase_orders as (
    select
        purchase_order as purchase_order_number,
        supplier as supplier_number,
        company_code,
        purchasing_organization,
        purchasing_group,
        purchase_order_type,
        document_currency,
        cast(purchase_order_date as date) as purchase_order_date,
        created_by_user,
        cast(creation_date as date) as creation_date,
        payment_terms as payment_terms_code,
        incoterms_classification,
        address_city_name as supplier_city,
        address_country as supplier_country,
        address_region as supplier_region,
        address_postal_code as supplier_postal_code
    from {{ source('sap', 'a_purchaseordertype') }}
),

purchase_order_items as (
    select
        purchase_order as purchase_order_number,
        purchase_order_item as item_number,
        material as material_number,
        plant,
        storage_location,
        order_quantity,
        purchase_order_quantity_unit as order_unit,
        order_price_unit as price_unit,
        net_price_amount,
        material_group,
        purchase_order_item_text as item_description,
        account_assignment_category
    from {{ source('sap', 'a_purchaseorderitemtype') }}
),

suppliers as (
    select
        supplier as supplier_number,
        supplier_name,
        country,
        postal_code,
        city,
        region,
        supplier_account_group as account_group,
        payment_terms
    from {{ source('sap', 'a_suppliertype') }}
)

select
    po.purchase_order_number,
    po.supplier_number,
    po.company_code,
    po.purchasing_organization,
    po.purchasing_group,
    po.purchase_order_type,
    po.document_currency,
    po.purchase_order_date,
    po.creation_date,
    po.created_by_user,
    po.payment_terms_code,
    po.incoterms_classification,
    po.supplier_city,
    po.supplier_country,
    po.supplier_region,
    po.supplier_postal_code,
    
    poi.item_number,
    poi.material_number,
    poi.plant,
    poi.storage_location,
    poi.order_quantity,
    poi.order_unit,
    poi.price_unit,
    poi.net_price_amount,
    poi.material_group,
    poi.item_description,
    poi.account_assignment_category,
    
    s.supplier_name,
    s.country as supplier_country_code,
    s.postal_code as supplier_postal_code_full,
    s.city as supplier_city_name,
    s.region as supplier_region_code,
    s.account_group,
    s.payment_terms as supplier_payment_terms,
    
    -- Calculate extended line amount
    (poi.order_quantity * poi.net_price_amount) as extended_line_amount
    
from purchase_orders po
inner join purchase_order_items poi
    on po.purchase_order_number = poi.purchase_order_number
left join suppliers s
    on po.supplier_number = s.supplier_number
