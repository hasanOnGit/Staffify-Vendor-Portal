const mongoose = require("mongoose");

const complianceDocumentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      enum: [
        "Contractor Labor License (Form VI-B)",
        "Workers Compensation Insurance Policy",
        "Principal Employer Registration (Form V)",
        "EPF Establishment Code Certificate",
        "ESIC Registration Letter",
        "Factory / State Trade License",
        "Inter-State Migrant Workmen License",
        "Commercial Master Service Agreement",
      ],
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    issuingAuthority: {
      type: String,
      default: "Office of the Licensing Officer / State Labour Department",
    },
    state: {
      type: String,
      default: "Karnataka",
    },
    vendorId: {
      type: String,
      default: "",
      trim: true,
    },
    vendorName: {
      type: String,
      default: "",
    },
    clientId: {
      type: String,
      default: "",
      trim: true,
    },
    clientName: {
      type: String,
      default: "",
    },
    siteName: {
      type: String,
      default: "",
    },
    maxWorkerCapacity: {
      type: Number,
      default: 50,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Expiring Soon", "Expired"],
      default: "Active",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ComplianceDocument", complianceDocumentSchema);
