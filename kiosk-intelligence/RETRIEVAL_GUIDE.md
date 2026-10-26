# Find Any Detail Fast — Retrieval Rules

**Primary navigation:** `README.md` → `service_id`. Never hunt through 500 folders or 500 PDF filenames.

## Exact searches the system must support

| User asks | Query / join | Response should return |
|---|---|---|
| "फार्मेसी वाले सभी काम" | audience=PHARMACY, sector=HEALTH/BUSINESS | service names, links, required licence/authorization, verified status |
| "छात्रों के इस महीने खुले फॉर्म" | audience=STUDENT + current month overlaps `cycle_events` | active cycles, precise deadlines, notices, source dates |
| "कल बंद हो रहे फॉर्म" | cycle end within requested local date | verified application close events; corrections listed separately |
| "सबसे अधिक मार्जिन" | `business_metrics` filtered to region and period | net profit, costs, observation count, confidence (not guesses) |
| "समग्र eKYC में कौन सा स्टेप" | service ID + current recipe version | official link by step, prerequisites, checkpoints, recovery |
| "पासपोर्ट के लिए क्या documents" | service ID + applicant conditions + document rules | required/conditional alternatives with official citation |
| "नया notice आया क्या?" | `change_requests` + `source_registry` | change summary and reviewer status |
| "जावरा में छात्रों को क्या प्रचार करें" | audience, locality, active cycles, marketing restrictions | eligible service set, timing, approved non-misleading draft |
| "कौन सा काम अभी verification में अटका है" | verification_status=NEEDS_REVIEW | missing evidence, assignee and source links |
| "पिछले वर्ष इस फॉर्म का टाइम" | service ID + historic cycle year | historical dates explicitly not projected next-year dates |

## Answer format (human / AI)

Always present, when relevant:

```text
Service: [official name] / ID: [service_id]
Applies to: [area and audience]
Current stage: [apply/correction/result/etc.]
Window: [start to end, timezone] OR [not yet announced]
Documents: [mandatory] / [conditional] / [unknown]
Official path: [verified stage-specific URL]
Official fee: [amount or unknown] / Assistance fee: [permitted rate or unknown]
Research status: [VERIFIED / NEEDS_REVIEW]
Last verified: [timestamp]
Evidence: [source_id and official URL]
```

Show unknown as unknown; do not invent values to make a row look complete.

## Search quality rules

1. First normalize aliases, Hindi/Hinglish names and spelling variants to `service_id`.
2. Apply filters area, audience, stage, cycle, time, verification and commercial relevance.
3. For exact numerical/regulatory facts, query structured fields first; use lexical/semantic search to discover supporting documents.
4. Search public Knowledge Base only; citizen identity must be accessed through a separate authorized case lookup.
5. Rank results by official status, relevance, most recent approved fact and source authority.
6. Return the minimal answer for the question; provide a link to full dossier for deeper detail.
7. For changes show old value, new value, source and approval audit; never replace historic records silently.

## Service ID example

One service ID `IN-MP-EXAM-0001` may have:
- audience links: STUDENT, JOB-SEEKER
- sector: GOVERNMENT-EXAM
- multiple cycles across years
- multiple stage links for apply/correction/admit card/result
- document rules and independent official sources
- region-specific profitability observations

**Do not create another 'service' record merely because it also appears on a Student page, Ratlam page or High-Margin page.**
