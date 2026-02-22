{{ config(materialized='table') }}

WITH pos AS (
    SELECT
        purchase_order_number,
        purchase_order_type,
        supplier_number,
        company_code,
        purchasing_organization,
        purchasing_group,
        document_currency,
        purchase_order_date,
        created_by_user,
        creation_date,
        payment_terms,
        incoterms_classification
    FROM {{ source('sap', 'a_purchaseordertype') }}
),

po_items AS (
    SELECT
        purchase_order_number,
        purchase_order_item,
        material_number,
        plant,
        storage_location,
        order_quantity,
        order_price_unit,
        net_price_amount,
        material_group,
        purchase_order_item_text,
        account_assignment_category
    FROM {{ source('sap', 'a_purchaseorderitemtype') }}
),

products AS (
    SELECT
        product as material_number,
        product_type,
        product_group,
        base_unit,
        gross_weight,
        weight_unit,
        creation_date as product_creation_date
    FROM {{ source('sap', 'a_producttype') }}
),

bp AS (
    SELECT
        business_partner as supplier_number,
        business_partner_category,
        business_partner_full_name,
        first_name,
        last_name,
        search_term1,
        organization_bp_name1,
        creation_date as bp_creation_date
    FROM {{ source('sap', 'a_businesspartnertype') }}
)

SELECT
    po_items.purchase_order_number,
    po_items.purchase_order_item,
    po_items.material_number,
    po_items.plant,
    po_items.order_quantity,
    po_items.net_price_amount,
    po_items.order_quantity * po_items.net_price_amount as total_spend,
    po_items.order_price_unit,
    po_items.material_group,
    po_items.purchase_order_item_text,
    pos.purchase_order_type,
    pos.supplier_number,
    pos.company_code,
    pos.purchasing_organization,
    pos.purchasing_group,
    pos.document_currency,
    pos.purchase_order_date,
    pos.created_by_user,
    pos.creation_date,
    pos.payment_terms,
    pos.incoterms_classification,
    po_items.storage_location,
    po_items.account_assignment_category,
    products.product_type,
    products.product_group as product_group_code,
    products.base_unit,
    products.gross_weight,
    products.weight_unit,
    products.product_creation_date,
    bp.business_partner_category,
    bp.business_partner_full_name as supplier_name,
    bp.first_name as supplier_first_name,
    bp.last_name as supplier_last_name,
    bp.search_term1 as supplier_search_term,
    bp.organization_bp_name1 as supplier_organization_name,
    bp.bp_creation_date as supplier_creation_date
FROM po_items
LEFT JOIN pos ON po_items.purchase_order_number = pos.purchase_order_number
LEFT JOIN products ON po_items.material_number = products.material_number
LEFT JOIN bp ON pos.supplier_number = bp.supplier_number
