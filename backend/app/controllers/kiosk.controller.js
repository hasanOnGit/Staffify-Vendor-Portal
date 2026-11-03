const express = require("express");
const router = express.Router();
const KioskPunch = require("../models/kioskPunch.model");
const Worker = require("../models/worker.model");
const Client = require("../models/client.model");
const Deployment = require("../models/deployment.model");
const MusterRoll = require("../models/musterRoll.model");

// Haversine distance formula between two GPS coordinates in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// GET /api/kiosk/sites - List available work sites with geofence perimeters
router.get("/sites", async (req, res) => {
  try {
    const clients = await Client.find({ status: { $ne: "Inactive" } });
    const sites = [];

    clients.forEach((c) => {
      if (c.sites && c.sites.length > 0) {
        c.sites.forEach((s) => {
          if (s.isActive) {
            sites.push({
              siteId: s.siteId,
              siteName: s.siteName,
              location: s.location,
              clientId: c.clientId,
              clientName: c.legalName,
              geofence: s.geofence || {
                latitude: 12.9716,
                longitude: 77.5946,
                radiusMeters: 200,
              },
            });
          }
        });
      }
    });

    res.json({ success: true, count: sites.length, data: sites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/kiosk/worker/:workerId - Quick lookup for QR gate pass scan
router.get("/worker/:workerId", async (req, res) => {
  try {
    const worker = await Worker.findOne({ workerId: req.params.workerId });
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found on bench directory" });
    }

    const activeDeployment = await Deployment.findOne({
      workerId: worker.workerId,
      status: "Active",
    });

    res.json({
      success: true,
      data: {
        workerId: worker.workerId,
        workerName: `${worker.firstName} ${worker.lastName}`,
        trade: worker.tradeCategory,
        primarySkill: worker.primarySkill,
        kycStatus: worker.kycStatus,
        photoUrl: worker.photoUrl,
        activeDeployment: activeDeployment || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/kiosk/punch - Process field supervisor QR scan or mobile punch
router.post("/punch", async (req, res) => {
  try {
    const {
      workerId,
      siteId,
      type = "IN",
      coordinates = {},
      overrideGeofence = false,
      notes = "",
    } = req.body;

    if (!workerId || !siteId) {
      return res.status(400).json({
        success: false,
        message: "Worker ID and Site ID are required for attendance registration.",
      });
    }

    const worker = await Worker.findOne({ workerId: workerId.trim() });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: `Worker ID ${workerId} not found in database.`,
      });
    }

    const workerFullName = `${worker.firstName} ${worker.lastName}`.trim();

    // Find client and site geofence coordinates
    const client = await Client.findOne({ "sites.siteId": siteId });
    let siteName = "Site " + siteId;
    let clientId = "";
    let clientName = "";
    let siteLat = 12.9716;
    let siteLon = 77.5946;
    let siteRadius = 200;

    if (client) {
      clientId = client.clientId;
      clientName = client.legalName;
      const targetSite = client.sites.find((s) => s.siteId === siteId);
      if (targetSite) {
        siteName = targetSite.siteName;
        if (targetSite.geofence) {
          siteLat = targetSite.geofence.latitude || siteLat;
          siteLon = targetSite.geofence.longitude || siteLon;
          siteRadius = targetSite.geofence.radiusMeters || siteRadius;
        }
      }
    }

    // Verify Deployment status
    const deployment = await Deployment.findOne({
      workerId: worker.workerId,
      siteId: siteId,
      status: "Active",
    });

    const userLat = Number(coordinates.latitude);
    const userLon = Number(coordinates.longitude);
    const hasCoordinates = !isNaN(userLat) && !isNaN(userLon);

    let distance = 0;
    let insideGeofence = false;

    if (hasCoordinates) {
      distance = calculateDistanceMeters(userLat, userLon, siteLat, siteLon);
      insideGeofence = distance <= siteRadius;
    } else {
      // If coordinates not provided (e.g. desktop demo), default to within perimeter
      insideGeofence = true;
      distance = 25;
    }

    let status = "Verified";
    let verifiedByGeofence = insideGeofence;

    if (!insideGeofence && !overrideGeofence) {
      status = "Geofence Breach";
      verifiedByGeofence = false;
    } else if (!deployment && !overrideGeofence) {
      status = "Unassigned Worker";
    }

    // Generate Punch ID
    const punchId = `PCH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const punch = new KioskPunch({
      punchId,
      workerId: worker.workerId,
      workerName: workerFullName,
      trade: worker.tradeCategory,
      siteId,
      siteName,
      clientId,
      clientName,
      type: type.toUpperCase() === "OUT" ? "OUT" : "IN",
      coordinates: {
        latitude: hasCoordinates ? userLat : siteLat,
        longitude: hasCoordinates ? userLon : siteLon,
      },
      distanceMeters: distance,
      verifiedByGeofence,
      status,
      notes: notes || (status === "Geofence Breach" ? `Detected ${distance}m away (radius: ${siteRadius}m)` : ""),
    });

    await punch.save();

    // If punch is verified and type is IN, increment attendance in active muster roll if present
    if (status === "Verified") {
      const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
      const currentYear = new Date().getFullYear();

      const musterRoll = await MusterRoll.findOne({
        siteId,
        month: currentMonth,
        year: currentYear,
      });

      if (musterRoll) {
        const record = musterRoll.records.find((r) => r.workerId === worker.workerId);
        if (record) {
          // Record found, already part of monthly muster roll
        } else {
          // Add worker to current muster roll
          musterRoll.records.push({
            workerId: worker.workerId,
            workerName: workerFullName,
            designation: worker.tradeCategory,
            daysPresent: 1,
            normalDailyRate: deployment?.billableRate ? Math.round(deployment.billableRate / 26) : 650,
            otHourlyRate: 150,
            totalEarned: deployment?.billableRate ? Math.round(deployment.billableRate / 26) : 650,
          });
          musterRoll.totalHeadcount = musterRoll.records.length;
          await musterRoll.save();
        }
      }
    }

    res.status(201).json({
      success: true,
      message:
        status === "Verified"
          ? `Punch ${punch.type} registered successfully for ${workerFullName}`
          : `Punch registered with notice: ${status}`,
      data: punch,
      geofenceInfo: {
        siteRadius,
        distanceMeters: distance,
        insideGeofence,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/kiosk/recent-punches - Live punch activity feed
router.get("/recent-punches", async (req, res) => {
  try {
    const { siteId, limit = 20 } = req.query;
    const filter = {};
    if (siteId) filter.siteId = siteId;

    const punches = await KioskPunch.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: punches.length, data: punches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
