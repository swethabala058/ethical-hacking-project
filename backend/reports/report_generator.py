import os
import datetime
from jinja2 import Template
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from database.models import Scan
from config import settings

class ReportGenerator:
    def __init__(self, scan: Scan):
        self.scan = scan

    def generate_html(self) -> str:
        html_template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Automated Security Scan Report #{{ scan.id }}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }
                .container { max-width: 900px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
                h1 { color: #38bdf8; border-bottom: 2px solid #334155; padding-bottom: 15px; margin-top: 0; }
                h2 { color: #f1f5f9; margin-top: 30px; }
                .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; background: #0f172a; padding: 20px; border-radius: 8px; }
                .meta-item { font-size: 14px; color: #94a3b8; }
                .meta-val { font-weight: bold; color: #e2e8f0; font-size: 16px; margin-top: 4px; }
                .stats-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 30px; }
                .card { padding: 15px; border-radius: 8px; text-align: center; }
                .critical { background: rgba(244, 63, 94, 0.15); border: 1px solid #f43f5e; color: #fda4af; }
                .high { background: rgba(249, 115, 22, 0.15); border: 1px solid #f97316; color: #ffedd5; }
                .medium { background: rgba(234, 179, 8, 0.15); border: 1px solid #eab308; color: #fef08a; }
                .low { background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; color: #bfdbfe; }
                .info { background: rgba(100, 116, 139, 0.15); border: 1px solid #64748b; color: #cbd5e1; }
                .num { font-size: 24px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; }
                th { background-color: #0f172a; color: #38bdf8; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Automated Security Scanner Report</h1>
                <div class="meta-grid">
                    <div class="meta-item">Target System<div class="meta-val">{{ scan.target }}</div></div>
                    <div class="meta-item">Scan ID<div class="meta-val">#{{ scan.id }}</div></div>
                    <div class="meta-item">Active Scanners<div class="meta-val">{{ scan.scanners }}</div></div>
                    <div class="meta-item">Scan Duration<div class="meta-val">{{ scan.duration_seconds }} seconds</div></div>
                </div>

                <h2>Executive Severity Summary</h2>
                <div class="stats-cards">
                    <div class="card critical"><div class="num">{{ scan.critical_count }}</div>Critical</div>
                    <div class="card high"><div class="num">{{ scan.high_count }}</div>High</div>
                    <div class="card medium"><div class="num">{{ scan.medium_count }}</div>Medium</div>
                    <div class="card low"><div class="num">{{ scan.low_count }}</div>Low</div>
                    <div class="card info"><div class="num">{{ scan.info_count }}</div>Info</div>
                </div>

                <h2>Vulnerability Details ({{ scan.findings|length }} Total)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Severity</th>
                            <th>Title</th>
                            <th>Scanner</th>
                            <th>Target / Route</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for item in scan.findings %}
                        <tr>
                            <td><span class="badge {{ item.severity.lower() }}">{{ item.severity }}</span></td>
                            <td><strong>{{ item.title }}</strong><br><small style="color:#94a3b8;">{{ item.description }}</small></td>
                            <td>{{ item.scanner }}</td>
                            <td>{{ item.url }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
        """
        template = Template(html_template)
        return template.render(scan=self.scan)

    def generate_pdf(self, output_path: str = None) -> str:
        if not output_path:
            filename = f"report_scan_{self.scan.id}.pdf"
            output_path = os.path.join(settings.REPORTS_DIR, filename)

        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=12
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor("#0284c7"),
            spaceAfter=10
        )
        body_style = ParagraphStyle(
            'DocBody',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor("#334155")
        )

        elements = []
        elements.append(Paragraph("AUTOMATED SECURITY SCANNER - EXECUTIVE REPORT", title_style))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=15))

        # Meta Details Table
        meta_data = [
            [Paragraph("<b>Target:</b>", body_style), Paragraph(str(self.scan.target), body_style),
             Paragraph("<b>Scan ID:</b>", body_style), Paragraph(f"#{self.scan.id}", body_style)],
            [Paragraph("<b>Scanners Used:</b>", body_style), Paragraph(str(self.scan.scanners), body_style),
             Paragraph("<b>Duration:</b>", body_style), Paragraph(f"{self.scan.duration_seconds}s", body_style)],
            [Paragraph("<b>Total Findings:</b>", body_style), Paragraph(str(self.scan.total_findings), body_style),
             Paragraph("<b>Status:</b>", body_style), Paragraph(str(self.scan.status), body_style)]
        ]
        meta_table = Table(meta_data, colWidths=[90, 180, 80, 180])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 15))

        # Executive Summary Metrics
        elements.append(Paragraph("Vulnerability Severity Breakdown", subtitle_style))
        summary_data = [
            ["Critical", "High", "Medium", "Low", "Informational"],
            [str(self.scan.critical_count), str(self.scan.high_count), str(self.scan.medium_count), str(self.scan.low_count), str(self.scan.info_count)]
        ]
        summary_table = Table(summary_data, colWidths=[106]*5)
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BACKGROUND', (0,1), (0,1), colors.HexColor("#fecdd3")),
            ('BACKGROUND', (1,1), (1,1), colors.HexColor("#ffedd5")),
            ('BACKGROUND', (2,1), (2,1), colors.HexColor("#fef08a")),
            ('BACKGROUND', (3,1), (3,1), colors.HexColor("#dbeafe")),
            ('BACKGROUND', (4,1), (4,1), colors.HexColor("#f1f5f9")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))

        # Detailed Findings Table
        elements.append(Paragraph("Detailed Security Findings", subtitle_style))
        findings_headers = ["Severity", "Title", "Scanner", "Target / Route"]
        findings_rows = [findings_headers]

        for item in self.scan.findings:
            sev_p = Paragraph(f"<b>{item.severity}</b>", body_style)
            title_p = Paragraph(f"<b>{item.title}</b><br/>{item.description}", body_style)
            scanner_p = Paragraph(item.scanner, body_style)
            url_p = Paragraph(item.url or "", body_style)
            findings_rows.append([sev_p, title_p, scanner_p, url_p])

        findings_table = Table(findings_rows, colWidths=[65, 235, 75, 155])
        findings_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0284c7")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,0), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(findings_table)

        doc.build(elements)
        return output_path
