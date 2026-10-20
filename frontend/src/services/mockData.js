export const mockStats = {
  total_scans: 0,
  total_findings: 0,
  critical_issues: 0,
  high_issues: 0,
  medium_issues: 0,
  low_issues: 0,
  info_issues: 0,
  open_ports: 0,
  scan_activity_7d: [
    { day: "Mon", scans: 0 },
    { day: "Tue", scans: 0},
    { day: "Wed", scans:0 },
    { day: "Thu", scans: 0 },
    { day: "Fri", scans: 0},
    { day: "Sat", scans: 0},
    { day: "Sun", scans: 0}
  ],
  scan_activity_30d: Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    scans: 0
  })),
  scan_activity_90d: Array.from({ length: 12 }, (_, i) => ({
    day: `Wk ${i + 1}`,
    scans: 0
  })),
  recent_scans: []
};

export const mockFindings = [];

export const mockReports = [];
