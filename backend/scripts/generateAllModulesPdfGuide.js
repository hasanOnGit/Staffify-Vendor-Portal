const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const screenshotsDir = "/home/mohdhasan/.gemini/antigravity/brain/eb983ec5-df43-461a-a3aa-8401b910ae3b/screenshots";
const pdfOutPath = "/home/mohdhasan/Downloads/StaffifyGo/docs/StaffifyGo_Complete_Modules_Guide.pdf";
const artifactPdfPath = "/home/mohdhasan/.gemini/antigravity/brain/eb983ec5-df43-461a-a3aa-8401b910ae3b/StaffifyGo_Complete_Modules_Guide.pdf";

function getBase64Img(filename) {
  const p = path.join(screenshotsDir, filename);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p).toString("base64");
    return `data:image/png;base64,${data}`;
  }
  return "";
}

const images = {
  dashboard: getBase64Img("01_dashboard.png"),
  workers: getBase64Img("02_workers_directory.png"),
  onboardModal: getBase64Img("03_onboard_worker_modal.png"),
  gatePass: getBase64Img("04_worker_gate_pass.png"),
  profileDrawer: getBase64Img("05_worker_profile_drawer.png"),
  hiringDemands: getBase64Img("06_hiring_demands.png"),
  aiMatch: getBase64Img("07_smart_ai_match_modal.png"),
  deployments: getBase64Img("08_work_assignments.png"),
  shifts: getBase64Img("09_shift_rosters.png"),
  attendance: getBase64Img("10_attendance_muster_roll.png"),
  loans: getBase64Img("11_worker_advances_loans.png"),
  compliance: getBase64Img("12_statutory_compliance.png"),
  payroll: getBase64Img("13_salaries_payroll.png"),
  payslip: getBase64Img("14_form_xix_payslip.png"),
  settlements: getBase64Img("15_worker_exits_settlements.png"),
  aiWatchdog: getBase64Img("16_ai_copilot_watchdog.png"),
  clients: getBase64Img("17_clients_directory.png"),
  agencies: getBase64Img("18_agencies_directory.png"),
  commercials: getBase64Img("19_contracts_budgets.png"),
  invoices: getBase64Img("20_invoices_payments.png"),
  taxInvoice: getBase64Img("21_tax_invoice_modal.png"),
  bankCmsModal: getBase64Img("22_bank_cms_payout_modal.png"),
  notificationLogModal: getBase64Img("23_notification_log_modal.png"),
  complianceExporters: getBase64Img("24_compliance_statutory_exporters.png"),
};

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StaffifyGo Enterprise ERP — Complete Modules & Functionality Guide</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #172B4D;
      background: #FFFFFF;
      font-size: 10pt;
      line-height: 1.48;
      -webkit-font-smoothing: antialiased;
    }
    .page-break { page-break-before: always; break-before: page; }
    .avoid-break { page-break-inside: avoid; break-inside: avoid; }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 30px 15px 15px 15px;
    }
    .brand-header { display: flex; align-items: center; gap: 12px; }
    .brand-logo {
      background: #0052CC;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 20pt;
      padding: 8px 18px;
      border-radius: 8px;
      letter-spacing: -0.5px;
    }
    .badge-go {
      background: #DEEBFF;
      color: #0052CC;
      font-size: 11pt;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
      text-transform: uppercase;
    }
    .cover-hero { margin-top: 50px; }
    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      color: #091E42;
      line-height: 1.15;
      letter-spacing: -0.8px;
      margin-bottom: 12px;
    }
    .cover-subtitle {
      font-size: 13pt;
      color: #42526E;
      line-height: 1.4;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .cover-divider {
      width: 80px;
      height: 4px;
      background: #0052CC;
      border-radius: 2px;
      margin-bottom: 20px;
    }
    .cover-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 15px;
    }
    .cover-card {
      background: #F4F5F7;
      border: 1px solid #DFE1E6;
      border-radius: 6px;
      padding: 9px 12px;
      font-size: 9.5pt;
      font-weight: 600;
      color: #172B4D;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cover-dot { width: 7px; height: 7px; border-radius: 50%; background: #0052CC; }
    .cover-footer {
      border-top: 2px solid #EBECF0;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      color: #6B778C;
      font-size: 8.5pt;
    }

    /* Headings */
    h1.section-title {
      font-size: 17pt;
      font-weight: 800;
      color: #091E42;
      border-bottom: 2px solid #0052CC;
      padding-bottom: 5px;
      margin-bottom: 10px;
      letter-spacing: -0.3px;
    }
    h2.subsection-title {
      font-size: 12.5pt;
      font-weight: 700;
      color: #172B4D;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    p { margin-bottom: 8px; color: #344563; font-size: 9.8pt; }

    /* Lozenges */
    .lozenge {
      display: inline-block;
      font-size: 7.8pt;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .lozenge-success { background: #E3FCEF; color: #00875A; }
    .lozenge-warning { background: #FFF0B3; color: #B9770E; }
    .lozenge-danger { background: #FFEBE6; color: #DE350B; }
    .lozenge-info { background: #DEEBFF; color: #0052CC; }

    /* Callouts */
    .callout {
      border-left: 4px solid #0052CC;
      background: #F4F5F7;
      padding: 8px 12px;
      border-radius: 0 5px 5px 0;
      margin: 10px 0;
      font-size: 9.3pt;
    }
    .callout.tip { border-color: #00875A; background: #F3FCF7; }
    .callout.warning { border-color: #B9770E; background: #FFFCF0; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px 0;
      font-size: 8.8pt;
    }
    th {
      background: #F4F5F7;
      color: #42526E;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border-bottom: 2px solid #DFE1E6;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.4px;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #EBECF0;
      color: #172B4D;
      vertical-align: top;
    }
    tr:nth-child(even) td { background: #FAFBFC; }

    /* Screenshots */
    .screenshot-container {
      margin: 10px 0 12px 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #DFE1E6;
      box-shadow: 0 2px 5px rgba(9, 30, 66, 0.08);
      background: #FFFFFF;
    }
    .screenshot-caption {
      background: #F4F5F7;
      padding: 4px 8px;
      font-size: 8pt;
      font-weight: 600;
      color: #5E6C84;
      border-top: 1px solid #DFE1E6;
      display: flex;
      justify-content: space-between;
    }
    img.screenshot { width: 100%; height: auto; display: block; }

    ol.steps { margin-left: 18px; margin-bottom: 8px; font-size: 9.3pt; }
    ol.steps li { margin-bottom: 4px; color: #253858; }
    ol.steps li strong { color: #091E42; }

    ul.bullets { margin-left: 18px; margin-bottom: 8px; font-size: 9.3pt; }
    ul.bullets li { margin-bottom: 3px; color: #344563; }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-page">
    <div>
      <div class="brand-header">
        <div class="brand-logo">Staffify</div>
        <span class="badge-go">GO</span>
        <span style="color: #6B778C; font-size: 11pt; font-weight: 600; margin-left: 10px;">Enterprise Vendor &amp; Staffing Management</span>
      </div>

      <div class="cover-hero">
        <div class="cover-title">All Modules &amp; System Capabilities Guide</div>
        <div class="cover-subtitle">Comprehensive Reference Manual: Detailed Functions, User Actions, Business Logic, and UI Walkthroughs for All 15 Platform Modules in Simple, Clear English.</div>
        <div class="cover-divider"></div>
        <p style="font-size: 10pt; color: #505F79; max-width: 620px;">
          This manual covers every module of the StaffifyGo platform. It explains the operational purpose of each screen, what administrators and agency managers can do, what happens behind the scenes, and how all modules interconnect to deliver end-to-end staffing compliance.
        </p>

        <div class="cover-grid">
          <div class="cover-card"><div class="cover-dot"></div> Module 1: Dashboard &amp; Overview</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 2: Hiring Demands &amp; AI Matching</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 3: Workers Directory &amp; KYC</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 4: Work Assignments &amp; Deployments</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 5: Shift Schedules &amp; Squad Rosters</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 6: Attendance &amp; Overtime Muster Roll</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 7: Worker Advances &amp; Loans</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 8: Statutory Compliance (Form B &amp; D)</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 9: Monthly Salaries &amp; Payslips</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 10: Client Contracts, POs &amp; Rate Cards</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 11: Invoicing &amp; Collections (18% GST)</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 12: Clients &amp; Work Sites Directory</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 13: Staffing Agencies Directory</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 14: Worker Exits &amp; Final Settlements</div>
          <div class="cover-card"><div class="cover-dot"></div> Module 15: Autonomous AI Risk Watchdog</div>
          <div class="cover-card"><div class="cover-dot"></div> SOP Matrix: Full Lifecycle Integration</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div>
        <strong>StaffifyGo Enterprise Platform</strong><br>
        Complete Modules Manual | Standard Operating Procedure (SOP)<br>
        Target System: <span style="color: #0052CC; font-weight: 600;">Staffify-Vendor-Portal</span> &bull; Branch: <strong>main</strong>
      </div>
      <div style="text-align: right;">
        Author: <strong>Enterprise HR &amp; Operations Team</strong><br>
        Release Date: November 2026<br>
        Classification: <strong>Confidential / System Reference Manual</strong>
      </div>
    </div>
  </div>

  <!-- ==================== MODULE 1: DASHBOARD ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 1: Executive Dashboard &amp; Operations Monitoring</h1>
  <p><strong>Route:</strong> <code>/dashboard</code> (or <code>/</code>)</p>
  <p>
    The <strong>Executive Dashboard</strong> provides real-time situational awareness across all field operations, client accounts, workforce deployments, and cash flow. It pulls data dynamically from all underlying modules.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.dashboard}" class="screenshot" alt="Dashboard" />
    <div class="screenshot-caption">
      <span>Figure 1.1 — Executive Dashboard &amp; Live Operations Overview</span>
      <span>Route: /dashboard</span>
    </div>
  </div>

  <h2 class="subsection-title">What the Admin Can Do Here</h2>
  <ul class="bullets">
    <li><strong>Monitor Workforce Deployment</strong>: View immediate headcount counts of contractors working on site vs. sitting on the bench.</li>
    <li><strong>Track Client Budget Utilization</strong>: Real-time progress bars highlight Purchase Orders (POs) reaching 60% (warning) or 80% (critical burn).</li>
    <li><strong>Review Receivables &amp; Cash Flow</strong>: Tracks outstanding client tax invoices to ensure salary funds are collected in advance.</li>
    <li><strong>1-Click Quick Actions</strong>: Direct shortcuts to <em>Add New Worker</em>, <em>Assign Worker to Site</em>, <em>Record Attendance &amp; OT</em>, and <em>Create Client Bill</em>.</li>
  </ul>

  <!-- ==================== MODULE 2: HIRING DEMANDS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 2: Client Manpower Requisitions &amp; Demand Management</h1>
  <p><strong>Route:</strong> <code>/requisitions</code></p>
  <p>
    When client organizations require additional labor, site supervisors or account managers log headcount demands here. The system monitors quota fulfillment and uses AI to recommend candidates instantly.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.hiringDemands}" class="screenshot" alt="Hiring Demands" />
    <div class="screenshot-caption">
      <span>Figure 2.1 — Client Workforce Demands &amp; Fulfillment Tracking</span>
      <span>Route: /requisitions</span>
    </div>
  </div>

  <h2 class="subsection-title">Key Capabilities &amp; Workflow</h2>
  <ol class="steps">
    <li><strong>Post Job Demand</strong>: Specify Client, Site Location, Trade Category (e.g., Security, IT, Facilities), Positions Needed, Urgency Level (<span class="lozenge lozenge-danger">CRITICAL</span>, <span class="lozenge lozenge-warning">HIGH</span>, <span class="lozenge lozenge-info">STANDARD</span>), and Agreed Commercial Bill Rate.</li>
    <li><strong>Fulfillment Progress Bars</strong>: Displays live progress (e.g. <em>1 / 5 Filled - 4 remaining</em>).</li>
    <li><strong>1-Click AI Smart Match</strong>: Click <em>Allocate</em>, then click <em>AI Match Candidates</em>. The algorithm calculates compatibility scores based on Trade (35%), Skills (30%), Experience (15%), and KYC (20%), auto-selecting the best workers.</li>
  </ol>

  <div class="screenshot-container avoid-break">
    <img src="${images.aiMatch}" class="screenshot" alt="AI Match Candidates" />
    <div class="screenshot-caption">
      <span>Figure 2.2 — AI Candidate Compatibility Scoring &amp; Instant Bench Allocation</span>
      <span>Allocation Modal</span>
    </div>
  </div>

  <!-- ==================== MODULE 3: WORKERS DIRECTORY ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 3: Workers Directory &amp; Statutory KYC Verification</h1>
  <p><strong>Route:</strong> <code>/workers</code></p>
  <p>
    The <strong>Workers Directory</strong> manages candidate onboarding, government identity records (Aadhaar, PAN), statutory accounts (EPF UAN, ESIC IP), and physical gate access security cards.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.workers}" class="screenshot" alt="Workers Directory" />
    <div class="screenshot-caption">
      <span>Figure 3.1 — Master Talent Bench with Live KYC Status</span>
      <span>Route: /workers</span>
    </div>
  </div>

  <h2 class="subsection-title">Administrative Actions Available</h2>
  <ul class="bullets">
    <li><strong>Candidate Onboarding Modal</strong>: Register Full Name, Trade, Mobile, Base Pay Rate, 12-digit Aadhaar, PAN, PF UAN, ESIC number, Police Clearance status, and Bank NEFT details.</li>
    <li><strong>CR80 Laminated Gate Pass / ID Card</strong>: Generate standard printable PVC badges with photo, site authorization, emergency blood group, QR verification code, and clearance stamps.</li>
    <li><strong>360° Profile Dossier</strong>: Slide-over drawer detailing past site placements, wage slips, and documents.</li>
  </ul>

  <div class="screenshot-container avoid-break">
    <img src="${images.gatePass}" class="screenshot" alt="Worker Gate Pass" />
    <div class="screenshot-caption">
      <span>Figure 3.2 — Standard Laminated Gate Pass &amp; Worker ID (CR80 Standard)</span>
      <span>Print Modal View</span>
    </div>
  </div>

  <!-- ==================== MODULE 4: WORK ASSIGNMENTS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 4: Work Assignments &amp; Site Deployments</h1>
  <p><strong>Route:</strong> <code>/deployments</code></p>
  <p>
    Tracks all active contractor deployments across customer sites. Placements are governed by agreed commercial contracts and purchase orders to prevent unbilled workforce placement.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.deployments}" class="screenshot" alt="Work Assignments" />
    <div class="screenshot-caption">
      <span>Figure 4.1 — Active Work Assignments, Client Sites &amp; Rate Margins</span>
      <span>Route: /deployments</span>
    </div>
  </div>

  <h2 class="subsection-title">Core Operational Information Tracked</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Field</th>
        <th style="width: 35%;">What it Shows</th>
        <th style="width: 40%;">Business &amp; Compliance Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Worker &amp; Trade</strong></td>
        <td>Name, ID (e.g. WRK-8001), Trade badge</td>
        <td>Ensures qualified personnel match job specifications.</td>
      </tr>
      <tr>
        <td><strong>Client Site</strong></td>
        <td>Facility, Campus, Branch location</td>
        <td>Defines legal place of work under state labor licenses.</td>
      </tr>
      <tr>
        <td><strong>Budget / PO Link</strong></td>
        <td>Client Purchase Order reference</td>
        <td>Guarantees customer authorization and billing validity.</td>
      </tr>
      <tr>
        <td><strong>Commercial Rates</strong></td>
        <td>Bill Rate (to Client) vs. Pay Rate (to Worker)</td>
        <td>Tracks gross margin and operational profitability.</td>
      </tr>
      <tr>
        <td><strong>Tour Status</strong></td>
        <td><span class="lozenge lozenge-success">ACTIVE</span>, <span class="lozenge lozenge-info">COMPLETED</span>, <span class="lozenge lozenge-danger">ENDED EARLY</span></td>
        <td>Monitors engagement lifecycle and triggers exit settlement.</td>
      </tr>
    </tbody>
  </table>

  <div class="callout tip avoid-break" style="margin-top: 10px;">
    <strong>Automated WhatsApp Worker Briefing &amp; Digital Gate Pass:</strong> For every active assignment row, administrators can click <strong>Dispatch WA</strong>. StaffifyGo automatically generates a pre-formatted WhatsApp deployment briefing sent directly to the worker's mobile phone containing Client Site Name, Shift Timings (e.g. 09:00 AM - 06:00 PM), Reporting Site Supervisor, and a direct link to their Digital Gate Pass (CR80 QR ID card). The dispatch is automatically recorded in the system notification audit log.
  </div>

  <!-- ==================== MODULE 5: SHIFT SCHEDULES ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 5: Shift Schedules &amp; Squad Rosters</h1>
  <p><strong>Route:</strong> <code>/shifts</code></p>
  <p>
    Essential for continuous 24/7 client operations (such as hospital logistics, IT infrastructure security, and manufacturing plants). This module groups workers into squads and automates weekly rotation schedules.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.shifts}" class="screenshot" alt="Shift Schedules" />
    <div class="screenshot-caption">
      <span>Figure 5.1 — Weekly Squad Shift Rostering Matrix</span>
      <span>Route: /shifts</span>
    </div>
  </div>

  <h2 class="subsection-title">Shift Structure &amp; Regulations</h2>
  <ul class="bullets">
    <li><strong>Morning Shift (A)</strong>: <code>06:00 AM – 02:00 PM</code> (Early production and facility opening).</li>
    <li><strong>General Shift (G)</strong>: <code>09:00 AM – 06:00 PM</code> (Standard enterprise working hours).</li>
    <li><strong>Night Shift (C)</strong>: <code>10:00 PM – 06:00 AM</code> (Overnight security, surveillance, and upkeep).</li>
    <li><strong>Weekly Offs (WO)</strong>: Enforces statutory 1-day rest per 6 consecutive working days under the Factories Act.</li>
  </ul>

  <!-- ==================== MODULE 6: ATTENDANCE MUSTER ROLL ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 6: Daily Attendance &amp; Overtime Muster Roll</h1>
  <p><strong>Route:</strong> <code>/muster-roll</code> (or <code>/attendance</code>)</p>
  <p>
    Captures daily site attendance sheets. The engine calculates normal working days, late marks, leaves, and overtime hours compensated at the statutory <strong>1.5x</strong> multiplier.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.attendance}" class="screenshot" alt="Attendance Muster Roll" />
    <div class="screenshot-caption">
      <span>Figure 6.1 — Site Attendance Sheets, Overtime Tracking &amp; Sheet Lock</span>
      <span>Route: /muster-roll</span>
    </div>
  </div>

  <h2 class="subsection-title">The Attendance Approval Workflow</h2>
  <ol class="steps">
    <li>Site supervisors record daily punches and overtime logs for each deployed worker.</li>
    <li>The administrator filters by <strong>Client Site</strong> and <strong>Month</strong> to review attendance totals.</li>
    <li>The system flags workers with excessive overtime (&ge; 15 hours/month) to prevent fatigue violations.</li>
    <li>Click <strong>Approve Attendance</strong>: Locks the attendance sheet, preventing unauthorized edits and feeding verified hours directly into the Payroll Engine.</li>
  </ol>

  <!-- ==================== MODULE 7: WORKER ADVANCES & LOANS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 7: Worker Advances &amp; Salary Loans</h1>
  <p><strong>Route:</strong> <code>/loans</code></p>
  <p>
    Contractors frequently require emergency financial advances. This module tracks principal disbursals, monthly repayment amortization schedules, and automatic payroll recovery.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.loans}" class="screenshot" alt="Worker Advances" />
    <div class="screenshot-caption">
      <span>Figure 7.1 — Advance Disbursal, Monthly EMI Amortization &amp; Balances</span>
      <span>Route: /loans</span>
    </div>
  </div>

  <h2 class="subsection-title">Automated Safeguards Against Financial Loss</h2>
  <ul class="bullets">
    <li><strong>Automated Payroll EMI Offset</strong>: When running monthly salaries, scheduled installments are automatically deducted from the worker's payslip.</li>
    <li><strong>FnF Exit Protection</strong>: If a worker leaves before completing repayment, any outstanding balance is automatically deducted from their Full &amp; Final settlement voucher.</li>
    <li><strong>Balance Ledger</strong>: Real-time tracking of <em>Total Disbursed</em>, <em>Total Recovered</em>, and <em>Active Outstanding</em>.</li>
  </ul>

  <!-- ==================== MODULE 8: STATUTORY COMPLIANCE ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 8: Statutory Compliance &amp; Labor Registers</h1>
  <p><strong>Route:</strong> <code>/compliance</code></p>
  <p>
    Generates official statutory registers conforming to the <em>Contract Labour (Regulation &amp; Abolition) Central Rules, 1971</em> and social security laws. Includes 1-click government return file exporters for EPFO and ESIC portals.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.complianceExporters || images.compliance}" class="screenshot" alt="Statutory Compliance" />
    <div class="screenshot-caption">
      <span>Figure 8.1 — Labor Inspection Readiness Command Center &amp; Government Return Exporters</span>
      <span>Route: /compliance</span>
    </div>
  </div>

  <h2 class="subsection-title">1-Click Government Statutory Return Exporters (EPFO ECR 2.0 &amp; ESIC)</h2>
  <p>
    Eliminates manual portal data compilation. Generates pre-formatted upload files conforming strictly to official EPFO and ESIC government portal specifications:
  </p>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Statutory File</th>
        <th style="width: 25%;">Target Portal</th>
        <th style="width: 25%;">Format &amp; Delimiter</th>
        <th style="width: 25%;">Statutory Calculation Rules</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>EPFO ECR 2.0 Return</strong></td>
        <td>EPFO Unified Employer Portal</td>
        <td>Text file (<code>.txt</code>)<br>Delimiter: <code>#~#</code></td>
        <td>Caps EPF/EPS wages at statutory Rs 15,000 ceiling. Calculates 12% Employee EPF, 8.33% Employer EPS (capped at Rs 1,250), and 3.67% Employer EPF with member UANs.</td>
      </tr>
      <tr>
        <td><strong>ESIC Monthly Return</strong></td>
        <td>ESIC Insurance Portal</td>
        <td>Spreadsheet (<code>.csv</code>)<br>Standard headers</td>
        <td>Filters eligible workers (gross monthly wages &le; Rs 21,000) with 10-digit IP numbers, working days, and 0.75% employee contribution.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">Official Labor Registers Generated by StaffifyGo</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Register Form</th>
        <th style="width: 35%;">Statute &amp; Rule</th>
        <th style="width: 40%;">Information Maintained</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Form B — Wage Register</strong></td>
        <td>CL(R&amp;A) Rule 78(1)(a)(i)</td>
        <td>Gross earnings, basic wages, OT hours, EPF (12%), ESIC (0.75%), PT, net pay.</td>
      </tr>
      <tr>
        <td><strong>Form D — Muster Roll</strong></td>
        <td>CL(R&amp;A) Rule 78(1)(a)(ii)</td>
        <td>Daily punch records, shift symbols, weekly offs, absences.</td>
      </tr>
      <tr>
        <td><strong>EPF Return / ECR</strong></td>
        <td>Employees' Provident Funds Act</td>
        <td>12% Employee share + 12% Employer share with Universal Account Numbers.</td>
      </tr>
      <tr>
        <td><strong>ESIC Return</strong></td>
        <td>ESI Act, 1948</td>
        <td>0.75% Employee share + 3.25% Employer share for wages &le; Rs 21,000/mo.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== MODULE 9: SALARIES & PAYROLL ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 9: Salaries, Monthly Payroll &amp; Form XIX Payslips</h1>
  <p><strong>Route:</strong> <code>/payroll</code></p>
  <p>
    Converts approved attendance muster rolls into finalized disbursement batches. Automatically computes gross wages, overtime pay, statutory taxes, loan EMI deductions, net take-home bank transfers, and 1-click Bank CMS payout files.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.payroll}" class="screenshot" alt="Salaries & Payroll" />
    <div class="screenshot-caption">
      <span>Figure 9.1 — Monthly Salary Processing &amp; Disbursement Batches</span>
      <span>Route: /payroll</span>
    </div>
  </div>

  <h2 class="subsection-title">Bank CMS Bulk Payout File Export (HDFC / ICICI / SBI 1-Click Payouts)</h2>
  <p>
    Eliminates tedious single-worker manual bank transfers by generating bank-compliant Corporate Management System (CMS) bulk payout files with a single click.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.bankCmsModal}" class="screenshot" alt="Bank CMS Payout Export Modal" />
    <div class="screenshot-caption">
      <span>Figure 9.2 — Bank CMS Bulk Salary Disbursement File Generator</span>
      <span>Payroll &gt; Bank CMS Payout Modal</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Bank CMS Standard</th>
        <th style="width: 25%;">File Specification</th>
        <th style="width: 50%;">Batch Format &amp; Required Columns</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>HDFC Corporate Enet</strong></td>
        <td>Batch CSV (<code>HDFC_ENET_SALARY_*.csv</code>)</td>
        <td>Beneficiary Code, Beneficiary Account Number, Amount, Worker Name, IFSC Code, Corporate Debit Account, Customer Reference Number.</td>
      </tr>
      <tr>
        <td><strong>ICICI CMS / CIB</strong></td>
        <td>I-SurePay CSV (<code>ICICI_CMS_SALARY_*.csv</code>)</td>
        <td>Payment Product Code (<code>PA</code>), Payment Mode (<code>NEFT</code>), Corporate Debit Account, Disbursement Amount, Beneficiary Account, Worker Name, IFSC.</td>
      </tr>
      <tr>
        <td><strong>SBI CMP Corporate</strong></td>
        <td>Corporate Bulk CSV (<code>SBI_CMP_SALARY_*.csv</code>)</td>
        <td>Corporate Debit Account Number, Value Date, Disbursement Amount, Beneficiary Name, Beneficiary Account, IFSC, Salary Remarks.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">WhatsApp Automated Payslip Dispatches &amp; Delivery Audit Logs</h2>
  <p>
    Contract workers frequently lack email or computer access. StaffifyGo delivers instant digital Form XIX payslip links directly to worker WhatsApp numbers upon payroll approval.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.notificationLogModal}" class="screenshot" alt="Notification Dispatch Audit Logs" />
    <div class="screenshot-caption">
      <span>Figure 9.3 — Real-Time Notification &amp; WhatsApp Dispatch Audit Log</span>
      <span>Payroll &gt; Dispatch Logs Modal</span>
    </div>
  </div>

  <div class="callout tip avoid-break">
    <strong>Notification Capabilities:</strong>
    <ul class="bullets">
      <li><strong>1-Click Bulk Payslip Dispatch:</strong> Click <strong>Send WhatsApp Payslips</strong> to formulate salary advice messages for all approved workers in the batch with net pay figures and digital payslip links.</li>
      <li><strong>Individual Worker Dispatch:</strong> Click the WhatsApp icon next to any worker row to open a direct pre-filled chat advice with their monthly earnings breakdown.</li>
      <li><strong>Delivery Audit Trail:</strong> The <strong>Dispatch Logs</strong> modal records recipient phone numbers, message templates, timestamps, dispatch statuses, and provides direct fallback WhatsApp web links.</li>
    </ul>
  </div>

  <h2 class="subsection-title">Official Form XIX Contractor Salary Payslip</h2>
  <p>
    Click <strong>Payslip</strong> in any employee's payroll row to open their official salary slip conforming to <strong>Rule 78(1)(b)</strong>.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.payslip}" class="screenshot" alt="Form XIX Payslip" />
    <div class="screenshot-caption">
      <span>Figure 9.4 — Form XIX Contractor Salary Slip with Dual Signatures (A4 Print / PDF)</span>
      <span>Payslip Modal</span>
    </div>
  </div>

  <div class="callout tip avoid-break">
    <strong>Included on Payslip:</strong> Contractor GSTIN/PAN and License Number, Worker UAN/ESIC numbers, working days (26 days), OT hours (12 hrs), gross wages, itemized deductions (EPF, ESIC, Professional Tax, Loan Recoveries), net take-home pay, employer statutory contributions, and dual signature blocks for the Worker Thumb Impression and Authorized HR Signatory.
  </div>

  <!-- ==================== MODULE 10: CONTRACTS & POS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 10: Client Contracts, Purchase Orders &amp; Rate Cards</h1>
  <p><strong>Route:</strong> <code>/commercials</code></p>
  <p>
    Manages commercial agreements, contracted rate cards, and approved client Purchase Order (PO) budget burn rates. Ensures that staffing deployments always align with client budgets.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.commercials}" class="screenshot" alt="Commercial Contracts & POs" />
    <div class="screenshot-caption">
      <span>Figure 10.1 — Purchase Order Budgets, Burn Rates &amp; Commercial Rate Cards</span>
      <span>Route: /commercials</span>
    </div>
  </div>

  <h2 class="subsection-title">Key Capabilities</h2>
  <ul class="bullets">
    <li><strong>PO Budget Burn Tracking</strong>: Monitors total approved budget cap, amount utilized, and remaining runway.</li>
    <li><strong>Autonomous Budget Alerts</strong>: Highlights purchase orders exceeding 60% (warning) and 80% (critical limit).</li>
    <li><strong>Commercial Rate Cards</strong>: Establishes contracted billing rates by trade role, ensuring consistent billing.</li>
  </ul>

  <!-- ==================== MODULE 11: INVOICING & PAYMENTS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 11: Client Invoices, Tax Billing &amp; Collections</h1>
  <p><strong>Route:</strong> <code>/vendor-invoices</code></p>
  <p>
    Generates official tax invoices from approved attendance and billing rates. Conforms to Section 31 of the CGST Act with standard SAC Code 998519 (Support services of personnel placement) and 18% GST (9% CGST + 9% SGST).
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.invoices}" class="screenshot" alt="Client Invoices" />
    <div class="screenshot-caption">
      <span>Figure 11.1 — Client Invoices, Payment Tracking &amp; Outstanding Balances</span>
      <span>Route: /vendor-invoices</span>
    </div>
  </div>

  <h2 class="subsection-title">Section 31 CGST Tax Invoice Modal</h2>
  <p>
    Click <strong>View</strong> on any invoice to display the official tax invoice ready for download or printing.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.taxInvoice}" class="screenshot" alt="Tax Invoice Modal" />
    <div class="screenshot-caption">
      <span>Figure 11.2 — Standard GST Tax Invoice with SAC 998519 &amp; Bank Coordinates</span>
      <span>Print Modal View</span>
    </div>
  </div>

  <!-- ==================== MODULE 12 & 13: CLIENTS & AGENCIES ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 12 &amp; 13: Clients &amp; Staffing Agencies Directories</h1>
  <h2 class="subsection-title">Module 12: Enterprise Clients &amp; Delivery Sites (<code>/clients</code>)</h2>
  <p>
    Maintains client master records, billing entities, GSTIN numbers, and active delivery site campuses.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.clients}" class="screenshot" alt="Clients Directory" />
    <div class="screenshot-caption">
      <span>Figure 12.1 — Enterprise Client Master Directory &amp; Active Sites</span>
      <span>Route: /clients</span>
    </div>
  </div>

  <h2 class="subsection-title">Module 13: Staffing Agencies Directory (<code>/vendors</code>)</h2>
  <p>
    Manages partner supplier agencies, compliance ratings, and workspace isolation for multi-agency vendor portals.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.agencies}" class="screenshot" alt="Staffing Agencies" />
    <div class="screenshot-caption">
      <span>Figure 13.1 — Staffing Agencies Directory &amp; Compliance Scores</span>
      <span>Route: /vendors</span>
    </div>
  </div>

  <!-- ==================== MODULE 14: EXITS & SETTLEMENTS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 14: Worker Exits, Clearances &amp; Final Settlements</h1>
  <p><strong>Route:</strong> <code>/settlements</code></p>
  <p>
    When a contractor resigns, finishes their deployment tour, or is released, this module manages orderly de-provisioning, asset returns, loan deductions, and final payout calculation.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.settlements}" class="screenshot" alt="Worker Exits & Settlements" />
    <div class="screenshot-caption">
      <span>Figure 14.1 — Resignation Intake, Asset Clearances &amp; Final Take-Home Vouchers</span>
      <span>Route: /settlements</span>
    </div>
  </div>

  <h2 class="subsection-title">The 4-Step Exit Settlement Procedure</h2>
  <ol class="steps">
    <li><strong>Resignation / Termination Intake</strong>: Record last working day and reason for separation.</li>
    <li><strong>Equipment &amp; Site Clearance Checklist</strong>:
      <ul class="bullets">
        <li>[x] Return of Client Access Gate Pass &amp; Photo ID</li>
        <li>[x] Return of Uniforms &amp; Safety PPE (Helmets, Safety Boots, High-Vis Vests)</li>
        <li>[x] Return of Master Keys &amp; Handover of Site Toolkits</li>
        <li>[x] Facility Supervisor Sign-Off</li>
      </ul>
    </li>
    <li><strong>Automated Loan Deduction Offset</strong>: Any outstanding advance balance is automatically subtracted from unpaid days' wages.</li>
    <li><strong>Final Payout Disbursement</strong>: Click <em>Approve Settlement</em> to release final funds and print the signed settlement voucher.</li>
  </ol>

  <!-- ==================== MODULE 15: AI WATCHDOG ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Module 15: Autonomous AI Copilot &amp; Risk Watchdog</h1>
  <p>
    Accessible from any page via the blue floating action button (FAB) at bottom-right, the AI Copilot monitors live database operations to alert administrators to operational risks before they become legal or financial issues.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.aiWatchdog}" class="screenshot" alt="AI Copilot & Watchdog" />
    <div class="screenshot-caption">
      <span>Figure 15.1 — Autonomous Operations Watchdog &amp; Grounded Copilot Chat</span>
      <span>Universal FAB Slide-Over</span>
    </div>
  </div>

  <h2 class="subsection-title">Real-Time Autonomous Risk Checks</h2>
  <ul class="bullets">
    <li><span class="lozenge lozenge-danger">Critical Risk</span> <strong>PO Budget Exhaustion</strong>: Warns when client PO burn rate exceeds 80% so purchase amendments can be secured in advance.</li>
    <li><span class="lozenge lozenge-warning">Warning</span> <strong>Statutory KYC Gaps</strong>: Flags active deployed workers with missing police verification or unlinked Aadhaar records.</li>
    <li><span class="lozenge lozenge-warning">Warning</span> <strong>Worker Overtime Fatigue</strong>: Detects contractors logging &ge; 15 hours of monthly overtime.</li>
    <li><span class="lozenge lozenge-info">Notice</span> <strong>High Loan Advance Balances</strong>: Monitors unrecovered balances &gt; Rs 20,000 awaiting monthly payroll deduction.</li>
  </ul>

  <!-- ==================== BACK COVER: SYSTEM MATRIX ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">System Integration Matrix: How All Modules Connect</h1>
  <p>Every module in StaffifyGo feeds seamlessly into the next, ensuring complete end-to-end operational integrity:</p>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Upstream Module</th>
        <th style="width: 28%;">Data Passed Forward</th>
        <th style="width: 25%;">Downstream Module</th>
        <th style="width: 25%;">Operational Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Clients &amp; Commercials</strong></td>
        <td>Agreed POs &amp; Rate Cards</td>
        <td><strong>Work Assignments</strong></td>
        <td>Prevents unbilled worker deployments.</td>
      </tr>
      <tr>
        <td><strong>Hiring Demands</strong></td>
        <td>Headcount Quotas</td>
        <td><strong>Workers Directory</strong></td>
        <td>AI matches bench talent to open roles.</td>
      </tr>
      <tr>
        <td><strong>Work Assignments</strong></td>
        <td>Assigned Site &amp; Rate</td>
        <td><strong>Shift Rosters</strong></td>
        <td>Ensures daily shift coverage.</td>
      </tr>
      <tr>
        <td><strong>Shift Rosters</strong></td>
        <td>Scheduled Timings</td>
        <td><strong>Attendance Muster Roll</strong></td>
        <td>Accurate punch &amp; overtime tracking.</td>
      </tr>
      <tr>
        <td><strong>Attendance Muster Roll</strong></td>
        <td>Days Worked + OT Hours</td>
        <td><strong>Salaries &amp; Payroll</strong></td>
        <td>Calculates accurate gross pay.</td>
      </tr>
      <tr>
        <td><strong>Worker Advances</strong></td>
        <td>Monthly Scheduled EMI</td>
        <td><strong>Salaries &amp; Payroll</strong></td>
        <td>Automatically recovers loan balance.</td>
      </tr>
      <tr>
        <td><strong>Salaries &amp; Payroll</strong></td>
        <td>Gross Pay &amp; Deductions</td>
        <td><strong>Statutory Compliance</strong></td>
        <td>Generates Form B &amp; Form D registers.</td>
      </tr>
      <tr>
        <td><strong>Attendance &amp; POs</strong></td>
        <td>Billable Hours &amp; Rates</td>
        <td><strong>Client Invoices</strong></td>
        <td>Generates GST tax invoice (SAC 998519).</td>
      </tr>
      <tr>
        <td><strong>Work Assignments</strong></td>
        <td>Tour End / Resignation</td>
        <td><strong>Worker Exits &amp; FnF</strong></td>
        <td>Deprovisions tools &amp; settles final pay.</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 35px; padding: 18px; background: #F4F5F7; border-radius: 8px; border: 1px solid #DFE1E6; text-align: center;">
    <div style="font-weight: 800; font-size: 13pt; color: #0052CC; margin-bottom: 5px;">StaffifyGo — Enterprise Staffing ERP Suite</div>
    <div style="font-size: 9.5pt; color: #5E6C84;">
      Complete Modules &amp; Operational Capabilities Manual &bull; Designed in compliance with Indian Contract Labour (R&amp;A) Central Rules, EPF &amp; ESIC Statutes.<br>
      Repository: <strong>hasanOnGit / Staffify-Vendor-Portal</strong> &bull; Branch: <strong>main</strong>
    </div>
  </div>

