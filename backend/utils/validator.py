import re
import os
import urllib.parse
import ipaddress
from typing import Tuple, Optional

def validate_target(target: str, scan_type: str = "web") -> Tuple[bool, str, str]:
    """
    Validates user input target URL, IP address, or filesystem path.
    Returns: (is_valid: bool, cleaned_target: str, message: str)
    """
    if not target or not target.strip():
        return False, "", "Target input cannot be empty."

    target = target.strip()
    
    # Check for dangerous command injection characters
    dangerous_chars = [';', '&&', '||', '`', '$(', '>', '<', '|', '\n', '\r']
    for char in dangerous_chars:
        if char in target:
            return False, "", f"Security Warning: Target contains forbidden characters ({char})."

    if scan_type == "bandit":
        # Target must be a valid directory path
        if not os.path.exists(target):
            return False, "", f"Directory does not exist: {target}"
        if not os.path.isdir(target):
            return False, "", f"Path is not a directory: {target}"
        return True, os.path.abspath(target), "Valid local directory target."

    # Handle IP Addresses or Network ranges
    try:
        ip = ipaddress.ip_address(target)
        return True, str(ip), "Valid IP address target."
    except ValueError:
        pass

    try:
        network = ipaddress.ip_network(target, strict=False)
        return True, str(network), "Valid CIDR network target."
    except ValueError:
        pass

    # Handle Web URLs / Hostnames
    if not (target.startswith("http://") or target.startswith("https://")):
        target_to_parse = f"http://{target}"
    else:
        target_to_parse = target

    try:
        parsed = urllib.parse.urlparse(target_to_parse)
        hostname = parsed.hostname
        if not hostname:
            return False, "", "Invalid target domain or hostname."
            
        # Basic domain format check
        domain_regex = r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost$'
        if not re.match(domain_regex, hostname):
            return False, "", f"Invalid hostname syntax: {hostname}"

        return True, target, "Valid domain/URL target."
    except Exception as e:
        return False, "", f"URL parsing error: {str(e)}"

def sanitize_arg(argument: str) -> str:
    """Removes non-alphanumeric characters except standard path/URL safe chars."""
    return re.sub(r'[^a-zA-Z0-9\.\:\/\_\-\=]', '', argument)
