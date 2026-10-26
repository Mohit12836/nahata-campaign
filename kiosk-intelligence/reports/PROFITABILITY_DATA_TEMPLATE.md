# Profitability Research — No Invented Margins

As of 2026-10-26 there is no verified Jaora/Ratlam kiosk-level transaction or cost dataset, so **highest-margin ranking cannot honestly be populated yet**.

## Observation fields
- `service_id` — immutable catalog key
- `region_id`, `observation_month`, `transaction_count`, `evidence_type`
- `official_government_fee_inr` — not kiosk income
- `allowed_assistance_fee_inr` and basis/authorization
- `net_commission_received_inr`
- `payment_processing_cost_inr`
- `employee_minutes_per_case` and fully burdened hourly labour cost
- `printing_scanning_cost_inr`, `partner_cost_inr`, `rework_cost_inr`
- `gross_contribution_inr`, `net_contribution_inr`, `profit_per_operator_hour_inr`
- `evidence_source_id`, `last_verified_at`, `confidence`

## Formula
```
direct_contribution =
  permitted_assistance_fee + received_commission
  - payment_processing_cost - printing_scanning_cost
  - partner_cost - rework_cost

net_contribution = direct_contribution - (employee_minutes/60 * burdened_hourly_labor_cost)
profit_per_operator_hour = net_contribution / (employee_minutes/60)
```

Aggregate across actual completed transactions by service and period; protect customer identity, separate fees paid on behalf of citizen from operator revenue. Publish `UNKNOWN` rather than a price copied from blogs.

## Candidate buckets to research (not ranking)
- Deadline-driven: MPESB, NSP, admissions/counselling
- Repeat tasks: certificate copies, corrections, receipt printing, utility support
- Skilled regulated work: pharmacist council, FDA drug shops, agricultural-input licences, GST compliance, FSSAI
- Local digital services: website, SEO, WhatsApp automation (private service agreements; no government source implied)

**Pricing compliance gates:** Government free registrations like Udyam and e-Shram are never claimed as paid government services. Specialist filings need verified permitted roles. Do not use expected gross customer bill as net margin.
