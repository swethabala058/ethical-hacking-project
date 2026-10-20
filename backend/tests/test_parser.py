from utils.parser import parse_nmap_output, parse_nikto_output, parse_bandit_output

def test_parse_nmap_output():
    sample_text = "80/tcp open http Apache/2.4.52"
    findings = parse_nmap_output(sample_text, "127.0.0.1")
    assert len(findings) == 1
    assert findings[0]["scanner"] == "Nmap"
    assert findings[0]["port"] == 80

def test_parse_nikto_output():
    sample_text = "+ The X-Frame-Options header is not set. Vulnerable to Clickjacking."
    findings = parse_nikto_output(sample_text, "http://127.0.0.1")
    assert len(findings) == 1
    assert findings[0]["scanner"] == "Nikto"

def test_parse_bandit_output():
    sample_json = '{"results": [{"test_id": "B602", "issue_severity": "HIGH", "issue_text": "subprocess with shell=True", "filename": "app.py", "line_number": 10}]}'
    findings = parse_bandit_output(sample_json, "/path/to/project")
    assert len(findings) == 1
    assert findings[0]["scanner"] == "Bandit"
    assert findings[0]["severity"] == "High"
