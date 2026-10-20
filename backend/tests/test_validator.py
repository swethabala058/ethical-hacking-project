import pytest
from utils.validator import validate_target

def test_validate_target_empty():
    is_valid, target, msg = validate_target("")
    assert not is_valid
    assert "empty" in msg.lower()

def test_validate_target_command_injection():
    is_valid, target, msg = validate_target("http://example.com; rm -rf /")
    assert not is_valid
    assert "forbidden" in msg.lower()

def test_validate_target_valid_domain():
    is_valid, target, msg = validate_target("https://example.com")
    assert is_valid
    assert target == "https://example.com"

def test_validate_target_valid_ip():
    is_valid, target, msg = validate_target("192.168.1.10")
    assert is_valid
    assert target == "192.168.1.10"
