{{
    config(
        materialized='view',
        unique_key=['purchase_order']
    )
}}

with source as (
    select *
    from {{ source('sap', 'A_PurchaseOrderType') }}
),

renamed as (
    select
        -- Primary key
        purchaseorder as purchase_order,

        -- Basic purchase order information
        companycode as company_code,
        purchaseordertype as purchase_order_type,
        supplier,
        purchasingorganization as purchasing_organization,
        purchasinggroup as purchasing_group,
        documentcurrency as document_currency,

        -- Dates (converted from EDM.DateTime format)
        {{ convert_sap_date('purchaseorderdate') }} as purchase_order_date,
        {{ convert_sap_date('creationdate') }} as creation_date,
        {{ convert_sap_date('lastchangedatetime') }} as last_change_datetime,

        -- Basic details
        createdbyuser as created_by_user,
        paymentterms as payment_terms,
        incotermsclassification as incoterms_classification,

        -- Status flags
        purchasingprocessingstatus as purchasing_processing_status,
        purchasingdocumentdeletioncode as purchasing_document_deletion_code,
        purchasingcompletenessstatus as purchasing_completeness_status,
        releaseisnotcompleted as release_is_not_completed,

        -- Additional header information
        purchaseordersubtype as purchase_order_subtype,
        language,
        purchasingdocumentorigin as purchasing_document_origin,
        exchangerate as exchange_rate,
        exchangerateisfixed as exchange_rate_is_fixed,
        
        -- Validity dates
        {{ convert_sap_date('validitystartdate') }} as validity_start_date,
        {{ convert_sap_date('validityenddate') }} as validity_end_date,

        -- Supplier details
        supplierquotationexternalid as supplier_quotation_external_id,
        purchasingcollectivenumber as purchasing_collective_number,
        supplierrespsalespersonname as supplier_resp_sales_person_name,
        supplierphonenumber as supplier_phone_number,
        supplyingsupplier as supplying_supplier,
        supplyingplant as supplying_plant,

        -- Address information
        addresscityname as address_city_name,
        addressfaxnumber as address_fax_number,
        addresshousenumber as address_house_number,
        addressname as address_name,
        addresspostalcode as address_postal_code,
        addressstreetname as address_street_name,
        addressphonenumber as address_phone_number,
        addressregion as address_region,
        addresscountry as address_country,
        addresscorrespondencelanguage as address_correspondence_language,

        -- Financial terms
        cashdiscount1days as cash_discount_1_days,
        cashdiscount2days as cash_discount_2_days,
        netpaymentdays as net_payment_days,
        cashdiscount1percent as cash_discount_1_percent,
        cashdiscount2percent as cash_discount_2_percent,

        -- Correspondence references
        correspncinternalreference as correspondence_internal_reference,
        correspncexternalreference as correspondence_external_reference,
        invoicingparty as invoicing_party,

        -- Incoterms details
        incotermsversion as incoterms_version,
        incotermslocation1 as incoterms_location_1,
        incotermslocation2 as incoterms_location_2,

        -- Additional fields
        manualsupplieraddressid as manual_supplier_address_id,
        isendofpurposeblocked as is_end_of_purpose_blocked

    from source
)

select *
from renamed
