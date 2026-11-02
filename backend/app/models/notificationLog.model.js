const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
    },
    vendorId: {
      type: String,
      default: "VND-1002",
    },
    recipientType: {
      type: String,
      enum: ["Worker", "Client", "Supervisor", "Agency"],
      default: "Worker",
    },
    recipientId: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ["WhatsApp", "SMS"],
      default: "WhatsApp",
    },
    templateType: {
      type: String,
      enum: [
        "DEPLOYMENT_DISPATCH",
        "PAYSLIP_DELIVERY",
        "LOAN_CREDIT",
        "EXIT_SETTLEMENT",
        "ATTENDANCE_ALERT",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    messageBody: {
      type: String,
      required: true,
    },
    metadata: {
      siteName: String,
      clientName: String,
      shiftTiming: String,
      month: String,
      year: Number,
      netPay: Number,
      loanAmount: Number,
      actionUrl: String,
      waLink: String,
    },
    status: {
      type: String,
      enum: ["Sent", "Delivered", "Read", "Failed"],
      default: "Delivered",
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
