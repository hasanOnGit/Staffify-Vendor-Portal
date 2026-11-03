const BASE_URL = "http://localhost:5001/api/kiosk";

async function run() {
  console.log("=== RUNNING KIOSK GPS & QR ATTENDANCE WORKFLOW TEST ===");

  // Check 1: List Sites with Geofence
  const sitesRes = await fetch(`${BASE_URL}/sites`);
  const sitesData = await sitesRes.json();
  if (sitesRes.status !== 200 || !sitesData.success || sitesData.count === 0) {
    throw new Error(`Failed to list kiosk sites: ${JSON.stringify(sitesData)}`);
  }
  console.log(`[PASS] Check 1: Found ${sitesData.count} active work sites with GPS perimeters.`);
  const site = sitesData.data[0];

  // Check 2: Worker QR Scan Lookup
  const workerRes = await fetch(`${BASE_URL}/worker/WRK-8001`);
  const workerData = await workerRes.json();
  if (workerRes.status !== 200 || !workerData.success || workerData.data.workerId !== "WRK-8001") {
    throw new Error(`Failed worker lookup: ${JSON.stringify(workerData)}`);
  }
  console.log(`[PASS] Check 2: Gate pass scan verified for ${workerData.data.workerName} (${workerData.data.trade}).`);

  // Check 3: Punch IN within Geofence (< 200m)
  const insidePunchRes = await fetch(`${BASE_URL}/punch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workerId: "WRK-8001",
      siteId: site.siteId,
      type: "IN",
      coordinates: {
        latitude: site.geofence.latitude + 0.0001, // ~11 meters away
        longitude: site.geofence.longitude + 0.0001,
      },
    }),
  });
  const insidePunch = await insidePunchRes.json();

  if (insidePunchRes.status !== 201 || !insidePunch.success || insidePunch.data.status !== "Verified") {
    throw new Error(`Expected Verified punch, got: ${JSON.stringify(insidePunch)}`);
  }
  console.log(
    `[PASS] Check 3: Geofence IN punch verified! Distance: ${insidePunch.geofenceInfo.distanceMeters}m (Radius: ${insidePunch.geofenceInfo.siteRadius}m).`
  );

  // Check 4: Punch IN outside Geofence (> 200m breach)
  const breachPunchRes = await fetch(`${BASE_URL}/punch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workerId: "WRK-8002",
      siteId: site.siteId,
      type: "IN",
      coordinates: {
        latitude: site.geofence.latitude + 0.01, // ~1.1 km away
        longitude: site.geofence.longitude + 0.01,
      },
      overrideGeofence: false,
    }),
  });
  const breachPunch = await breachPunchRes.json();

  if (breachPunchRes.status !== 201 || breachPunch.data.status !== "Geofence Breach") {
    throw new Error(`Expected Geofence Breach, got: ${JSON.stringify(breachPunch)}`);
  }
  console.log(
    `[PASS] Check 4: Geofence perimeter breach caught! Distance: ${breachPunch.geofenceInfo.distanceMeters}m away from site.`
  );

  // Check 5: Live Activity Feed
  const feedRes = await fetch(`${BASE_URL}/recent-punches?siteId=${site.siteId}`);
  const feedData = await feedRes.json();
  if (feedRes.status !== 200 || !feedData.success || feedData.count < 2) {
    throw new Error(`Feed check failed: ${JSON.stringify(feedData)}`);
  }
  console.log(`[PASS] Check 5: Supervisor activity feed verified with ${feedData.count} real-time site punches.`);

  console.log("\nALL 5 / 5 KIOSK WORKFLOW CHECKS PASSED WITH CODE 0!\n");
  process.exit(0);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