</body>
</html>
`;

async function generatePdf() {
  console.log("Launching headless browser to compile Complete Modules PDF...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  const tempHtml = "/home/mohdhasan/Downloads/StaffifyGo/backend/scripts/complete_modules_temp.html";
  fs.writeFileSync(tempHtml, htmlContent, "utf8");
  await page.goto("file://" + tempHtml, { waitUntil: "load" });

  console.log("Rendering printable PDF with header and footer pagination...");
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "16mm",
      right: "12mm",
      bottom: "16mm",
      left: "12mm"
    },
    displayHeaderFooter: true,
    headerTemplate: "<div style=\"font-size: 8pt; color: #8993A4; width: 100%; display: flex; justify-content: space-between; padding: 0 12mm; font-family: -apple-system, sans-serif;\"><span>StaffifyGo Enterprise ERP — Complete Modules Guide</span><span>All Modules & Capabilities</span></div>",
    footerTemplate: "<div style=\"font-size: 8pt; color: #8993A4; width: 100%; display: flex; justify-content: space-between; padding: 0 12mm; font-family: -apple-system, sans-serif;\"><span>Confidential &bull; Staffify-Vendor-Portal</span><span>Page <span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></span></div>"
  });

  fs.writeFileSync(pdfOutPath, pdfBuffer);
  fs.writeFileSync(artifactPdfPath, pdfBuffer);

  await browser.close();
  fs.unlinkSync(tempHtml);

  console.log("Complete Modules PDF generated successfully!");
  console.log("Saved to:", pdfOutPath);
  console.log("Saved to artifact:", artifactPdfPath);
}

generatePdf().catch(err => {
  console.error("Error generating Complete Modules PDF:", err);
  process.exit(1);
});
