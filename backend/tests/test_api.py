import pytest
from app.core.security import hash_api_key, generate_api_key
from app.workers.alert_engine import AlertEngine


def test_api_key_generation_and_hashing():
    raw_key = generate_api_key("drive")
    assert raw_key.startswith("es_drive_")
    key_hash = hash_api_key(raw_key)
    assert len(key_hash) == 64
    # Deterministic hash check
    assert hash_api_key(raw_key) == key_hash


def test_event_contract_structure():
    sample_event = {
        "event_id": "test-uuid-1",
        "event_type": "file.downloaded",
        "event_version": 1,
        "application": "drive",
        "actor": {
            "issuer": "https://sso-a.oussamma.tn",
            "sub": "user-oussamma-001",
        },
        "outcome": "success",
    }
    assert sample_event["event_version"] == 1
    assert sample_event["actor"]["sub"] == "user-oussamma-001"
