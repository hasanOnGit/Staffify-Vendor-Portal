const mongoose = require("mongoose");

const kioskPunchSchema = new mongoose.Schema(
  {
    punchId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    workerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    workerName: {
      type: String,
      required: true,
      trim: true,
    },
    trade: {
      type: String,
      default: "General",
    },
    siteId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    siteName: {
      type: String,
      required: true,
      trim: true,
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
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    distanceMeters: {
      type: Number,
      default: 0,
    },
    verifiedByGeofence: {
      type: Boolean,
      default: true,
    },
    deviceType: {
      type: String,
      default: "Mobile Kiosk PWA",
    },
    status: {
      type: String,
      enum: ["Verified", "Geofence Breach", "Unassigned Worker"],
      default: "Verified",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("KioskPunch", kioskPunchSchema);
