const express = require("express");
const router = express.Router();
const Payroll = require("../models/payroll.model");
const MusterRoll = require("../models/musterRoll.model");
const Worker = require("../models/worker.model");
const Client = require("../models/client.model");
const Vendor = require("../models/vendor.model");

// GET /api/payroll - List payroll runs with tenant scoping
router.get("/", async (req, res) => {
  try {
    const vendorId = req.headers["x-vendor-id"] || req.query.vendorId;
    const { month, year, status } = req.query;

    const filter = {};
    if (vendorId && vendorId !== "All") filter.vendorId = vendorId;
    if (month && month !== "All") filter.month = month;
    if (year && year !== "All") filter.year = Number(year);
    if (status && status !== "All") filter.status = status;

    const payrollRuns = await Payroll.find(filter).sort({ createdAt: -1 }).lean();

    const totalGross = payrollRuns.reduce((acc, p) => acc + (p.totalGrossPay || 0), 0);
    const totalNet = payrollRuns.reduce((acc, p) => acc + (p.totalNetPayable || 0), 0);
    const totalDeductions = payrollRuns.reduce((acc, p) => acc + (p.totalDeductions || 0), 0);
    const totalRuns = payrollRuns.length;

    res.json({
      success: true,
      data: payrollRuns,
      stats: {
        totalGross,
        totalNet,
        totalDeductions,
        totalRuns,
      },
    });
  } catch (err) {
    console.error("Error fetching payroll runs:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/payroll/run - Generate payroll from an approved muster roll
router.post("/run", async (req, res) => {
  try {
    const { musterRollId } = req.body;
    let vendorId = req.headers["x-vendor-id"] || req.body.vendorId;

    if (!musterRollId) {
      return res.status(400).json({
        success: false,
        message: "Muster roll ID is required to calculate payroll.",
      });
    }

    const musterRoll = await MusterRoll.findOne({
      $or: [{ musterRollId }, { _id: musterRollId.match(/^[0-9a-fA-F]{24}$/) ? musterRollId : null }],
    });

    if (!musterRoll) {
      return res.status(404).json({ success: false, message: "Muster roll not found." });
    }

    // Check if payroll already run for this muster roll
    const existing = await Payroll.findOne({ musterRollId: musterRoll.musterRollId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Payroll run ${existing.payrollId} already exists for this muster roll.`,
        data: existing,
      });
    }

    // Determine vendor for this payroll
    if (!vendorId && musterRoll.vendorId) {
      vendorId = musterRoll.vendorId;
    }
    if (!vendorId) {
      // Default to the first vendor in database if unassigned
      const defaultVendor = await Vendor.findOne({ status: "Active" });
      vendorId = defaultVendor?.vendorId || "VND-1002";
    }

    const vendor = await Vendor.findOne({ vendorId });

    // Fetch workers to retrieve KYC bank details
    const workerIds = musterRoll.records.map((r) => r.workerId);
    const workers = await Worker.find({ workerId: { $in: workerIds } }).lean();
    const workerMap = {};
    workers.forEach((w) => {
      workerMap[w.workerId] = w;
    });

    let totalGrossPay = 0;
    let totalDeductions = 0;
    let totalNetPayable = 0;

    const records = musterRoll.records.map((r) => {
      const w = workerMap[r.workerId] || {};
      const payableDays = r.daysPresent + (r.halfDays || 0) * 0.5;
      const basePay = Math.round(payableDays * r.normalDailyRate);
      const otHours = r.overtimeHours || 0;
      const otRate = r.otHourlyRate || Math.round((r.normalDailyRate / 8) * 1.5);
      const overtimePay = Math.round(otHours * otRate);
      const grossSalary = basePay + overtimePay;

      // Statutory Indian payroll deductions:
      // 1. Employee Provident Fund (EPF): 12% of basic wages
      const employeePf = Math.round(basePay * 0.12);
      // 2. ESIC: 0.75% of gross if gross <= ₹21,000 threshold
      const esic = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;
      // 3. Professional Tax (PT): ₹200 standard monthly slab
      const professionalTax = 200;
      const tds = 0;
      const lineDeductions = employeePf + esic + professionalTax + tds;

      // Employer statutory contributions:
      const employerPf = Math.round(basePay * 0.12);
      const employerEsic = grossSalary <= 21000 ? Math.round(grossSalary * 0.0325) : 0;

      const netSalary = Math.max(0, grossSalary - lineDeductions);

      totalGrossPay += grossSalary;
      totalDeductions += lineDeductions;
      totalNetPayable += netSalary;

      return {
        workerId: r.workerId,
        workerName: r.workerName,
        designation: r.designation,
        payableDays,
        normalDailyRate: r.normalDailyRate,
        overtimeHours: otHours,
        otHourlyRate: otRate,
        basePay,
        overtimePay,
        grossSalary,
        statutoryDeductions: {
          employeePf,
          esic,
          professionalTax,
          tds,
          totalDeductions: lineDeductions,
        },
        employerContributions: {
          employerPf,
          employerEsic,
        },
        netSalary,
        bankDetails: {
          accountNumber: w.kycDetails?.bankAccountNumber || "•••• •••• 9182",
          ifscCode: w.kycDetails?.ifscCode || "HDFC0000123",
          bankName: w.kycDetails?.bankName || "HDFC Bank",
        },
        status: "Pending",
      };
    });

    const count = await Payroll.countDocuments();
    const payrollId = `PAY-${musterRoll.year}-${String(count + 1).padStart(4, "0")}`;

    const newPayroll = new Payroll({
      payrollId,
      vendorId: vendor?.vendorId || vendorId,
      vendorName: vendor?.legalName || "Staffing Agency",
      clientId: musterRoll.clientId,
      clientName: musterRoll.clientName,
      siteId: musterRoll.siteId,
      siteName: musterRoll.siteName,
      musterRollId: musterRoll.musterRollId,
      month: musterRoll.month,
      year: musterRoll.year,
      records,
      totalHeadcount: records.length,
      totalGrossPay,
      totalDeductions,
      totalNetPayable,
      status: "Draft",
    });

    await newPayroll.save();

    res.status(201).json({
      success: true,
      message: `Payroll ${payrollId} calculated successfully for ${records.length} site contractors.`,
      data: newPayroll,
    });
  } catch (err) {
    console.error("Error running payroll:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payroll/:id - Get single payroll run
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findOne({
      $or: [{ payrollId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll run not found." });
    }

    res.json({ success: true, data: payroll });
  } catch (err) {
    console.error("Error fetching payroll run:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/payroll/:id/approve - Maker-checker approval
router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findOneAndUpdate(
      { $or: [{ payrollId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      {
        $set: {
          status: "Approved",
          approvedBy: "Finance Director / Agency Payroll Manager",
          approvedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll run not found." });
    }

    res.json({
      success: true,
      message: `Payroll run ${payroll.payrollId} approved for disbursement.`,
      data: payroll,
    });
  } catch (err) {
    console.error("Error approving payroll:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payroll/:id/export-bank-cms - Export ready-to-upload Bank CMS salary disbursement file
router.get("/:id/export-bank-cms", async (req, res) => {
  try {
    const { id } = req.params;
    const bank = (req.query.bank || "hdfc").toLowerCase();
    const format = req.query.format || "file"; // "file" or "json"

    const payroll = await Payroll.findOne({
      $or: [{ payrollId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll run not found." });
    }

    const records = payroll.records || [];
    if (records.length === 0) {
      return res.status(400).json({ success: false, message: "No worker salary records in this payroll run." });
    }

    // Fetch worker mobile numbers
    const workerIds = records.map((r) => r.workerId);
    const workers = await Worker.find({ workerId: { $in: workerIds } }).lean();
    const workerMap = {};
    workers.forEach((w) => {
      workerMap[w.workerId] = w;
    });

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const debitAccount = "000405001234"; // Standard agency operating account

    let filename = "";
    let fileContent = "";
    let mimeType = "text/csv";

    if (bank === "icici") {
      filename = `ICICI_CMS_SALARY_${payroll.payrollId}_${dateStr}.csv`;
      const headers = [
        "PYMT_PROD_TYPE_CODE",
        "PYMT_MODE",
        "DEBIT_ACC_NO",
        "BNF_NAME",
        "BENE_ACC_NO",
        "BENE_IFSC",
        "AMOUNT",
        "TXN_TXT",
        "PRINT_LOC_NAME",
        "EMAIL_ID",
        "MOBILE_NO",
      ];
      const rows = records.map((r, idx) => {
        const w = workerMap[r.workerId] || {};
        const beneAcc = (r.bankDetails?.accountNumber || w.kycDetails?.bankAccountNumber || "").replace(/\s+/g, "");
        const ifsc = (r.bankDetails?.ifscCode || w.kycDetails?.ifscCode || "HDFC0000123").trim();
        const amount = Math.round(r.netSalary || 0);
        const name = (r.workerName || w.name || `Worker ${r.workerId}`).replace(/,/g, " ");
        const mobile = (w.phone || "9845091823").replace(/\D/g, "").slice(-10);
        const email = w.email || "";
        const remarks = `Salary ${payroll.month} ${payroll.year}`;
        return `PA,NEFT,${debitAccount},"${name}",${beneAcc},${ifsc},${amount},"${remarks}",,"${email}",${mobile}`;
      });
      fileContent = [headers.join(","), ...rows].join("\r\n");
    } else if (bank === "sbi") {
      filename = `SBI_CMP_SALARY_${payroll.payrollId}_${dateStr}.csv`;
      const headers = [
        "Debit Account No",
        "Value Date",
        "Txn Type",
        "Beneficiary Name",
        "Beneficiary Account No",
        "IFSC Code",
        "Amount",
        "Currency",
        "Narration",
        "Mobile No",
      ];
      const todayFormatted = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
      const rows = records.map((r) => {
        const w = workerMap[r.workerId] || {};
        const beneAcc = (r.bankDetails?.accountNumber || w.kycDetails?.bankAccountNumber || "").replace(/\s+/g, "");
        const ifsc = (r.bankDetails?.ifscCode || w.kycDetails?.ifscCode || "SBIN0001234").trim();
        const amount = Number(r.netSalary || 0).toFixed(2);
        const name = (r.workerName || w.name || `Worker ${r.workerId}`).replace(/,/g, " ");
        const mobile = (w.phone || "9845091823").replace(/\D/g, "").slice(-10);
        const narration = `Salary ${payroll.month} ${payroll.year}`.slice(0, 30);
        return `${debitAccount},${todayFormatted},NEFT,"${name}",${beneAcc},${ifsc},${amount},INR,"${narration}",${mobile}`;
      });
      fileContent = [headers.join(","), ...rows].join("\r\n");
    } else {
      // Default: HDFC Corporate Enet CMS format
      filename = `HDFC_ENET_SALARY_${payroll.payrollId}_${dateStr}.csv`;
      const headers = [
        "Record Type",
        "Payment Type",
        "Beneficiary Code",
        "Beneficiary Account Number",
        "Instrument Amount",
        "Beneficiary Name",
        "IFSC Code",
        "Customer Reference Number",
        "Payment Details",
        "Beneficiary Mobile",
        "Beneficiary Email",
      ];
      const rows = records.map((r, idx) => {
        const w = workerMap[r.workerId] || {};
        const beneAcc = (r.bankDetails?.accountNumber || w.kycDetails?.bankAccountNumber || "").replace(/\s+/g, "");
        const ifsc = (r.bankDetails?.ifscCode || w.kycDetails?.ifscCode || "HDFC0000123").trim();
        const amount = Math.round(r.netSalary || 0);
        const name = (r.workerName || w.name || `Worker ${r.workerId}`).replace(/,/g, " ");
        const mobile = (w.phone || "9845091823").replace(/\D/g, "").slice(-10);
        const email = w.email || "";
        const refNo = `${payroll.payrollId}-${String(idx + 1).padStart(3, "0")}`;
        const narration = `Salary ${payroll.month} ${payroll.year}`;
        return `N,NEFT,${r.workerId},${beneAcc},${amount},"${name}",${ifsc},${refNo},"${narration}",${mobile},"${email}"`;
      });
      fileContent = [headers.join(","), ...rows].join("\r\n");
    }

    if (format === "json") {
      return res.json({
        success: true,
        meta: {
          payrollId: payroll.payrollId,
          bank: bank.toUpperCase(),
          totalBeneficiaries: records.length,
          totalAmount: payroll.totalNetPayable || records.reduce((sum, r) => sum + (r.netSalary || 0), 0),
          filename,
        },
        content: fileContent,
      });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", mimeType);
    return res.status(200).send(fileContent);
  } catch (err) {
    console.error("Error generating Bank CMS file:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
