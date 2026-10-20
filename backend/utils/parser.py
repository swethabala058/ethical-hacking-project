import json
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
from datetime import datetime

SEVERITY_MAPPING = {
    "CRITICAL": "Critical",
    "HIGH": "High",
    "MEDIUM": "Medium",
    "LOW": "Low",
    "INFO": "Informational",
    "INFORMATIONAL": "Informational",
    "3": "High",
    "2": "Medium",
    "1": "Low",
    "0": "Informational"
}

def normalize_severity(sev: str) -> str:
    cleaned = str(sev).strip().upper()
    return SEVERITY_MAPPING.get(cleaned, "Medium")

def parse_nmap_output(raw_output: str, target: str) -> List[Dict[str, Any]]:
    findings = []
    
    # Try parsing XML if Nmap XML output was captured
    if "<nmaprun" in raw_output:
        try:
            root = ET.fromstring(raw_output)
            for host in root.findall('host'):
                ports = host.find('ports')
                if ports is not None:
                    for port in ports.findall('port'):
                        state_elem = port.find('state')
                        if state_elem is not None and state_elem.attrib.get('state') == 'open':
                            port_num = int(port.attrib.get('portid', 0))
                            protocol = port.attrib.get('protocol', 'tcp')
                            service_elem = port.find('service')
                            
                            service_name = service_elem.attrib.get('name', 'unknown') if service_elem is not None else 'unknown'
                            service_product = service_elem.attrib.get('product', '') if service_elem is not None else ''
                            service_version = service_elem.attrib.get('version', '') if service_elem is not None else ''
                            
                            version_info = f"{service_product} {service_version}".strip()
                            desc = f"Port {port_num}/{protocol} is open running {service_name}."
                            if version_info:
                                desc += f" Detected version: {version_info}."

                            findings.append({
                                "scanner": "Nmap",
                                "target": target,
                                "severity": "Medium" if port_num in [21, 22, 23, 3389, 1433, 3306] else "Low",
                                "title": f"Open Port Detected ({port_num}/{protocol.upper()})",
                                "description": desc,
                                "solution": "Restrict port access using firewall rules if the service is not required to be public.",
                                "url": f"{target}:{port_num}",
                                "port": port_num,
                                "timestamp": datetime.utcnow().isoformat()
                            })
            if findings:
                return findings
        except Exception:
            pass

    # Plain text parsing fallback
    for line in raw_output.splitlines():
        if "/tcp" in line or "/udp" in line:
            parts = line.split()
            if len(parts) >= 3 and parts[1] == "open":
                port_proto = parts[0]
                port_num = int(port_proto.split('/')[0]) if '/' in port_proto else 0
                service = parts[2]
                version = " ".join(parts[3:]) if len(parts) > 3 else ""

                findings.append({
                    "scanner": "Nmap",
                    "target": target,
                    "severity": "Medium" if port_num in [21, 22, 23, 3389, 1433, 3306] else "Low",
                    "title": f"Open Port: {port_proto}",
                    "description": f"Port {port_proto} is open for service '{service}'. {version}".strip(),
                    "solution": "Ensure service is updated and secured with authorization and network firewalls.",
                    "url": f"{target}:{port_num}",
                    "port": port_num,
                    "timestamp": datetime.utcnow().isoformat()
                })

    return findings

def parse_nikto_output(raw_output: str, target: str) -> List[Dict[str, Any]]:
    findings = []
    
    # Try parsing JSON if available
    try:
        data = json.loads(raw_output)
        vulnerabilities = data.get("vulnerabilities", [])
        for item in vulnerabilities:
            findings.append({
                "scanner": "Nikto",
                "target": target,
                "severity": normalize_severity(item.get("msg", "")),
                "title": item.get("id", "Web Server Misconfiguration"),
                "description": item.get("msg", "Nikto web security finding."),
                "solution": "Review web server headers, file permissions, and software versions.",
                "url": item.get("url", target),
                "port": int(item.get("port", 80)),
                "timestamp": datetime.utcnow().isoformat()
            })
        if findings:
            return findings
    except Exception:
        pass

    # Line by line Nikto text parsing fallback
    for line in raw_output.splitlines():
        if line.startswith("+"):
            text = line.lstrip("+ ").strip()
            if not text or "Nikto v" in text or "Target IP:" in text or "Target Hostname:" in text:
                continue

            severity = "Low"
            if any(k in text.lower() for k in ["vulnerability", "xss", "injection", "rce", "exploit"]):
                severity = "High"
            elif any(k in text.lower() for k in ["missing header", "clickjacking", "nosniff", "x-frame-options"]):
                severity = "Medium"

            findings.append({
                "scanner": "Nikto",
                "target": target,
                "severity": severity,
                "title": "Web Server Issue",
                "description": text,
                "solution": "Configure security headers (HSTS, CSP, X-Frame-Options) and keep web server updated.",
                "url": target,
                "port": 80 if "http://" in target else 443,
                "timestamp": datetime.utcnow().isoformat()
            })

    return findings

def parse_zap_output(raw_output: str, target: str) -> List[Dict[str, Any]]:
    findings = []
    try:
        data = json.loads(raw_output)
        site_alerts = data.get("site", [])
        alerts = site_alerts[0].get("alerts", []) if site_alerts else data.get("alerts", [])
        
        for alert in alerts:
            risk = alert.get("riskdesc", alert.get("risk", "Low")).split()[0]
            findings.append({
                "scanner": "OWASP ZAP",
                "target": target,
                "severity": normalize_severity(risk),
                "title": alert.get("name", alert.get("alert", "OWASP ZAP Alert")),
                "description": alert.get("desc", alert.get("description", "Vulnerability detected by OWASP ZAP.")),
                "solution": alert.get("solution", "Apply input validation, escaping, and secure configuration."),
                "url": alert.get("url", target),
                "port": 80,
                "timestamp": datetime.utcnow().isoformat()
            })
    except Exception:
        # Fallback text parsing
        for line in raw_output.splitlines():
            if "Alert:" in line or "Risk:" in line:
                findings.append({
                    "scanner": "OWASP ZAP",
                    "target": target,
                    "severity": "High" if "High" in line else "Medium",
                    "title": line.strip(),
                    "description": "OWASP ZAP vulnerability alert.",
                    "solution": "Remediate application code flaws according to OWASP guidelines.",
                    "url": target,
                    "port": 80,
                    "timestamp": datetime.utcnow().isoformat()
                })

    return findings

def parse_bandit_output(raw_output: str, target: str) -> List[Dict[str, Any]]:
    findings = []
    try:
        data = json.loads(raw_output)
        results = data.get("results", [])
        for item in results:
            findings.append({
                "scanner": "Bandit",
                "target": target,
                "severity": normalize_severity(item.get("issue_severity", "LOW")),
                "title": f"{item.get('test_name', 'Security Issue')} ({item.get('test_id', 'B000')})",
                "description": f"{item.get('issue_text', 'Potential code flaw')} in {item.get('filename', '')} at line {item.get('line_number', 0)}.",
                "solution": "Refactor code to avoid unsafe functions (e.g., exec, eval, hardcoded secrets, shell=True).",
                "url": f"{item.get('filename', '')}#L{item.get('line_number', 0)}",
                "port": 0,
                "timestamp": datetime.utcnow().isoformat()
            })
    except Exception:
        pass

    return findings
