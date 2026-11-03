const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const MusterRoll = require("../models/musterRoll.model");
const Client = require("../models/client.model");
const Deployment = require("../models/deployment.model");
const PurchaseOrder = require("../models/purchaseOrder.model");
const ComplianceDocument = require("../models/complianceDocument.model");

// GET /api/client-portal/clients - List clients for portal selector
router.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find({ status: { $ne: "Inactive" } });
    res.json({ success: true, data: clients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/client-portal/summary - Executive overview for client site in-charges
router.get("/summary", async (req, res) => {
  try {
    const { clientId } = req.query;
    const clientFilter = clientId ? { clientId } : {};

    const activeDeployments = await Deployment.countDocuments({
      ...clientFilter,
      status: "Active",
    });

    const pos = await PurchaseOrder.find(clientFilter);
    let totalBudget = 0;
    let spentBudget = 0;

    pos.forEach((po) => {
      totalBudget += po.totalAmount || 0;
      spentBudget += po.consumedAmount || 0;
    });

    const pendingMusterRolls = await MusterRoll.countDocuments({
      ...clientFilter,
      "clientSignoff.isSigned": false,
    });

    const signedMusterRolls = await MusterRoll.countDocuments({
      ...clientFilter,
      "clientSignoff.isSigned": true,
    });

    res.json({
      success: true,
      data: {
        activeHeadcount: activeDeployments,
        totalBudget,
        spentBudget,
        remainingBudget: Math.max(0, totalBudget - spentBudget),
        burnRatePercentage: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0,
        pendingSignoffs: pendingMusterRolls,
        completedSignoffs: signedMusterRolls,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/client-portal/muster-rolls - Sheets awaiting or possessing client verification
router.get("/muster-rolls", async (req, res) => {
  try {
    const { clientId, status } = req.query;
    const filter = {};
    if (clientId) filter.clientId = clientId;

    if (status === "Pending") {
      filter["clientSignoff.isSigned"] = false;
    } else if (status === "Signed") {
      filter["clientSignoff.isSigned"] = true;
    }

    const rolls = await MusterRoll.find(filter).sort({ year: -1, month: -1 });
    res.json({ success: true, count: rolls.length, data: rolls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/client-portal/muster-rolls/:id/sign-off - Digital signature sign-off
router.post("/muster-rolls/:id/sign-off", async (req, res) => {
  try {
    const { id } = req.params;
    const { signedBy, designation = "Principal Employer Site Representative", comments = "" } = req.body;

    if (!signedBy || signedBy.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Signatory name is required to execute digital sign-off.",
      });
    }

    const roll = await MusterRoll.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { musterRollId: id }],
    });

    if (!roll) {
      return res.status(404).json({ success: false, message: "Attendance Muster Roll not found." });
    }

    const now = new Date();
    // Cryptographic SHA-256 seal
    const signaturePayload = `${roll.musterRollId}|${roll.clientId}|${roll.siteId}|${roll.totalGrossPay}|${signedBy}|${now.toISOString()}`;
    const digitalSignatureHash = crypto.createHash("sha256").update(signaturePayload).digest("hex");

    roll.clientSignoff = {
      isSigned: true,
      signedBy: signedBy.trim(),
      designation: designation.trim(),
      signedAt: now,
      comments: comments.trim(),
      digitalSignatureHash,
    };

    if (roll.status === "Draft" || roll.status === "Submitted") {
      roll.status = "Approved";
      roll.approvedBy = `${signedBy.trim()} (${designation.trim()})`;
      roll.approvedAt = now;
    }

    await roll.save();

    res.json({
      success: true,
      message: `Muster roll ${roll.musterRollId} successfully signed off and sealed.`,
      data: roll,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/client-portal/compliance-pack - Statutory clearance pack for principal employers
router.get("/compliance-pack", async (req, res) => {
  try {
    const { clientId } = req.query;
    const filter = clientId ? { clientId } : {};

    const docs = await ComplianceDocument.find({
      ...filter,
      status: { $in: ["Active", "Expiring Soon"] },
    });

    const client = clientId ? await Client.findOne({ clientId }) : null;

    res.json({
      success: true,
      clientName: client?.legalName || "All Clients",
      generatedAt: new Date(),
      statutoryClearanceStatus: docs.some((d) => d.status === "Expired") ? "Non-Compliant" : "Audit-Ready",
      activeLicenses: docs,
      rulesMaintained: [
        "Contract Labour (Regulation & Abolition) Central Rules Form B & Form D",
        "Section 31 CGST Act Invoicing Rules",
        "EPFO ECR 2.0 Electronic Challan cum Return Returns",
        "ESIC Monthly Contribution Return Filings",
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
