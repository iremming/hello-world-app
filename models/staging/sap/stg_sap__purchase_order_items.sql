{{
    config(
        materialized='view',
        unique_key=['purchase_order', 'purchase_order_item']
    )
}}

with source as (
    select *
    from {{ source('sap', 'A_PurchaseOrderItemType') }}
),

renamed as (
    select
        -- Primary keys
        purchaseorder as purchase_order,
        purchaseorderitem as purchase_order_item,

        -- Basic item information
        material as material_number,
        plant,
        storagelocation as storage_location,
        materialgroup as material_group,
        purchaseorderitemtext as purchase_order_item_text,
        purchasinginforecord as purchasing_info_record,
        suppliermaterialnumber as supplier_material_number,

        -- Quantity and price data
        orderquantity as order_quantity,
        purchaseorderquantityunit as order_quantity_unit,
        orderpriceunit as order_price_unit,
        orderpriceunittoorderunitnmrtr as order_price_unit_numerator,
        ordpriceunittoorderunitdnmntr as order_price_unit_denominator,
        documentcurrency as document_currency,
        netpriceamount as net_price_amount,
        netpricequantity as net_price_quantity,

        -- Item characteristics
        purchaseorderitemcategory as purchase_order_item_category,
        accountassignmentcategory as account_assignment_category,
        multipleacctassgmtdistribution as multiple_account_assignment_distribution,
        partialinvoicedistribution as partial_invoice_distribution,

        -- Status flags
        iscompletelydelivered as is_completely_delivered,
        isfinallyinvoiced as is_finally_invoiced,
        goodsreceiptisexpected as goods_receipt_is_expected,
        goodsreceiptisnonvaluated as goods_receipt_is_non_valuated,
        invoiceisexpected as invoice_is_expected,
        invoiceisgoodsreceiptbased as invoice_is_goods_receipt_based,

        -- Additional item details
        taxcode as tax_code,
        shippinginstruction as shipping_instruction,
        taxdeterminationdate as tax_determination_date,
        taxcountry as tax_country,
        priceistobeprinted as price_is_to_be_printed,
        valuationtype as valuation_type,

        -- Weight and volume
        itemnetweight as item_net_weight,
        itemweightunit as item_weight_unit,
        itemvolume as item_volume,
        itemvolumeunit as item_volume_unit,

        -- Dates (converted from EDM.DateTime format)
        {{ convert_sap_date('taxdeterminationdate') }} as tax_determination_date_iso,

        -- Additional fields
        subcontractor,
        supplierissubcontractor as supplier_is_subcontractor,
        purchasecontract as purchase_contract,
        purchasecontractitem as purchase_contract_item,
        customer,
        purchaserequisition as purchase_requisition,
        purchaserequisitionitem as purchase_requisition_item,
        isreturnsitem as is_returns_item,
        requisitionername as requisitioner_name,
        incotermsclassification as incoterms_classification,
        incotermstransferlocation as incoterms_transfer_location,
        batch,
        purchasingitemisfreeofcharge as purchasing_item_is_free_of_charge,

        -- BR/Country specific fields
        br_materialusage as br_material_usage,
        br_materialorigin as br_material_origin,
        br_cfopcategory as br_cfop_category,
        br_isproducedinhouse as br_is_produced_in_house,
        consumptiontaxctrlcode as consumption_tax_control_code

    from source
)

select *
from renamed
