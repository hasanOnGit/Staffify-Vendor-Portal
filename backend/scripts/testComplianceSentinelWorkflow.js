const BASE_URL = "http://localhost:5001/api/compliance";

async function run() {
  console.log("=== RUNNING STATUTORY DOCUMENT VAULT & EXPIRY SENTINEL TEST ===");

  // Check 1: List Documents with Computed Days
  const docsRes = await fetch(`${BASE_URL}/documents`);
  const docsData = await docsRes.json();
  if (docsRes.status !== 200 || !docsData.success || docsData.count === 0) {
    throw new Error(`Failed to list compliance documents: ${JSON.stringify(docsData)}`);
  }
  const hasDaysRemaining = docsData.data.every((d) => typeof d.daysRemaining === "number");
  if (!hasDaysRemaining) {
    throw new Error("Missing daysRemaining calculation on documents.");
  }
  console.log(`[PASS] Check 1: Retrieved ${docsData.count} statutory documents with live expiry calculations.`);

  // Check 2: Register New License
  const newDocRes = await fetch(`${BASE_URL}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Delhi NCR State Contract Labor License",
      documentType: "Contractor Labor License (Form VI-B)",
      licenseNumber: "DL-CLRA-2025-0012",
      issuingAuthority: "Labour Commissioner, Delhi",
      state: "Delhi",
      clientName: "Amazon Logistics Hub",
      siteName: "Amazon Fulfillment Center DEL-2",
      maxWorkerCapacity: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days -> Expiring Soon
      remarks: "Test Delhi license.",
    }),
  });
  const newDoc = await newDocRes.json();

  if (newDocRes.status !== 201 || !newDoc.success || newDoc.data.status !== "Expiring Soon") {
    throw new Error(`Document creation failed: ${JSON.stringify(newDoc)}`);
  }
  console.log(`[PASS] Check 2: Successfully registered document "${newDoc.data.title}" (Status: ${newDoc.data.status}).`);

  // Check 3: Sentinel Alert Engine
  const alertsRes = await fetch(`${BASE_URL}/sentinel/alerts`);
  const alertsData = await alertsRes.json();
  if (alertsRes.status !== 200 || !alertsData.success) {
    throw new Error(`Sentinel alerts failed: ${JSON.stringify(alertsData)}`);
  }

  const { stats, alerts } = alertsData;
  if (stats.expired === 0 || stats.expiringSoon === 0) {
    throw new Error(`Expected both expired and expiring alerts, got: ${JSON.stringify(stats)}`);
  }
  console.log(
    `[PASS] Check 3: Sentinel engine caught ${alerts.length} risk alerts (Critical/Expired: ${stats.expired}, Warning/Expiring Soon: ${stats.expiringSoon}). Health: ${stats.complianceHealth}%.`
  );

  // Check 4: Filter Documents by Status
  const expiredDocsRes = await fetch(`${BASE_URL}/documents?status=Expired`);
  const expiredDocs = await expiredDocsRes.json();
  if (expiredDocsRes.status !== 200 || expiredDocs.count === 0) {
    throw new Error(`Failed to filter expired docs: ${JSON.stringify(expiredDocs)}`);
  }
  console.log(`[PASS] Check 4: Successfully filtered ${expiredDocs.count} lapsed/expired licenses.`);

  // Check 5: Document Cleanup
  const deleteRes = await fetch(`${BASE_URL}/documents/${newDoc.data.documentId}`, {
    method: "DELETE",
  });
  const deleteData = await deleteRes.json();
  if (deleteRes.status !== 200 || !deleteData.success) {
    throw new Error(`Delete failed: ${JSON.stringify(deleteData)}`);
  }
  console.log(`[PASS] Check 5: Cleaned up test document ${newDoc.data.documentId}.`);

  console.log("\nALL 5 / 5 COMPLIANCE SENTINEL CHECKS PASSED WITH CODE 0!\n");
  process.exit(0);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
