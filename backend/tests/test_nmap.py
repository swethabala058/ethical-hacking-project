from scanner.nmap_scanner import NmapScanner

def test_nmap_simulation_fallback():
    scanner = NmapScanner("127.0.0.1")
    logs = []
    def log_cb(msg):
        logs.append(msg)
        
    findings = scanner.run(log_callback=log_cb)
    assert len(findings) > 0
    assert any("Nmap" in f["scanner"] for f in findings)
    assert len(logs) > 0
