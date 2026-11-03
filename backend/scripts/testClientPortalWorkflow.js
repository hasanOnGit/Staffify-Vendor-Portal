const BASE_URL = "http://localhost:5001/api/client-portal";

async function run() {
  console.log("=== RUNNING CLIENT PRINCIPAL EMPLOYER PORTAL WORKFLOW TEST ===");

  // Check 1: Client List
  const clientsRes = await fetch(`${BASE_URL}/clients`);
  const clientsData = await clientsRes.json();
  if (clientsRes.status !== 200 || !clientsData.success || clientsData.data.length === 0) {
    throw new Error(`Failed to list clients: ${JSON.stringify(clientsData)}`);
  }
  const clientId = clientsData.data[0].clientId;
  console.log(`[PASS] Check 1: Client directory verified (${clientsData.data.length} clients found). Selected: ${clientId}`);

  // Check 2: Executive Summary & PO Burn Rate
  const summaryRes = await fetch(`${BASE_URL}/summary?clientId=${clientId}`);
  const summaryData = await summaryRes.json();
  if (summaryRes.status !== 200 || !summaryData.success) {
    throw new Error(`Summary failed: ${JSON.stringify(summaryData)}`);
  }
  console.log(
    `[PASS] Check 2: Client summary verified. Active headcount: ${summaryData.data.activeHeadcount}, PO Burn Rate: ${summaryData.data.burnRatePercentage}%.`
  );

  // Check 3: Muster Roll Listing
  const rollsRes = await fetch(`${BASE_URL}/muster-rolls?clientId=${clientId}`);
  const rollsData = await rollsRes.json();
  if (rollsRes.status !== 200 || !rollsData.success || rollsData.count === 0) {
    throw new Error(`Muster rolls check failed: ${JSON.stringify(rollsData)}`);
  }
  const roll = rollsData.data[0];
  console.log(`[PASS] Check 3: Retrieved ${rollsData.count} monthly attendance sheets for client review.`);

  // Check 4: Digital Sign-off & SHA-256 Seal
  const signoffRes = await fetch(`${BASE_URL}/muster-rolls/${roll.musterRollId}/sign-off`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signedBy: "Vikram Malhotra",
      designation: "Site Project Director",
      comments: "Approved based on physical gate verification.",
    }),
  });
  const signoffData = await signoffRes.json();

  if (
    signoffRes.status !== 200 ||
    !signoffData.success ||
    !signoffData.data.clientSignoff?.isSigned ||
    !signoffData.data.clientSignoff?.digitalSignatureHash
  ) {
    throw new Error(`Sign-off failed: ${JSON.stringify(signoffData)}`);
  }

  console.log(
    `[PASS] Check 4: Digital sign-off verified with SHA-256 seal: ${signoffData.data.clientSignoff.digitalSignatureHash.substring(
      0,
      16
    )}... Signed by: ${signoffData.data.clientSignoff.signedBy}.`
  );

  // Check 5: Compliance Pack Clearance
  const packRes = await fetch(`${BASE_URL}/compliance-pack?clientId=${clientId}`);
  const packData = await packRes.json();
  if (packRes.status !== 200 || !packData.success) {
    throw new Error(`Compliance pack failed: ${JSON.stringify(packData)}`);
  }
  console.log(
    `[PASS] Check 5: Statutory clearance pack generated. Status: ${packData.statutoryClearanceStatus} with ${packData.activeLicenses.length} active licenses.`
  );

  console.log("\nALL 5 / 5 CLIENT PORTAL WORKFLOW CHECKS PASSED WITH CODE 0!\n");
  process.exit(0);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
