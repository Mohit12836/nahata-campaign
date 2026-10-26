#!/usr/bin/env python3
"""Validate public kiosk-intelligence CSV catalogs with Python stdlib only.

Usage: python kiosk-intelligence/tools/validate_catalog.py
Never validates personal data because personal data must not exist in this repo.
"""
from __future__ import annotations

import csv
import datetime as dt
import pathlib
import sys
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[1] / "catalog"
FILES = {
    "services": ("services.csv", "service_id", {"service_id", "status", "official_source_id", "last_verified_at"}),
    "cycles": ("form-cycles.csv", "cycle_id", {"cycle_id", "service_id", "stage", "status", "source_id"}),
    "sources": ("sources.csv", "source_id", {"source_id", "official_url", "verification_status"}),
}
PII_HEADERS = {"aadhaar", "aadhaar_number", "otp", "password", "phone", "mobile", "applicant_name", "dob", "bank_account"}
VALID_STATUSES = {"CANDIDATE", "DRAFT", "NEEDS_REVIEW", "VERIFIED", "RETIRED"}
CYCLE_STATUSES = {"NOT_ANNOUNCED", "OPEN", "CLOSED", "EXTENDED", "CANCELLED", "NEEDS_REVIEW"}
errors: list[str] = []
tables: dict[str, list[dict[str, str]]] = {}

def err(msg: str) -> None:
    errors.append(msg)

def iso_datetime(value: str) -> bool:
    try:
        if len(value) == 10 and value[4] == "-" and value[7] == "-":
            dt.date.fromisoformat(value)
            return True  # Official notices often specify the DATE only; do not invent a closing time.
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.tzinfo is not None
    except ValueError:
        return False

for kind, (filename, id_col, required_cols) in FILES.items():
    path = ROOT / filename
    if not path.is_file():
        err(f"Missing catalog file: {filename}")
        continue
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        cols = set(reader.fieldnames or [])
        if not required_cols.issubset(cols):
            err(f"{filename}: missing columns {sorted(required_cols - cols)}")
        bad_cols = sorted(cols.intersection(PII_HEADERS))
        if bad_cols:
            err(f"{filename}: personal-data columns prohibited in public catalog: {bad_cols}")
        rows = list(reader)
    seen: set[str] = set()
    for rowno, row in enumerate(rows, start=2):
        ident = (row.get(id_col) or "").strip()
        if kind == "cycles":
            ident = ident + "::" + (row.get("stage") or "").strip()
        if not (row.get(id_col) or "").strip():
            err(f"{filename}:{rowno} missing {id_col}")
        if ident in seen:
            err(f"{filename}:{rowno} duplicate {id_col}={ident}")
        seen.add(ident)
        if any(v is None for v in row.values()):
            err(f"{filename}:{rowno} malformed CSV column count")
    tables[kind] = rows

source_ids = {r.get("source_id", "").strip() for r in tables.get("sources", [])}
service_ids = {r.get("service_id", "").strip() for r in tables.get("services", [])}

for row in tables.get("sources", []):
    url = (row.get("official_url") or "").strip()
    if url and not (urlparse(url).scheme == "https" and urlparse(url).netloc):
        err(f"source {row.get('source_id')}: official_url must be https")
    if row.get("verification_status") == "VERIFIED" and not row.get("checked_at"):
        err(f"source {row.get('source_id')}: VERIFIED source requires checked_at")

for row in tables.get("services", []):
    sid = row.get("service_id")
    status = (row.get("status") or "").strip()
    if status not in VALID_STATUSES:
        err(f"service {sid}: invalid status {status}")
    source = (row.get("official_source_id") or "").strip()
    if source and source not in source_ids:
        err(f"service {sid}: missing source reference {source}")
    if status == "VERIFIED" and (not source or not row.get("last_verified_at")):
        err(f"service {sid}: VERIFIED needs official source and last_verified_at")

for row in tables.get("cycles", []):
    cid = row.get("cycle_id")
    sid = (row.get("service_id") or "").strip()
    if sid not in service_ids:
        err(f"cycle {cid}: unknown service_id {sid}")
    status = (row.get("status") or "").strip()
    if status not in CYCLE_STATUSES:
        err(f"cycle {cid}: invalid status {status}")
    source = (row.get("source_id") or "").strip()
    if source and source not in source_ids:
        err(f"cycle {cid}: missing source reference {source}")
    if status in {"OPEN", "CLOSED", "EXTENDED"} and not source:
        err(f"cycle {cid}: official source required for status {status}")
    for col in ("start_at", "end_at"):
        value = (row.get(col) or "").strip()
        if value and not iso_datetime(value):
            err(f"cycle {cid}: {col} needs ISO date (YYYY-MM-DD) or ISO date/time with offset")
    if (row.get("start_at") or row.get("end_at")) and not source:
        err(f"cycle {cid}: source required for dates")

if errors:
    print("CATALOG VALIDATION FAILED:")
    for e in errors:
        print("-", e)
    sys.exit(1)

print("Catalog structure OK:", ", ".join(f"{k}={len(v)}" for k, v in tables.items()))
if not tables.get("services"):
    print("No verified services published yet; structure-only stage.")
