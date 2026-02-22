{% set source_model = source('sap', 'A_ProductType') %}

with staging as (

    select
        {{ dbt_utils.surrogate_key(['Product']) }} as product_id,
        cast(Product as string) as product,
        cast(ProductType as string) as product_type
    from {{ source_model }}

)

select * from staging
