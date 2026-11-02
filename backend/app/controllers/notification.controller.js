const express = require("express");
const router = express.Router();
const NotificationLog = require("../models/notificationLog.model");
const Worker = require("../models/worker.model");
const Payroll = require("../models/payroll.model");
const Deployment = require("../models/deployment.model");

// Helper to format clean 10-digit Indian mobile number for WhatsApp link
function cleanPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `91${last10}`;
  }
  return "919845091823"; // Fallback demo phone
}

// Helper to build WhatsApp Click-to-Chat URL
function buildWhatsAppLink(phone, text) {
  const formattedPhone = cleanPhone(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

// POST /api/notifications/dispatch-worker - Trigger WhatsApp deployment briefing to worker
router.post("/dispatch-worker", async (req, res) => {
  try {
    const {
      deploymentId,
      workerId,
      workerName,
      phone,
      siteName,
      clientName,
      shiftTiming,
      supervisorContact,
      startDate,
    } = req.body;

    let targetWorker = null;
    if (workerId) {
      targetWorker = await Worker.findOne({ workerId }).lean();
    }

    const name = workerName || targetWorker?.name || "Team Member";
    const rawPhone = phone || targetWorker?.phone || "9845091823";
    const site = siteName || "Client Facility Alpha";
    const client = clientName || "Enterprise Client";
    const shift = shiftTiming || "General Shift (09:00 AM - 06:00 PM)";
    const supervisor = supervisorContact || "+91 98201 11221";
    const date = startDate || "Immediate / Tomorrow 08:30 AM";
    const gatePassUrl = `https://staffify.app/gate-pass/${workerId || "WRK-8001"}`;

    const messageBody = [
      `*Staffify Workforce Deployment Notice*`,
      `Hello ${name},`,
      `You have been assigned to *${site}* (${client}).`,
      ``,
      `*Reporting Date:* ${date}`,
      `*Shift Timings:* ${shift}`,
      `*Site Supervisor:* ${supervisor}`,
      `*Digital Gate Pass:* ${gatePassUrl}`,
      ``,
      `Please report 15 minutes before shift time in clean uniform and carry your physical Aadhaar card. For assistance, reply to this message.`,
    ].join("\n");

    const waLink = buildWhatsAppLink(rawPhone, messageBody);

    const count = await NotificationLog.countDocuments();
    const notificationId = `NTF-${Date.now()}-${String(count + 1).padStart(4, "0")}`;

    const logEntry = new NotificationLog({
      notificationId,
      recipientType: "Worker",
      recipientId: workerId || "WRK-GEN",
      recipientName: name,
      phone: rawPhone,
      channel: "WhatsApp",
      templateType: "DEPLOYMENT_DISPATCH",
      title: `Site Deployment Dispatch - ${site}`,
      messageBody,
      metadata: {
        siteName: site,
        clientName: client,
        shiftTiming: shift,
        actionUrl: gatePassUrl,
        waLink,
      },
      status: "Delivered",
      deliveredAt: new Date(),
    });

    await logEntry.save();

    res.status(201).json({
      success: true,
      message: `Deployment briefing prepared for ${name}.`,
      data: {
        notificationId,
        recipientName: name,
        phone: rawPhone,
        messageBody,
        waLink,
        status: "Delivered",
      },
    });
  } catch (err) {
    console.error("Error dispatching deployment notification:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/send-payslip - Trigger individual Form XIX payslip notification
router.post("/send-payslip", async (req, res) => {
  try {
    const { payrollId, workerId, month, year, netSalary, phone, workerName } = req.body;

    let targetWorker = null;
    if (workerId) {
      targetWorker = await Worker.findOne({ workerId }).lean();
    }

    const name = workerName || targetWorker?.name || "Contractor";
    const rawPhone = phone || targetWorker?.phone || "9845091823";
    const mStr = month || "March";
    const yStr = year || 2026;
    const net = Number(netSalary || 24000).toLocaleString("en-IN");
    const payslipUrl = `https://staffify.app/payslips/${payrollId || "PAY-2026-0001"}/${workerId || "WRK-8001"}`;

    const messageBody = [
      `*Staffify Monthly Salary Advice*`,
      `Hello ${name},`,
      `Your salary for *${mStr} ${yStr}* has been successfully calculated and approved.`,
      ``,
      `*Net Take-Home Pay:* Rs ${net}`,
      `*Disbursement Mode:* Direct NEFT / RTGS Bank Transfer`,
      `*Form XIX Payslip:* ${payslipUrl}`,
      ``,
      `Your statutory EPF (12%) and ESIC (0.75%) contributions have been remitted. For queries, contact Agency HR.`,
    ].join("\n");

    const waLink = buildWhatsAppLink(rawPhone, messageBody);

    const count = await NotificationLog.countDocuments();
    const notificationId = `NTF-${Date.now()}-${String(count + 1).padStart(4, "0")}`;

    const logEntry = new NotificationLog({
      notificationId,
      recipientType: "Worker",
      recipientId: workerId || "WRK-GEN",
      recipientName: name,
      phone: rawPhone,
      channel: "WhatsApp",
      templateType: "PAYSLIP_DELIVERY",
      title: `Form XIX Payslip - ${mStr} ${yStr}`,
      messageBody,
      metadata: {
        month: mStr,
        year: Number(yStr),
        netPay: Number(netSalary || 24000),
        actionUrl: payslipUrl,
        waLink,
      },
      status: "Delivered",
      deliveredAt: new Date(),
    });

    await logEntry.save();

    res.status(201).json({
      success: true,
      message: `Payslip advice sent to ${name}.`,
      data: {
        notificationId,
        recipientName: name,
        phone: rawPhone,
        messageBody,
        waLink,
        status: "Delivered",
      },
    });
  } catch (err) {
    console.error("Error sending payslip notification:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/bulk-payslips - Batch dispatch payslips for entire payroll run
router.post("/bulk-payslips", async (req, res) => {
  try {
    const { payrollId } = req.body;
    if (!payrollId) {
      return res.status(400).json({ success: false, message: "Payroll ID is required." });
    }

    const payroll = await Payroll.findOne({
      $or: [{ payrollId }, { _id: payrollId.match(/^[0-9a-fA-F]{24}$/) ? payrollId : null }],
    }).lean();

    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll run not found." });
    }

    const records = payroll.records || [];
    if (records.length === 0) {
      return res.status(400).json({ success: false, message: "No worker records in this payroll run." });
    }

    const workerIds = records.map((r) => r.workerId);
    const workers = await Worker.find({ workerId: { $in: workerIds } }).lean();
    const workerMap = {};
    workers.forEach((w) => {
      workerMap[w.workerId] = w;
    });

    const dispatched = [];
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const w = workerMap[r.workerId] || {};
      const name = r.workerName || w.name || `Worker ${r.workerId}`;
      const rawPhone = w.phone || "9845091823";
      const net = Number(r.netSalary || 0).toLocaleString("en-IN");
      const payslipUrl = `https://staffify.app/payslips/${payroll.payrollId}/${r.workerId}`;

      const messageBody = [
        `*Staffify Monthly Salary Advice*`,
        `Hello ${name},`,
        `Your salary for *${payroll.month} ${payroll.year}* has been processed.`,
        ``,
        `*Net Take-Home Pay:* Rs ${net}`,
        `*Payment Mode:* Direct Bank Transfer`,
        `*Form XIX Payslip:* ${payslipUrl}`,
        ``,
        `Statutory PF and ESIC shares are deposited. Contact Agency HR for queries.`,
      ].join("\n");

      const waLink = buildWhatsAppLink(rawPhone, messageBody);

      const count = await NotificationLog.countDocuments();
      const notificationId = `NTF-${Date.now()}-${String(count + 1).padStart(4, "0")}`;

      const log = new NotificationLog({
        notificationId,
        recipientType: "Worker",
        recipientId: r.workerId,
        recipientName: name,
        phone: rawPhone,
        channel: "WhatsApp",
        templateType: "PAYSLIP_DELIVERY",
        title: `Salary Payslip - ${payroll.month} ${payroll.year}`,
        messageBody,
        metadata: {
          month: payroll.month,
          year: payroll.year,
          netPay: r.netSalary,
          actionUrl: payslipUrl,
          waLink,
        },
        status: "Delivered",
        deliveredAt: new Date(),
      });

      await log.save();
      dispatched.push({
        workerId: r.workerId,
        workerName: name,
        phone: rawPhone,
        netPay: r.netSalary,
        waLink,
      });
    }

    res.json({
      success: true,
      message: `Successfully dispatched Form XIX digital payslip notifications to ${dispatched.length} workers via WhatsApp/SMS.`,
      data: {
        payrollId: payroll.payrollId,
        month: payroll.month,
        year: payroll.year,
        totalDispatched: dispatched.length,
        totalNetPayable: payroll.totalNetPayable,
        recipients: dispatched,
      },
    });
  } catch (err) {
    console.error("Error bulk sending payslips:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/loan-alert - Disburse loan notification
router.post("/loan-alert", async (req, res) => {
  try {
    const { loanId, workerId, workerName, phone, principalAmount, monthlyEmi, tenureMonths } = req.body;

    let targetWorker = null;
    if (workerId) {
      targetWorker = await Worker.findOne({ workerId }).lean();
    }

    const name = workerName || targetWorker?.name || "Contractor";
    const rawPhone = phone || targetWorker?.phone || "9845091823";
    const principal = Number(principalAmount || 10000).toLocaleString("en-IN");
    const emi = Number(monthlyEmi || 2500).toLocaleString("en-IN");
    const months = tenureMonths || 4;

    const messageBody = [
      `*Staffify Advance Disbursal Notice*`,
      `Hello ${name},`,
      `Your salary advance of *Rs ${principal}* has been approved and disbursed.`,
      ``,
      `*Monthly EMI Recovery:* Rs ${emi} for ${months} installments`,
      `*Deduction Mode:* Automatic salary payroll adjustment`,
      ``,
      `Please track your advance balance in your monthly Form XIX payslip.`,
    ].join("\n");

    const waLink = buildWhatsAppLink(rawPhone, messageBody);

    const count = await NotificationLog.countDocuments();
    const notificationId = `NTF-${Date.now()}-${String(count + 1).padStart(4, "0")}`;

    const logEntry = new NotificationLog({
      notificationId,
      recipientType: "Worker",
      recipientId: workerId || "WRK-GEN",
      recipientName: name,
      phone: rawPhone,
      channel: "WhatsApp",
      templateType: "LOAN_CREDIT",
      title: `Advance Loan Disbursal - Rs ${principal}`,
      messageBody,
      metadata: {
        loanAmount: Number(principalAmount || 10000),
        waLink,
      },
      status: "Delivered",
      deliveredAt: new Date(),
    });

    await logEntry.save();

    res.status(201).json({
      success: true,
      message: `Advance approval alert sent to ${name}.`,
      data: {
        notificationId,
        recipientName: name,
        phone: rawPhone,
        messageBody,
        waLink,
      },
    });
  } catch (err) {
    console.error("Error sending loan alert:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/logs - Retrieve delivery audit log
router.get("/logs", async (req, res) => {
  try {
    const { templateType, channel, status, limit } = req.query;
    const filter = {};
    if (templateType && templateType !== "All") filter.templateType = templateType;
    if (channel && channel !== "All") filter.channel = channel;
    if (status && status !== "All") filter.status = status;

    const logs = await NotificationLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 100)
      .lean();

    const totalLogs = await NotificationLog.countDocuments();
    const deliveredCount = await NotificationLog.countDocuments({ status: "Delivered" });
    const whatsAppCount = await NotificationLog.countDocuments({ channel: "WhatsApp" });

    res.json({
      success: true,
      stats: {
        totalLogs,
        deliveredCount,
        whatsAppCount,
        deliveryRate: totalLogs > 0 ? Math.round((deliveredCount / totalLogs) * 100) : 100,
      },
      data: logs,
    });
  } catch (err) {
    console.error("Error fetching notification logs:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
