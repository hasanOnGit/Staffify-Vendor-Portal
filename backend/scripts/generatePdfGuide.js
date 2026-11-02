const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const screenshotsDir = "/home/mohdhasan/.gemini/antigravity/brain/eb983ec5-df43-461a-a3aa-8401b910ae3b/screenshots";
const pdfOutPath = "/home/mohdhasan/Downloads/StaffifyGo/docs/StaffifyGo_Worker_Lifecycle_Admin_Guide.pdf";
const artifactPdfPath = "/home/mohdhasan/.gemini/antigravity/brain/eb983ec5-df43-461a-a3aa-8401b910ae3b/StaffifyGo_Worker_Lifecycle_Admin_Guide.pdf";

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
  bankCmsModal: getBase64Img("22_bank_cms_payout_modal.png"),
  notificationLogModal: getBase64Img("23_notification_log_modal.png"),
  complianceExporters: getBase64Img("24_compliance_statutory_exporters.png"),
};

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StaffifyGo Administrator Guide — Complete Worker Lifecycle</title>
  <style>
    

    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #172B4D;
      background: #FFFFFF;
      font-size: 10.5pt;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 30px 20px 20px 20px;
    }

    .brand-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

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

    .cover-hero {
      margin-top: 60px;
    }

    .cover-title {
      font-size: 28pt;
      font-weight: 800;
      color: #091E42;
      line-height: 1.15;
      letter-spacing: -0.8px;
      margin-bottom: 14px;
    }

    .cover-subtitle {
      font-size: 13.5pt;
      color: #42526E;
      line-height: 1.4;
      font-weight: 500;
      margin-bottom: 22px;
    }

    .cover-divider {
      width: 80px;
      height: 4px;
      background: #0052CC;
      border-radius: 2px;
      margin-bottom: 24px;
    }

    .cover-features-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 18px;
    }

    .cover-feature-item {
      background: #F4F5F7;
      border: 1px solid #DFE1E6;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 10pt;
      font-weight: 600;
      color: #172B4D;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cover-feature-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #0052CC;
    }

    .cover-footer {
      border-top: 2px solid #EBECF0;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      color: #6B778C;
      font-size: 9pt;
    }

    /* Headings & Typography */
    h1.section-title {
      font-size: 18pt;
      font-weight: 800;
      color: #091E42;
      border-bottom: 2px solid #0052CC;
      padding-bottom: 6px;
      margin-bottom: 12px;
      letter-spacing: -0.3px;
    }

    h2.subsection-title {
      font-size: 13pt;
      font-weight: 700;
      color: #172B4D;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    p {
      margin-bottom: 8px;
      color: #344563;
      font-size: 10pt;
    }

    /* Lozenges & Badges */
    .lozenge {
      display: inline-block;
      font-size: 8pt;
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

    /* Callout Boxes */
    .callout {
      border-left: 4px solid #0052CC;
      background: #F4F5F7;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      margin: 10px 0;
      font-size: 9.5pt;
    }
    .callout.tip { border-color: #00875A; background: #F3FCF7; }
    .callout.warning { border-color: #B9770E; background: #FFFCF0; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 9pt;
    }
    th {
      background: #F4F5F7;
      color: #42526E;
      font-weight: 700;
      text-align: left;
      padding: 7px 9px;
      border-bottom: 2px solid #DFE1E6;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.4px;
    }
    td {
      padding: 7px 9px;
      border-bottom: 1px solid #EBECF0;
      color: #172B4D;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #FAFBFC;
    }

    /* Screenshots */
    .screenshot-container {
      margin: 10px 0 14px 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #DFE1E6;
      box-shadow: 0 2px 5px rgba(9, 30, 66, 0.08);
      background: #FFFFFF;
    }
    .screenshot-caption {
      background: #F4F5F7;
      padding: 5px 10px;
      font-size: 8pt;
      font-weight: 600;
      color: #5E6C84;
      border-top: 1px solid #DFE1E6;
      display: flex;
      justify-content: space-between;
    }
    img.screenshot {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Ordered steps */
    ol.steps {
      margin-left: 20px;
      margin-bottom: 10px;
      font-size: 9.5pt;
    }
    ol.steps li {
      margin-bottom: 5px;
      padding-left: 4px;
      color: #253858;
    }
    ol.steps li strong {
      color: #091E42;
    }

    ul.bullets {
      margin-left: 20px;
      margin-bottom: 10px;
      font-size: 9.5pt;
    }
    ul.bullets li {
      margin-bottom: 3px;
      color: #344563;
    }
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
        <div class="cover-title">Worker Lifecycle &amp; Operations Manual</div>
        <div class="cover-subtitle">Complete Step-by-Step Administrator Guide: From Candidate Onboarding to Site Deployments, Daily Muster Roll, Statutory PF/ESIC Compliance, Monthly Payroll, and Final Exit Settlements.</div>
        <div class="cover-divider"></div>
        <p style="font-size: 10.5pt; color: #505F79; max-width: 600px;">
          This manual provides practical, screen-by-screen guidance for staffing operators, site coordinators, HR executives, and system administrators managing contingent, contract, and flexi-staffing workforces.
        </p>

        <div class="cover-features-list">
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 1. Worker Onboarding &amp; KYC</div>
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 2. AI Smart Candidate Matching</div>
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 3. Site Deployments &amp; POs</div>
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 4. Shift Rosters &amp; Squad Rotations</div>
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 5. Attendance &amp; OT Approvals</div>
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 6. Salary Advances &amp; Loans</div>
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 7. Form B &amp; Form D Registers</div>
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 8. Form XIX Contractor Payslips</div>
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 9. Worker Clearances &amp; FnF</div>
          <div class="cover-feature-item"><div class="cover-feature-dot"></div> 10. Autonomous AI Risk Watchdog</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div>
        <strong>StaffifyGo Enterprise Platform</strong><br>
        Standard Operating Procedure (SOP) | Release 1.0<br>
        Target System: <span style="color: #0052CC; font-weight: 600;">Staffify-Vendor-Portal</span>
      </div>
      <div style="text-align: right;">
        Author: <strong>Enterprise HR Operations Team</strong><br>
        Date: November 2026<br>
        Classification: <strong>Confidential / Operational Manual</strong>
      </div>
    </div>
  </div>

  <!-- ==================== EXECUTIVE SUMMARY & DASHBOARD ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">0. Executive Dashboard Overview</h1>
  <p>
    The <strong>Executive Dashboard</strong> (<code>/</code>) is your operational command center. It gives you a real-time birds-eye view of your entire workforce deployment across all client sites, commercial budget burn rates, pending actions, and financial collections.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.dashboard}" class="screenshot" alt="Executive Dashboard Overview" />
    <div class="screenshot-caption">
      <span>Figure 0.1 — StaffifyGo Executive Command Center</span>
      <span>Route: /</span>
    </div>
  </div>

  <h2 class="subsection-title">Key Dashboard Metrics</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Metric Card</th>
        <th style="width: 35%;">What it Tracks</th>
        <th style="width: 40%;">Operational Significance</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Workers on Site</strong></td>
        <td>Total contractors actively deployed across facilities</td>
        <td>Direct billable capacity generating staffing revenue.</td>
      </tr>
      <tr>
        <td><strong>Available Workers</strong></td>
        <td>Verified candidates on the talent bench ready for work</td>
        <td>Bench depth available to fill urgent client hiring demands.</td>
      </tr>
      <tr>
        <td><strong>Client Budget Used</strong></td>
        <td>Aggregated PO spend percentage across enterprise clients</td>
        <td>Flags contracts nearing budget exhaustion (&gt;60% warning, &gt;80% critical).</td>
      </tr>
      <tr>
        <td><strong>Pending Receivables</strong></td>
        <td>Total outstanding client tax invoices awaiting payment</td>
        <td>Essential cash-flow visibility for contractor payroll funding.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== STAGE 1: ONBOARDING & KYC ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Stage 1: Worker Onboarding, KYC &amp; Gate Passes</h1>
  <p>
    The <strong>Workers Directory</strong> (<code>/workers</code>) manages your talent bench. Before a worker is assigned to any customer location, their identity, government statutory registrations, and police verification must be validated.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.workers}" class="screenshot" alt="Workers Directory" />
    <div class="screenshot-caption">
      <span>Figure 1.1 — Central Workers Directory &amp; Talent Bench</span>
      <span>Route: /workers</span>
    </div>
  </div>

  <h2 class="subsection-title">Step-by-Step: Registering a New Candidate to the Bench</h2>
  <ol class="steps">
    <li>Click the blue <strong>+ Add Worker</strong> button at the top right of the directory.</li>
    <li><strong>Personal &amp; Skill Information</strong>: Enter Full Name, Mobile Phone, Trade Category (e.g. <em>Security</em>, <em>IT</em>, <em>Facilities</em>), Primary Skill, and Years of Experience.</li>
    <li><strong>Pay Rate</strong>: Set the standard agreed daily or monthly base rate (e.g., <em>Rs 24,000 / month</em>).</li>
    <li><strong>Government KYC &amp; Statutory IDs</strong>:
      <ul class="bullets" style="margin-top: 4px;">
        <li>Enter 12-digit <strong>Aadhaar Number</strong> and tick <em>Aadhaar Verified</em>.</li>
        <li>Enter 10-character alphanumeric <strong>PAN Card Number</strong>.</li>
        <li>Enter <strong>UAN (Universal Account Number)</strong> for Employee Provident Fund (EPF).</li>
        <li>Enter <strong>ESIC IP Number</strong> for health insurance coverage.</li>
        <li>Select <strong>Police Clearance Status</strong> (<em>Verified</em>, <em>Pending</em>, or <em>Under Process</em>).</li>
      </ul>
    </li>
    <li><strong>Bank Details</strong>: Record Bank Name, Account Number, and IFSC Code for direct payroll remittance.</li>
    <li>Click <strong>Save &amp; Add to Bench</strong>. The worker enters <span class="lozenge lozenge-success">AVAILABLE</span> status immediately.</li>
  </ol>

  <div class="screenshot-container avoid-break">
    <img src="${images.onboardModal}" class="screenshot" alt="Add Worker Onboarding Modal" />
    <div class="screenshot-caption">
      <span>Figure 1.2 — Multi-tab Worker Registration Modal (Personal, Trade, KYC &amp; Bank)</span>
      <span>Modal View</span>
    </div>
  </div>

  <div class="page-break"></div>
  <h2 class="subsection-title">Issuing Official Laminated Worker ID &amp; Gate Pass</h2>
  <p>
    Security checkpoints at client campuses require standard physical badges. Click <strong>Gate Pass</strong> in the worker row to render an official laminated card layout conforming to the <strong>CR80 PVC standard</strong>.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.gatePass}" class="screenshot" alt="Worker Gate Pass & ID Card" />
    <div class="screenshot-caption">
      <span>Figure 1.3 — Standard Printable Laminated Gate Pass &amp; Worker ID Card</span>
      <span>Print Modal (A4/PVC Output)</span>
    </div>
  </div>

  <div class="callout tip avoid-break">
    <strong>Included on the Gate Pass:</strong> High-resolution photo placeholder, Trade Category badge, Worker ID, Authorized Client Site, Police Verification seal, Medical Fitness clearance check, Emergency Blood Group, scannable QR verification code, and Authorized Contractor Signatory stamp.
  </div>

  <h2 class="subsection-title">Reviewing the Worker Profile &amp; KYC Dossier</h2>
  <p>
    Clicking <strong>Profile</strong> opens a sliding right-hand drawer containing complete historical assignments, statutory numbers, bank IFSC codes, and attendance records.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.profileDrawer}" class="screenshot" alt="Worker Profile Drawer" />
    <div class="screenshot-caption">
      <span>Figure 1.4 — Worker Profile Dossier Slide-Over</span>
      <span>Drawer View</span>
    </div>
  </div>

  <!-- ==================== STAGE 2: HIRING DEMANDS & AI MATCHING ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Stage 2: Client Demands &amp; AI Smart Candidate Matching</h1>
  <p>
    The <strong>Hiring Demands</strong> module (<code>/requisitions</code>) tracks customer staffing requirements. When a client requests headcount, the system leverages an autonomous 5-pillar matching engine to identify best-fit bench talent in seconds.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.hiringDemands}" class="screenshot" alt="Client Hiring Demands" />
    <div class="screenshot-caption">
      <span>Figure 2.1 — Client Workforce Demands &amp; Headcount Quotas</span>
      <span>Route: /requisitions</span>
    </div>
  </div>

  <h2 class="subsection-title">1-Click Smart AI Candidate Allocation</h2>
  <ol class="steps">
    <li>Click <strong>Allocate</strong> on any open requisition (e.g. <em>CCTV Surveillance &amp; Security Guard - 4 Slots Remaining</em>).</li>
    <li>In the allocation modal, click <strong>AI Match Candidates</strong>.</li>
    <li>The algorithm scores available bench workers across 5 dimensions:
      <ul class="bullets">
        <li><strong>Trade Category Match (35%)</strong>: Validates primary discipline.</li>
        <li><strong>Skills &amp; Keywords (30%)</strong>: Matches specific operational competencies.</li>
        <li><strong>Experience Adequacy (15%)</strong>: Compares candidate years to minimum demand criteria.</li>
        <li><strong>Police Clearance (10%)</strong>: Verifies background check completion.</li>
        <li><strong>Medical &amp; Bank Statutory Readiness (10%)</strong>: Ensures immediate deployment eligibility.</li>
      </ul>
    </li>
    <li>Candidates are tagged with compatibility badges (e.g. <span class="lozenge lozenge-info">98% Match</span>) and specific reasoning points.</li>
    <li>Top candidates are automatically checked. Click <strong>1-Click Allocate</strong> to deploy all selected workers instantly.</li>
  </ol>

  <div class="screenshot-container avoid-break">
    <img src="${images.aiMatch}" class="screenshot" alt="AI Match Candidates in Allocation Modal" />
    <div class="screenshot-caption">
      <span>Figure 2.2 — AI Smart Candidate Matcher with Compatibility Scoring</span>
      <span>Modal View</span>
    </div>
  </div>

  <!-- ==================== STAGE 3 & 4: DEPLOYMENTS & SHIFTS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Stage 3 &amp; 4: Site Deployments &amp; Shift Rostering</h1>
  <h2 class="subsection-title">Stage 3: Workforce Deployments (<code>/deployments</code>)</h2>
  <p>
    This view monitors all active contractors stationed across client facilities. Each placement is linked to an approved Client Purchase Order with transparent tracking of <strong>Bill Rate</strong> vs. <strong>Pay Rate</strong>.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.deployments}" class="screenshot" alt="Work Assignments & Deployments" />
    <div class="screenshot-caption">
      <span>Figure 3.1 — Site Placements, Commercial Margins &amp; Tour Status</span>
      <span>Route: /deployments</span>
    </div>
  </div>

  <div class="callout tip avoid-break">
    <strong>Instant WhatsApp Deployment Briefing:</strong> Administrators can click <strong>Dispatch WA</strong> on any active assignment row. StaffifyGo automatically triggers a WhatsApp briefing to the worker's mobile device with their Client Site Name, Shift Timings (09:00 AM - 06:00 PM), Site Supervisor contact, and a direct link to their Digital QR Gate Pass.
  </div>

  <h2 class="subsection-title">Stage 4: Shift Schedules &amp; Squad Rosters (<code>/shifts</code>)</h2>
  <p>
    For 24/7 client operations (e.g. data centers, hospitals, factories), workers are scheduled across 3 rotating shifts:
  </p>
  <ul class="bullets">
    <li><strong>Morning Shift (A)</strong>: <code>06:00 AM – 02:00 PM</code></li>
    <li><strong>General Shift (G)</strong>: <code>09:00 AM – 06:00 PM</code></li>
    <li><strong>Night Shift (C)</strong>: <code>10:00 PM – 06:00 AM</code></li>
  </ul>

  <div class="screenshot-container avoid-break">
    <img src="${images.shifts}" class="screenshot" alt="Shift Schedules and Squad Rosters" />
    <div class="screenshot-caption">
      <span>Figure 4.1 — Weekly Squad Shift Rostering Matrix</span>
      <span>Route: /shifts</span>
    </div>
  </div>

  <!-- ==================== STAGE 5 & 6: ATTENDANCE & ADVANCES ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Stage 5 &amp; 6: Attendance Muster Roll &amp; Salary Advances</h1>
  <h2 class="subsection-title">Stage 5: Daily Attendance &amp; Overtime Tracking (<code>/attendance</code>)</h2>
  <p>
    Attendance is captured by site and month. The system calculates total days worked, overtime hours (compensated at <strong>1.5x</strong> base wage), and gross earnings. Clicking <strong>Approve Attendance</strong> locks the records for monthly payroll calculation.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.attendance}" class="screenshot" alt="Attendance and Overtime Muster Roll" />
    <div class="screenshot-caption">
      <span>Figure 5.1 — Site Attendance Sheets, Overtime Hours &amp; 1-Click Approvals</span>
      <span>Route: /attendance</span>
    </div>
  </div>

  <h2 class="subsection-title">Stage 6: Worker Advances &amp; Salary Loans (<code>/loans</code>)</h2>
  <p>
    StaffifyGo allows administrators to disburse emergency advances with scheduled monthly EMI repayments.
  </p>
  <div class="callout warning avoid-break">
    <strong>Automated Recovery Safeguards:</strong><br>
    1. During regular payroll runs, monthly EMIs are automatically deducted from the worker's salary slip.<br>
    2. If a worker resigns or exits prematurely, any unrecovered balance is automatically deducted from their Final Full &amp; Final (FnF) payout.
  </div>

  <div class="screenshot-container avoid-break">
    <img src="${images.loans}" class="screenshot" alt="Worker Advances and Loan Recoveries" />
    <div class="screenshot-caption">
      <span>Figure 6.1 — Advance Disbursal, Amortization Schedules &amp; Recovery Tracking</span>
      <span>Route: /loans</span>
    </div>
  </div>

  <!-- ==================== STAGE 7: STATUTORY COMPLIANCE ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Stage 7: Statutory Compliance &amp; Labor Registers</h1>
  <p>
    Government enforcement officers require licensed contractors to maintain statutory registers under the <em>Contract Labour (Regulation &amp; Abolition) Central Rules, 1971</em>. StaffifyGo automatically generates audit-ready registers and 1-click government return upload files:
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.complianceExporters || images.compliance}" class="screenshot" alt="Statutory Labor Registers" />
    <div class="screenshot-caption">
      <span>Figure 7.1 — Statutory Compliance Command Center &amp; Government Return Exporters</span>
      <span>Route: /compliance</span>
    </div>
  </div>

  <h2 class="subsection-title">1-Click Government Statutory Return Exporters (EPFO ECR 2.0 &amp; ESIC)</h2>
  <p>
    Direct-to-portal return files conforming strictly to official EPFO and ESIC government portal specifications:
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
        <th style="width: 35%;">Governing Statute</th>
        <th style="width: 40%;">Key Statutory Data Displayed</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Form B — Wage Register</strong></td>
        <td>CL(R&amp;A) Central Rules Rule 78(1)(a)(i)</td>
        <td>Gross earnings, basic wages, OT hours, EPF (12%), ESIC (0.75%), PT, net pay.</td>
      </tr>
      <tr>
        <td><strong>Form D — Muster Roll</strong></td>
        <td>CL(R&amp;A) Central Rules Rule 78(1)(a)(ii)</td>
        <td>Daily attendance punches, shift timings, weekly offs, leave marks.</td>
      </tr>
      <tr>
        <td><strong>EPF Contribution ECR</strong></td>
        <td>Employees' Provident Funds Act, 1952</td>
        <td>12% Employee EPF + 12% Employer EPF breakdown with UAN numbers.</td>
      </tr>
      <tr>
        <td><strong>ESIC Return of Contributions</strong></td>
        <td>ESI Act, 1948</td>
        <td>0.75% Employee ESIC + 3.25% Employer ESIC for wages &le; Rs 21,000/mo.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== STAGE 8: MONTHLY PAYROLL & PAYSLIPS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Stage 8: Salaries, Monthly Payroll &amp; Form XIX Payslips</h1>
  <p>
    The <strong>Salaries &amp; Monthly Payroll</strong> module (<code>/payroll</code>) transforms approved attendance sheets into finalized disbursement batches with statutory deductions, 1-click Bank CMS payout files, and automated WhatsApp delivery.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.payroll}" class="screenshot" alt="Salaries & Monthly Payroll" />
    <div class="screenshot-caption">
      <span>Figure 8.1 — Monthly Salary Batches, Tax Deductions &amp; Net Take-Home Pay</span>
      <span>Route: /payroll</span>
    </div>
  </div>

  <h2 class="subsection-title">Bank CMS Bulk Payout File Export (HDFC / ICICI / SBI 1-Click Payouts)</h2>
  <p>
    Eliminates tedious manual single-worker NEFT/RTGS transfers by generating bank-compliant Corporate Management System (CMS) bulk batch files.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.bankCmsModal}" class="screenshot" alt="Bank CMS Payout Export Modal" />
    <div class="screenshot-caption">
      <span>Figure 8.2 — Bank CMS Bulk Salary Disbursement File Generator</span>
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
    StaffifyGo delivers instant digital Form XIX payslip links directly to worker WhatsApp numbers upon payroll approval.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.notificationLogModal}" class="screenshot" alt="Notification Dispatch Audit Logs" />
    <div class="screenshot-caption">
      <span>Figure 8.3 — Real-Time Notification &amp; WhatsApp Dispatch Audit Log</span>
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

  <h2 class="subsection-title">Standard Form XIX Contractor Payslip</h2>
  <p>
    Click <strong>Payslip</strong> in any employee's payroll row to open their official salary slip conforming to <strong>Rule 78(1)(b)</strong>.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.payslip}" class="screenshot" alt="Form XIX Contractor Salary Payslip" />
    <div class="screenshot-caption">
      <span>Figure 8.4 — Standard Form XIX Contractor Salary Payslip (A4 Print / PDF Ready)</span>
      <span>Payslip Modal</span>
    </div>
  </div>

  <div class="callout tip avoid-break">
    <strong>Statutory Payslip Features:</strong> Contractor GSTIN/PAN and License Number, Employee UAN &amp; ESIC codes, working days (26 days), overtime hours (12 hrs), gross wages, itemized deductions (PF, ESI, Professional Tax, Loan Recoveries), net take-home bank transfer figure, employer statutory contributions, and dual signature blocks for the Worker Thumb Impression and Authorized HR Signatory.
  </div>

  <!-- ==================== STAGE 9: EXITS & FINAL SETTLEMENT ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Stage 9: Worker Exits, Clearances &amp; Final Settlements</h1>
  <p>
    When a contract worker resigns, completes their project tour, or is terminated, the <strong>Worker Exits &amp; Final Payouts</strong> module (<code>/settlements</code>) ensures orderly de-provisioning and full-and-final settlement (FnF).
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.settlements}" class="screenshot" alt="Worker Exits & Final Payouts" />
    <div class="screenshot-caption">
      <span>Figure 9.1 — Resignation Intake, Equipment Clearances &amp; FnF Payouts</span>
      <span>Route: /settlements</span>
    </div>
  </div>

  <h2 class="subsection-title">The 4-Step Exit Settlement Procedure</h2>
  <ol class="steps">
    <li><strong>Initiate Exit</strong>: Click <em>Initiate Settlement</em>, select the worker, and enter last working day and exit reason.</li>
    <li><strong>Equipment &amp; Site Clearance Checklist</strong>:
      <ul class="bullets">
        <li>[x] Return of Client Gate Access Pass &amp; Photo ID</li>
        <li>[x] Return of Uniforms &amp; Safety PPE (Helmets, Safety Boots, High-Vis Vests)</li>
        <li>[x] Return of Toolkits, Mobile Devices &amp; Master Keys</li>
        <li>[x] Client Site Supervisor Clearance Sign-off</li>
      </ul>
    </li>
    <li><strong>Automated Loan Amortization Offset</strong>: Any pending loan balance is automatically deducted from unpaid days' wages.</li>
    <li><strong>Disbursement &amp; Release Voucher</strong>: Click <em>Approve Settlement</em> to release the final take-home payout and print the official signed settlement voucher.</li>
  </ol>

  <!-- ==================== STAGE 10: AI COPILOT & WATCHDOG ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Stage 10: Autonomous AI Copilot &amp; Risk Watchdog</h1>
  <p>
    StaffifyGo includes an autonomous operations watchdog and natural language copilot accessible from any screen via the floating sparkle button at bottom-right.
  </p>

  <div class="screenshot-container avoid-break">
    <img src="${images.aiWatchdog}" class="screenshot" alt="AI Copilot & Watchdog" />
    <div class="screenshot-caption">
      <span>Figure 10.1 — Autonomous Operations Watchdog &amp; Grounded Copilot Chat</span>
      <span>Slide-Over Drawer</span>
    </div>
  </div>

  <h2 class="subsection-title">Proactive Autonomous Risk Watchdog Checks</h2>
  <ul class="bullets">
    <li><span class="lozenge lozenge-danger">Critical Risk</span> <strong>PO Budget Burn Exhaustion</strong>: Flags client purchase orders exceeding 80% utilization cap so you can bill amendments before work stops.</li>
    <li><span class="lozenge lozenge-warning">Warning</span> <strong>Unverified KYC on Active Sites</strong>: Alerts you if a deployed worker has pending police verification or unlinked Aadhaar records.</li>
    <li><span class="lozenge lozenge-warning">Warning</span> <strong>Worker Overtime Fatigue</strong>: Detects contractors with &ge; 15 hours of monthly overtime to prevent safety violations.</li>
    <li><span class="lozenge lozenge-info">Notice</span> <strong>High Loan Advance Balances</strong>: Monitors unrecovered balances &gt; Rs 20,000 awaiting monthly payroll deduction.</li>
  </ul>

  <!-- ==================== BACK COVER / QUICK REFERENCE ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">Quick Administrative Reference Sheet</h1>
  <p>Keep this cheat sheet handy for daily staffing operations:</p>

  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Operational Task</th>
        <th style="width: 25%;">Platform Screen</th>
        <th style="width: 30%;">Key Actions</th>
        <th style="width: 25%;">Compliance Standard</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Register Candidate</strong></td>
        <td>Workers (<code>/workers</code>)</td>
        <td>Click <em>+ Add Worker</em>, enter Aadhaar/PAN, bank IFSC, set daily rate.</td>
        <td>KYC Verification</td>
      </tr>
      <tr>
        <td><strong>Print Site Gate Pass</strong></td>
        <td>Workers (<code>/workers</code>)</td>
        <td>Click <em>Gate Pass</em>, verify QR code, print laminated card.</td>
        <td>CR80 PVC Gate Access</td>
      </tr>
      <tr>
        <td><strong>Fulfill Client Hiring</strong></td>
        <td>Demands (<code>/requisitions</code>)</td>
        <td>Click <em>Allocate</em> &rarr; <em>AI Match</em> &rarr; <em>1-Click Allocate</em>.</td>
        <td>SLAs / Job Quotas</td>
      </tr>
      <tr>
        <td><strong>Plan Rotating Shifts</strong></td>
        <td>Shifts (<code>/shifts</code>)</td>
        <td>Assign Morning, General, Night shifts to worker squads.</td>
        <td>Factories Act Shift Rules</td>
      </tr>
      <tr>
        <td><strong>Lock Monthly Attendance</strong></td>
        <td>Attendance (<code>/attendance</code>)</td>
        <td>Review OT hours (1.5x), click <em>Approve Attendance</em>.</td>
        <td>Form D Muster Roll</td>
      </tr>
      <tr>
        <td><strong>Disburse Emergency Loan</strong></td>
        <td>Advances (<code>/loans</code>)</td>
        <td>Record loan amount &amp; monthly installments.</td>
        <td>Salary Advance Policy</td>
      </tr>
      <tr>
        <td><strong>Audit PF/ESI Registers</strong></td>
        <td>Compliance (<code>/compliance</code>)</td>
        <td>Print Form B Wage Register and Form D Muster Roll.</td>
        <td>CL(R&amp;A) Rule 78</td>
      </tr>
      <tr>
        <td><strong>Execute Monthly Payroll</strong></td>
        <td>Salaries (<code>/payroll</code>)</td>
        <td>Click <em>Calculate Salaries</em>, audit deductions, approve run.</td>
        <td>Payment of Wages Act</td>
      </tr>
      <tr>
        <td><strong>Generate Payslip</strong></td>
        <td>Salaries (<code>/payroll</code>)</td>
        <td>Click <em>Payslip</em> &rarr; <em>Print / Download PDF</em>.</td>
        <td>Form XIX Rule 78(1)(b)</td>
      </tr>
      <tr>
        <td><strong>Process Resignation / FnF</strong></td>
        <td>Exits (<code>/settlements</code>)</td>
        <td>Check off returned PPE &amp; tools, offset loan, approve FnF.</td>
        <td>Exit Clearance SOP</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 35px; padding: 18px; background: #F4F5F7; border-radius: 8px; border: 1px solid #DFE1E6; text-align: center;">
    <div style="font-weight: 800; font-size: 13pt; color: #0052CC; margin-bottom: 5px;">StaffifyGo — Enterprise Staffing ERP Suite</div>
    <div style="font-size: 9.5pt; color: #5E6C84;">
      Standard Operating Procedure (SOP) &bull; Designed in compliance with Indian Contract Labour (R&amp;A) Central Rules, EPF &amp; ESIC Statutes.<br>
      Repository: <strong>hasanOnGit / Staffify-Vendor-Portal</strong> &bull; Branch: <strong>main</strong>
    </div>
  </div>

</body>
</html>
`;

async function generatePdf() {
  console.log("Launching headless browser to compile PDF...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  const tempHtml = "/home/mohdhasan/Downloads/StaffifyGo/backend/scripts/guide_temp.html";
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
    headerTemplate: "<div style=\"font-size: 8pt; color: #8993A4; width: 100%; display: flex; justify-content: space-between; padding: 0 12mm; font-family: -apple-system, sans-serif;\"><span>StaffifyGo Enterprise Operations Manual</span><span>Worker Lifecycle SOP</span></div>",
    footerTemplate: "<div style=\"font-size: 8pt; color: #8993A4; width: 100%; display: flex; justify-content: space-between; padding: 0 12mm; font-family: -apple-system, sans-serif;\"><span>Confidential &bull; Staffify-Vendor-Portal</span><span>Page <span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></span></div>"
  });

  fs.writeFileSync(pdfOutPath, pdfBuffer);
  fs.writeFileSync(artifactPdfPath, pdfBuffer);

  await browser.close();
  console.log("PDF generated successfully!");
  console.log("Saved to:", pdfOutPath);
  console.log("Saved to artifact:", artifactPdfPath);
}

generatePdf().catch(err => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
