# Form Date & Portal Monitoring — Initial Watchlist

Monitoring has **NOT been deployed as an always-running crawler** as of this research commit. This file is a proposed monitored-source registry and alert policy; a separate scheduled task can send notifications where configured.

## Daily during live form cycles
| Priority | Source ID | Check for |
| --- | --- | --- |
| P0 | SRC-001, SRC-002 | MPESB opened/reopened/extended application; correction dates; rulebook corrections; exam/admit/result notices |
| P0 | SRC-003, SRC-004 | NSP new schemes, student application closing, institute and level-2 verification, scheme update |
| P1 | SRC-005 | MP service additions, eligibility/process changes; rate limits and permitted access |
| P1 | SRC-027 | e-Uparjan crop-season registration notices; authorized kiosks |
| P1 | SRC-022 | MP Pharmacy Council new registration/correction rules, portal status |

## Weekly
SRC-006 PM-Kisan; SRC-007 eShram; SRC-008 ECI; SRC-009/010 Passport; SRC-011 FSSAI; SRC-012 Udyam; SRC-013 EPFO; SRC-014 NTA; SRC-017/018 GST; SRC-023/024 MP FDA drug licence; SRC-025/028/029/030 agricultural input licences.

## Monitor architecture
Fetch permitted official source → extract stage facts with citation → compare to last approved snapshot → classify 'new, changed, retracted, unverifiable' → create review task. High-risk fee/eligibility/date changes require human approval before public catalog update and before portal recipe release.

## Date policy
Store `YYYY-MM-DD` if official source specifies date but no hour. Never assume 23:59 or interpret an unverified old schedule as current. Keep old notice/source, effective date and superseded version.

## Alerts
Deadline approaching 7 days / 3 days / 1 day; changed notification; broken official link; withdrawn notice; source no longer reachable. Only notify on confirmed change or time trigger, not mere re-crawls.

## Marketing use
Draft consent-based awareness messages with official notice citation, truthful fee, verified date and region; no implied government affiliation.

## Data protection
No OTPs, applicant identities or authenticated portal sessions in monitoring crawler. Public notices only.
