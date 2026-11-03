import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  Download,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Eye,
  KeyRound,
  X,
  FileText,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import StatusLozenge from "../components/StatusLozenge";
import KpiMetricCard from "../components/KpiMetricCard";
import { clientPortalApi } from "../services/api";
import toast from "react-hot-toast";

function ClientPortal() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [summary, setSummary] = useState(null);
  const [musterRolls, setMusterRolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sign-off modal state
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [selectedRoll, setSelectedRoll] = useState(null);
  const [signerName, setSignerName] = useState("Vikram Malhotra");
  const [signerDesignation, setSignerDesignation] = useState("Site Project Director");
  const [signerComments, setSignerComments] = useState("Verified against daily security gate logs.");
  const [signing, setSigning] = useState(false);

  // Compliance Pack modal state
  const [compliancePackOpen, setCompliancePackOpen] = useState(false);
  const [compliancePack, setCompliancePack] = useState(null);
  const [loadingPack, setLoadingPack] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadPortalData(selectedClientId);
    }
  }, [selectedClientId]);

  const loadClients = async () => {
    try {
      const res = await clientPortalApi.getClients();
      setClients(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedClientId(res.data.data[0].clientId);
      }
    } catch (err) {
      toast.error("Failed to load clients: " + err.message);
    }
  };

  const loadPortalData = async (cId) => {
    try {
      setLoading(true);
      const [sumRes, rollsRes] = await Promise.all([
        clientPortalApi.getSummary({ clientId: cId }),
        clientPortalApi.getMusterRolls({ clientId: cId }),
      ]);
      setSummary(sumRes.data.data);
      setMusterRolls(rollsRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load portal data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSignModal = (roll) => {
    setSelectedRoll(roll);
    setSignModalOpen(true);
  };

  const handleExecuteSignoff = async (e) => {
    e.preventDefault();
    if (!selectedRoll) return;

    try {
      setSigning(true);
      const res = await clientPortalApi.signOffMusterRoll(selectedRoll.musterRollId, {
        signedBy: signerName,
        designation: signerDesignation,
        comments: signerComments,
      });

      toast.success(res.data.message || "Attendance muster roll digitally signed and approved!");
      setSignModalOpen(false);
      loadPortalData(selectedClientId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign-off execution failed.");
    } finally {
      setSigning(false);
    }
  };

  const handleLoadCompliancePack = async () => {
    try {
      setLoadingPack(true);
      const res = await clientPortalApi.getCompliancePack({ clientId: selectedClientId });
      setCompliancePack(res.data);
      setCompliancePackOpen(true);
    } catch (err) {
      toast.error("Failed to load statutory clearance pack: " + err.message);
    } finally {
      setLoadingPack(false);
    }
  };

  const selectedClient = clients.find((c) => c.clientId === selectedClientId);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#172B4D] dark:text-white tracking-tight flex items-center gap-2">
            <Building2 size={22} className="text-[#0052CC] dark:text-[#579DFF]" />
            Client Principal Employer Review &amp; Sign-off Portal
          </h1>
          <p className="text-xs text-[#6B778C] dark:text-neutral-400 mt-0.5">
            Client representative interface: review monthly attendance sheets, track PO budget burn, and execute digital sign-offs
          </p>
        </div>

        {/* Client Selector & Compliance Pack Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-1.5 shadow-2xs">
            <UserCheck size={14} className="text-[#0052CC] shrink-0" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#172B4D] dark:text-white focus:outline-hidden cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.clientId} value={c.clientId} className="dark:bg-[#151B26]">
                  {c.legalName} ({c.clientId})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleLoadCompliancePack}
            disabled={loadingPack}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[#0052CC] dark:text-[#579DFF] hover:bg-gray-50 dark:hover:bg-[#1E293B] shadow-2xs cursor-pointer transition"
          >
            <ShieldCheck size={14} />
            <span>Statutory Clearance Pack</span>
          </button>

          <button
            type="button"
            onClick={() => loadPortalData(selectedClientId)}
            className="p-2 rounded bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-neutral-300 hover:bg-gray-50 cursor-pointer shadow-2xs"
            title="Refresh portal"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Active On-Site Headcount"
          value={summary?.activeHeadcount || 0}
          subtitle={`Contractors placed at ${selectedClient?.legalName || "client"} sites`}
          icon={UserCheck}
          trend={{ value: "Live Count", isPositive: true }}
        />

        <KpiMetricCard
          title="Purchase Order Budget"
          value={`₹${((summary?.totalBudget || 0) / 100000).toFixed(1)}L`}
          subtitle={`Spent: ₹${((summary?.spentBudget || 0) / 100000).toFixed(1)}L (${summary?.burnRatePercentage || 0}%)`}
          icon={TrendingUp}
        />

        <KpiMetricCard
          title="Remaining Balance"
          value={`₹${((summary?.remainingBudget || 0) / 100000).toFixed(1)}L`}
          subtitle="Authorized PO credit unspent"
          icon={FileCheck2}
        />

        <KpiMetricCard
          title="Pending Sign-Offs"
          value={summary?.pendingSignoffs || 0}
          subtitle={`${summary?.completedSignoffs || 0} sheets previously approved`}
          icon={AlertCircle}
        />
      </div>

      {/* Muster Roll Approval Table */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#0052CC]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] dark:text-white">
              Monthly Site Muster Rolls Awaiting Client Verification
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#6B778C] dark:text-neutral-400">
            {musterRolls.length} Sheets Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F5F7] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-neutral-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Sheet Reference</th>
                <th className="py-2.5 px-3">Work Site Location</th>
                <th className="py-2.5 px-3">Billing Period</th>
                <th className="py-2.5 px-3 text-center">Headcount</th>
                <th className="py-2.5 px-3 text-center">Days Present</th>
                <th className="py-2.5 px-3 text-center">OT Hours</th>
                <th className="py-2.5 px-3 text-right">Total Labor Cost</th>
                <th className="py-2.5 px-3 text-center">Client Sign-off</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
              {musterRolls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#6B778C] dark:text-neutral-400">
                    No attendance muster rolls registered for this client.
                  </td>
                </tr>
              ) : (
                musterRolls.map((roll) => {
                  const isSigned = roll.clientSignoff?.isSigned;
                  return (
                    <tr
                      key={roll._id}
                      className="hover:bg-gray-50 dark:hover:bg-[#151B26]/60 transition"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#0052CC] dark:text-[#579DFF]">
                        {roll.musterRollId}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#172B4D] dark:text-white">
                        {roll.siteName}
                      </td>
                      <td className="py-3 px-3 text-[#42526E] dark:text-neutral-300">
                        {roll.month} {roll.year}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        {roll.totalHeadcount || roll.records?.length || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {roll.totalDaysBilled || roll.records?.reduce((s, r) => s + (r.daysPresent || 0), 0) || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#B9770E] dark:text-amber-400">
                        {roll.totalOtHours || roll.records?.reduce((s, r) => s + (r.overtimeHours || 0), 0) || 0}h
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{(roll.totalGrossPay || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isSigned ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                            <CheckCircle2 size={11} />
                            <span>Signed ({roll.clientSignoff?.signedBy?.split(" ")[0]})</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF0B3] text-[#B9770E] border border-[#FFE380]">
                            <Clock size={11} />
                            <span>Pending Sign-off</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isSigned ? (
                          <span
                            className="text-[10px] font-mono text-[#0052CC] cursor-help"
                            title={`Digital Seal: ${roll.clientSignoff?.digitalSignatureHash}`}
                          >
                            Hash: {roll.clientSignoff?.digitalSignatureHash?.substring(0, 8)}...
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenSignModal(roll)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs cursor-pointer transition"
                          >
                            <KeyRound size={11} />
                            <span>Sign &amp; Approve</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Sign-off Modal */}
      {signModalOpen && selectedRoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg max-w-lg w-full p-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE1E6] dark:border-[#263042]">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-[#0052CC] dark:text-[#579DFF]" />
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-white">
                  Principal Employer Digital Attendance Sign-off
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSignModalOpen(false)}
                className="text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleExecuteSignoff} className="space-y-4 pt-4 text-xs">
              <div className="p-3 rounded-md bg-[#DEEBFF]/30 dark:bg-[#151B26] border border-[#B3D4FF] dark:border-[#263042] space-y-1">
                <div className="font-bold text-[#0052CC] dark:text-[#579DFF]">
                  Muster Roll: {selectedRoll.musterRollId} &bull; {selectedRoll.month} {selectedRoll.year}
                </div>
                <div className="text-[#172B4D] dark:text-neutral-200">
                  Site: {selectedRoll.siteName} &bull; Headcount: {selectedRoll.totalHeadcount} Workers
                </div>
                <div className="text-[#6B778C] dark:text-neutral-400 font-mono">
                  Gross Labor Volume: ₹{(selectedRoll.totalGrossPay || 0).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Authorized Signatory Name
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-medium focus:border-[#0052CC] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Corporate Designation
                </label>
                <input
                  type="text"
                  required
                  value={signerDesignation}
                  onChange={(e) => setSignerDesignation(e.target.value)}
                  className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-medium focus:border-[#0052CC] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Verification Comments / Audit Note
                </label>
                <textarea
                  rows={2}
                  value={signerComments}
                  onChange={(e) => setSignerComments(e.target.value)}
                  className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-medium focus:border-[#0052CC] focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#151B26] rounded text-[11px] text-[#6B778C] dark:text-neutral-400 flex items-start gap-2">
                <ShieldCheck size={16} className="text-[#00875A] shrink-0 mt-0.5" />
                <span>
                  Executing this sign-off will generate an immutable SHA-256 seal recording your signature, designation, and timestamp for labor inspection and invoice processing.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
                <button
                  type="button"
                  onClick={() => setSignModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-neutral-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signing}
                  className="px-4 py-1.5 rounded bg-[#00875A] hover:bg-[#006644] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {signing ? "Sealing..." : "Execute Digital Sign-off"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statutory Clearance Pack Modal */}
      {compliancePackOpen && compliancePack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg max-w-xl w-full p-5 shadow-xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE1E6] dark:border-[#263042]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#00875A]" />
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-white">
                  Statutory Labor Clearance Pack — {compliancePack.clientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCompliancePackOpen(false)}
                className="text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#E3FCEF] dark:bg-emerald-950/40 border border-[#ABF5D1] dark:border-emerald-900 rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#006644] dark:text-emerald-300">
                    Statutory Clearance Status: {compliancePack.statutoryClearanceStatus}
                  </div>
                  <div className="text-[11px] text-[#006644]/80 dark:text-emerald-400">
                    Verified for contractor deployment under CL(R&amp;A) Central Rules
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-white text-[#006644] font-bold text-[10px] shadow-2xs">
                  CERTIFIED
                </span>
              </div>

              <div>
                <h4 className="font-bold text-[#172B4D] dark:text-white mb-1.5 uppercase text-[10px] tracking-wider">
                  Maintained Statutory Registers &amp; Government Filings
                </h4>
                <ul className="space-y-1 bg-gray-50 dark:bg-[#151B26] p-3 rounded border border-[#DFE1E6] dark:border-[#263042]">
                  {compliancePack.rulesMaintained.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[#42526E] dark:text-neutral-300 text-[11px]">
                      <CheckCircle2 size={12} className="text-[#00875A] shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#172B4D] dark:text-white mb-1.5 uppercase text-[10px] tracking-wider">
                  Active Contractor Licenses &amp; Insurance Policies
                </h4>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {compliancePack.activeLicenses.length === 0 ? (
                    <div className="text-[11px] text-[#6B778C] italic">
                      No client-specific licenses linked. General state labor license applies.
                    </div>
                  ) : (
                    compliancePack.activeLicenses.map((doc) => (
                      <div
                        key={doc.documentId}
                        className="p-2.5 rounded border border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-[#172B4D] dark:text-white">{doc.title}</div>
                          <div className="font-mono text-[10px] text-[#6B778C] dark:text-neutral-400">
                            License #{doc.licenseNumber} &bull; Valid Until: {new Date(doc.validUntil).toLocaleDateString()}
                          </div>
                        </div>
                        <StatusLozenge status={doc.status} size="xs" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#DFE1E6] dark:border-[#263042]">
              <button
                type="button"
                onClick={() => {
                  toast.success("Statutory clearance pack downloaded!");
                  setCompliancePackOpen(false);
                }}
                className="px-3.5 py-1.5 rounded bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download size={13} />
                <span>Download Clearance Dossier (.PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientPortal;
