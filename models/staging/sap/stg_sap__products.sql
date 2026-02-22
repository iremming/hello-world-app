{%- set source_model = "A_ProductType" -%}
{%- set source_relation = source('sap', source_model) -%}

with source as (
    select *
    from {{ source_relation }}
),

renamed as (
    select
        -- Primary key
        product as material_number,

        -- Basic product information
        producttype as product_type,
        productgroup as product_group,
        baseunit as base_unit,

        -- Classification and categorization
        producthierarchy as product_hierarchy,
        division,
        itemcategorygroup as item_category_group,
        industrysector as industry_sector,

        -- Weight information
        grossweight as gross_weight,
        netweight as net_weight,
        weightunit as weight_unit,

        -- Dimensions and volume
        materialvolume as material_volume,
        volumeunit as volume_unit,

        -- Dates (converted from EDM.DateTime format)
        {{ convert_sap_date('creationdate') }} as creation_date,
        {{ convert_sap_date('lastchangedate') }} as last_change_date,
        {{ convert_sap_date('lastchangedatetime') }} as last_change_datetime,
        {{ convert_sap_date('crossplantstatusvaliditydate') }} as cross_plant_status_validity_date,
        {{ convert_sap_date('validitystartdate') }} as validity_start_date,

        -- Status flags
        ismarkedfordeletion as is_marked_for_deletion,
        productisconfigurable as product_is_configurable,
        isbatchmanagementrequired as is_batch_management_required,
        qltymgmtinprocmtisactive as quality_mgmt_in_procurement_is_active,

        -- Additional product attributes
        productoldid as product_old_id,
        sourceofsupply as source_of_supply,
        countryoforigin as country_of_origin,
        competitorid as competitor_id,
        anpcode as anp_code,
        brand,
        procurementrule as procurement_rule,
        lowlevelcode as low_level_code,
        sizeordimensiontext as size_or_dimension_text,
        industrystandardname as industry_standard_name,
        productstandardid as product_standard_id,
        externalproductgroup as external_product_group,
        productmanufacturernumber as product_manufacturer_number,
        manufacturernumber as manufacturer_number,
        changenumber as change_number,
        materialrevisionlevel as material_revision_level,
        handlingindicator as handling_indicator,

        -- Warehouse and storage details
        warehouseproductgroup as warehouse_product_group,
        warehousestoragecondition as warehouse_storage_condition,
        standardhandlingunittype as standard_handling_unit_type,

        -- Quality management
        serialnumberprofile as serial_number_profile,
        adjustmentprofile as adjustment_profile,
        preferredunitofmeasure as preferred_unit_of_measure,
        quarantineperiod as quarantine_period,
        timeunitforquarantineperiod as time_unit_for_quarantine_period,
        qualityinspectiongroup as quality_inspection_group,
        authorizationgroup as authorization_group,

        -- Packaging details
        handlingunittype as handling_unit_type,
        maximumpackaginglength as maximum_packaging_length,
        maximumpackagingwidth as maximum_packaging_width,
        maximumpackagingheight as maximum_packaging_height,
        unitformaxpackagingdimensions as unit_for_max_packaging_dimensions,

        -- Created/updated information
        createdbyuser as created_by_user,
        lastchangedbyuser as last_changed_by_user

    from source
)

select *
from renamed
