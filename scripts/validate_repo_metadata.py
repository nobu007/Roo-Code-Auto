#!/usr/bin/env python3
"""Validate repository goal metadata and its source provenance."""
import hashlib
import json
import re
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_STATUS = {"unknown", "not_started", "in_progress", "verifying", "achieved", "blocked"}

def fail(message: str) -> None:
    raise SystemExit(message)

def exact_keys(value, keys, label):
    if not isinstance(value, dict) or set(value) != set(keys):
        fail(f"{label} must contain exactly: {', '.join(keys)}")

def source_blob(path: Path, hex_length: int) -> str:
    raw = path.read_bytes()
    header = b"blob " + str(len(raw)).encode() + b"\0"
    algorithm = hashlib.sha1 if hex_length == 40 else hashlib.sha256
    return "git-blob:" + algorithm(header + raw).hexdigest()

try:
    meta = json.loads((ROOT / "REPO_METADATA.json").read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    fail(f"REPO_METADATA.json is unreadable: {exc}")
exact_keys(meta, ("schema_version", "long_term", "short_term", "verified_at"), "metadata")
if meta["schema_version"] != 1:
    fail("schema_version must be 1")

for key in ("long_term", "short_term"):
    item = meta[key]
    required = ("summary", "source", "source_hash", "updated_at")
    exact_keys(item, required + (("status",) if key == "short_term" else ()), key)
    summary, source, expected_hash, updated = (item.get(k) for k in required)
    if summary is None:
        if any(value is not None for value in (source, expected_hash, updated)):
            fail(f"{key}: null summary requires null provenance and date")
        if key == "short_term" and item["status"] != "unknown":
            fail("null short_term must use status=unknown")
        continue
    if not isinstance(summary, str) or not 1 <= len(summary) <= 240:
        fail(f"{key}: summary length must be 1..240")
    if not isinstance(source, str) or not source:
        fail(f"{key}: source is required")
    source_path, _, anchor = source.partition("#")
    resolved = (ROOT / source_path).resolve()
    if not resolved.is_relative_to(ROOT) or not resolved.is_file():
        fail(f"{key}: source must be a repository file: {source_path}")
    if not isinstance(expected_hash, str) or not re.fullmatch(r"git-blob:(?:[a-f0-9]{40}|[a-f0-9]{64})", expected_hash):
        fail(f"{key}: invalid git blob hash")
    if source_blob(resolved, len(expected_hash.split(":", 1)[1])) != expected_hash:
        fail(f"{key}: source_hash mismatch")
    if anchor and anchor.casefold() not in resolved.read_text(encoding="utf-8").casefold():
        fail(f"{key}: source anchor not found: {anchor}")
    if not isinstance(updated, str):
        fail(f"{key}: updated_at date is required")
    try:
        date.fromisoformat(updated)
    except ValueError:
        fail(f"{key}: updated_at must be an ISO date")
    if key == "short_term" and item["status"] not in ALLOWED_STATUS - {"unknown"}:
        fail("short_term has invalid status")
verified = meta["verified_at"]
if not isinstance(verified, str):
    fail("verified_at is required")
try:
    datetime.fromisoformat(verified.replace("Z", "+00:00"))
except ValueError:
    fail("verified_at must be an ISO datetime")
print("REPO_METADATA.json provenance is valid")
