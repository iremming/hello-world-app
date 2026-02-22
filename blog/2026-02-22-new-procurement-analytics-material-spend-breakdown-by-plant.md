---
title: "New Procurement Analytics: Material Spend Breakdown by Plant"
date: 2026-02-22
ticket: SCRUM-35
author: epicraft
status: draft
---
We've launched a new procurement analytics capability that enables our teams to understand material spending patterns across different manufacturing plants. This enhancement addresses a key business need for granular spend visibility, helping procurement managers identify cost optimization opportunities and negotiate better supplier contracts.

The pipeline integrates directly with our SAP S/4HANA system, pulling purchase order data from the A_PurchaseOrderItemType OData service. By combining purchase order headers with individual line items and enriching with product master data, we built a comprehensive view of procurement activity. A key decision was to structure the data model using dbt's layered approach — starting with raw staging models, then joining related entities in intermediate models, and finally aggregating to plant-level spend summaries.

From a technical perspective, the pipeline calculates total spend as order quantity multiplied by net price, then groups results by plant and material category. This allows stakeholders to see not just total spending but also purchasing volume and material diversity across locations. The solution provides the foundational data needed for plant-to-plant comparisons and helps procurement teams make data-driven decisions about sourcing strategies and inventory management.