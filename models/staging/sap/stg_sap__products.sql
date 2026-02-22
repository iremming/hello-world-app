-- models/staging/sap/stg_sap__products.sql
{% set source_model = source('sap', 'A_ProductType') %}

with raw_products as (
    select
        "Product" as product_id,
        "ProductType" as product_type,
        "ProductGroup" as product_group,
        "BaseUnit" as base_unit,
        "GrossWeight" as gross_weight,
        "WeightUnit" as weight_unit,
        "NetWeight" as net_weight,
        "CreationDate" as creation_date,
        "CreatedByUser" as created_by_user,
        "LastChangeDate" as last_change_date,
        "LastChangedByUser" as last_changed_by_user,
        "IsMarkedForDeletion" as is_marked_for_deletion,
        "CountryOfOrigin" as country_of_origin,
        "Brand" as brand,
        "Division" as division,
        "ProductHierarchy" as product_hierarchy,
        "ItemCategoryGroup" as item_category_group,
        "ProcurementRule" as procurement_rule,
        "IsBatchManagementRequired" as is_batch_management_required,
        "ProductIsConfigurable" as is_configurable,
        "IndustrySector" as industry_sector
    from {{ source_model }}
),

final as (
    select
        -- Primary key
        product_id,
        
        -- Product classification
        product_type,
        product_group,
        division,
        product_hierarchy,
        item_category_group,
        industry_sector,
        
        -- Units and measurements
        base_unit,
        gross_weight,
        weight_unit,
        net_weight,
        
        -- Product characteristics
        brand,
        country_of_origin,
        procurement_rule,
        is_batch_management_required,
        is_configurable,
        
        -- Metadata
        creation_date,
        created_by_user,
        last_change_date,
        last_changed_by_user,
        is_marked_for_deletion
    from raw_products
)

select * from final
