{% with target_entity = "A_SupplierType" %}
{% set entity_def = schema_entities | selectattr("name", "equalto", target_entity) | first %}
{% set columns = entity_def.fields %}
{% set key_fields = entity_def.keys %}

{{ config(materialized='view') }}

SELECT
    {% for column in columns %}
    {% set sap_mapping = field_mappings.get(target_entity, {}).get(column.name, '') %}
    {% set alias_name = sap_mapping.split('.')[1] if sap_mapping and '.' in sap_mapping else column.name %}
    {{ column.name }} AS {{ alias_name }}{% if not loop.last %},{% endif %}
    {% endfor %}
FROM {{ source('sap', '{{ target_entity }}') }}
{% endwith %}
