import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileText,
  Download,
  Printer,
  RefreshCw,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Scale,
  DollarSign,
  Users,
  Award,
  Plus,
  Trash2,
  AlertCircle,
  X,
  FolderLock,
  BellRing,
} from "lucide-react";
import KpiMetricCard from "../components/KpiMetricCard";
import StatusLozenge from "../components/StatusLozenge";
import { complianceApi } from "../services/api";
import { useWorkspace } from "../context/WorkspaceContext";
import toast from "react-hot-toast";

export default function Compliance() {
  const { isAgencyWorkspace, activeVendorId, activeVendorName } = useWorkspace();
  const [activeTab, setActiveTab] = useState("form-b");
  const [loading, setLoading] = useState(true);

  // Filters
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");

  // Document Vault states
  const [documents, setDocuments] = useState([]);
  const [sentinelStats, setSentinelStats] = useState({ total: 0, active: 0, expiringSoon: 0, expired: 0, complianceHealth: 100 });
  const [sentinelAlerts, setSentinelAlerts] = useState([]);
  const [vaultFilter, setVaultFilter] = useState("All");
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    title: "",
    documentType: "Contractor Labor License (Form VI-B)",
    licenseNumber: "",
    issuingAuthority: "Office of the Licensing Officer / State Labour Department",
    state: "Karnataka",
    clientName: "",
    siteName: "",
    maxWorkerCapacity: 100,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    remarks: "",
  });

  // Data states
  const [overview, setOverview] = useState({
    totalWorkers: 0,
    kycCompletionRate: 100,
    epfCoverageRate: 100,
    esicCoverageRate: 100,
    minimumWageComplianceRate: 100,
    auditReadinessScore: 100,
    auditStatus: "Inspection Ready",
  });
  const [formBData, setFormBData] = useState({ data: [], totals: {}, meta: {} });
  const [formDData, setFormDData] = useState({ data: [], totals: {}, meta: {} });
  const [epfData, setEpfData] = useState({ data: [], summary: {}, meta: {} });
  const [esicData, setEsicData] = useState({ data: [], summary: {}, meta: {} });

  useEffect(() => {
    loadAllComplianceData();
  }, [month, year, activeVendorId]);

  const loadAllComplianceData = async () => {
    try {
      setLoading(true);
      const params = {
        month: month !== "All" ? month : undefined,
        year: year !== "All" ? year : undefined,
      };

      const [ovRes, fbRes, fdRes, epfRes, esicRes, docRes, alertRes] = await Promise.all([
        complianceApi.getOverview(params),
        complianceApi.getFormB(params),
        complianceApi.getFormD(params),
        complianceApi.getEpfEcr(params),
        complianceApi.getEsicReturn(params),
        complianceApi.getDocuments({ status: vaultFilter !== "All" ? vaultFilter : undefined }),
        complianceApi.getSentinelAlerts(),
      ]);

      if (ovRes.data?.data) setOverview(ovRes.data.data);
      if (fbRes.data) setFormBData(fbRes.data);
      if (fdRes.data) setFormDData(fdRes.data);
      if (epfRes.data) setEpfData(epfRes.data);
      if (esicRes.data) setEsicData(esicRes.data);
      if (docRes.data?.data) setDocuments(docRes.data.data);
      if (alertRes.data?.stats) {
        setSentinelStats(alertRes.data.stats);
        setSentinelAlerts(alertRes.data.alerts || []);
      }
    } catch (err) {
      toast.error("Failed to load compliance records: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDocument = async (e) => {
    e.preventDefault();
    try {
      setSavingDoc(true);
      const res = await complianceApi.registerDocument(newDocForm);
      toast.success(res.data.message || "Document registered in vault!");
      setIsAddDocModalOpen(false);
      loadAllComplianceData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register document.");
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to remove this statutory document?")) return;
    try {
      await complianceApi.deleteDocument(id);
      toast.success("Document removed from vault.");
      loadAllComplianceData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete document.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `Statutory_Report_${activeTab}_${month}_${year}.csv`;

    if (activeTab === "form-b") {
      headers = [
        "S.No",
        "Worker ID",
        "Worker Name",
        "Designation",
        "Payable Days",
        "Daily Rate",
        "Base Pay",
        "OT Hours",
        "OT Pay",
        "Gross Salary",
        "EPF 12%",
        "ESIC 0.75%",
        "Prof Tax",
        "Total Deductions",
        "Net Salary",
        "Bank Account",
        "IFSC Code",
      ];
      rows = (formBData.data || []).map((r) => [
        r.serialNo,
        r.workerId,
        `"${r.workerName}"`,
        `"${r.designation}"`,
        r.payableDays,
        r.normalDailyRate,
        r.basePay,
        r.overtimeHours,
        r.overtimePay,
        r.grossSalary,
        r.employeePf,
        r.esic,
        r.professionalTax,
        r.totalDeductions,
        r.netSalary,
        `"${r.bankAccount}"`,
        r.ifscCode,
      ]);
    } else if (activeTab === "form-d") {
      headers = [
        "S.No",
        "Worker ID",
        "Worker Name",
        "Designation",
        "Client Site",
        "Days Present",
        "Half Days",
        "OT Hours",
        "Daily Rate",
        "Total Earned",
      ];
      rows = (formDData.data || []).map((r) => [
        r.serialNo,
        r.workerId,
        `"${r.workerName}"`,
        `"${r.designation}"`,
        `"${r.siteName}"`,
        r.daysPresent,
        r.halfDays,
        r.overtimeHours,
        r.normalDailyRate,
        r.totalEarned,
      ]);
    } else if (activeTab === "epf") {
      headers = [
        "Worker ID",
        "Worker Name",
        "UAN Number",
        "Gross Wage",
        "EPF Wage",
        "Employee 12%",
        "Employer EPF 3.67%",
        "Pension EPS 8.33%",
        "Total Contribution",
        "NCP Days",
      ];
      rows = (epfData.data || []).map((r) => [
        r.workerId,
        `"${r.workerName}"`,
        `"${r.uan}"`,
        r.grossWage,
        r.epfWage,
        r.eeShare12,
        r.erShareEpf367,
        r.erShareEps833,
        r.totalContribution,
        r.ncpDays,
      ]);
    } else if (activeTab === "esic") {
      headers = [
        "Worker ID",
        "Worker Name",
        "IP Insurance No",
        "Days Worked",
        "Gross Wages",
        "Employee 0.75%",
        "Employer 3.25%",
        "Total ESIC",
      ];
      rows = (esicData.data || []).map((r) => [
        r.workerId,
        `"${r.workerName}"`,
        `"${r.ipNumber}"`,
        r.daysWorked,
        r.grossWages,
        r.eeShare075,
        r.erShare325,
        r.totalEsicPayable,
      ]);
    }

    if (rows.length === 0) {
      toast.error("No entries available to export for this period");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${rows.length} rows to ${filename}`);
  };

  const handleExportEpfoEcr = async () => {
    try {
      const res = await complianceApi.exportEpfoEcr({
        month: month !== "All" ? month : undefined,
        year: year !== "All" ? year : undefined,
      });
      const blob = new Blob([res.data], { type: "text/plain;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `EPFO_ECR_2.0_${month}_${year}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Official EPFO ECR 2.0 text file downloaded! Ready for portal upload.");
    } catch (err) {
      toast.error("Failed to export EPFO ECR: " + (err.response?.data?.message || err.message));
    }
  };

  const handleExportEsicReturn = async () => {
    try {
      const res = await complianceApi.exportEsicReturn({
        month: month !== "All" ? month : undefined,
        year: year !== "All" ? year : undefined,
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ESIC_MONTHLY_RETURN_${month}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Official ESIC Monthly Return CSV downloaded! Ready for portal upload.");
    } catch (err) {
      toast.error("Failed to export ESIC Return: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <span>Labor Compliance & Statutory Registers</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E3FCEF] text-[#00875A] border border-[#ABF5D1]">
              Indian Labor Laws
            </span>
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Statutory registers for labor audits (Form B, Form D) and EPF / ESIC monthly returns
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadAllComplianceData}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
            title="Refresh registers"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportEpfoEcr}
            className="bg-white dark:bg-[#151B26] hover:bg-[#DEEBFF] dark:hover:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] border border-[#B3D4FF] dark:border-[#0052CC]/50 text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Download official EPFO ECR #~# text file for EPFO Unified Portal"
          >
            <FileText size={13} />
            <span>EPFO ECR (.txt)</span>
          </button>

          <button
            type="button"
            onClick={handleExportEsicReturn}
            className="bg-white dark:bg-[#151B26] hover:bg-[#E3FCEF] dark:hover:bg-[#1C2331] text-[#00875A] dark:text-[#36B37E] border border-[#ABF5D1] dark:border-[#00875A]/50 text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Download official ESIC Monthly Contribution CSV for ESIC Portal"
          >
            <Download size={13} />
            <span>ESIC Return (.csv)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer size={14} />
            <span>Print Register</span>
          </button>
        </div>
      </div>


      {/* KPI Audit Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <KpiMetricCard
          title="EPF Compliance"
          value={`${overview.epfCoverageRate}%`}
          subtitle="12% Employee + 12% Employer"
          icon={ShieldCheck}
        />
        <KpiMetricCard
          title="ESIC Coverage"
          value={`${overview.esicCoverageRate}%`}
          subtitle="Covered for gross wages <= Rs 21k"
          icon={Award}
        />
        <KpiMetricCard
          title="Minimum Wage Adherence"
          value={`${overview.minimumWageComplianceRate}%`}
          subtitle="Compliant with statutory wage floor"
          icon={Scale}
        />
        <KpiMetricCard
          title="Audit Readiness"
          value={`${overview.auditReadinessScore} / 100`}
          subtitle={overview.auditStatus}
          icon={CheckCircle2}
        />
      </div>

      {/* Filter and Period Selector */}
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs print:hidden">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b sm:border-b-0 border-[#EBECF0] dark:border-[#263042] pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("form-b")}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer ${
              activeTab === "form-b"
                ? "bg-[#0052CC] text-white shadow-xs"
                : "text-[#6B778C] dark:text-[#94A3B8] hover:bg-[#EBECF0] dark:hover:bg-[#151B26]"
            }`}
          >
            Form B (Wage Register)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("form-d")}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer ${
              activeTab === "form-d"
                ? "bg-[#0052CC] text-white shadow-xs"
                : "text-[#6B778C] dark:text-[#94A3B8] hover:bg-[#EBECF0] dark:hover:bg-[#151B26]"
            }`}
          >
            Form D (Muster Roll)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("epf")}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer ${
              activeTab === "epf"
                ? "bg-[#0052CC] text-white shadow-xs"
                : "text-[#6B778C] dark:text-[#94A3B8] hover:bg-[#EBECF0] dark:hover:bg-[#151B26]"
            }`}
          >
            EPF Challan & ECR
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("esic")}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer ${
              activeTab === "esic"
                ? "bg-[#0052CC] text-white shadow-xs"
                : "text-[#6B778C] dark:text-[#94A3B8] hover:bg-[#EBECF0] dark:hover:bg-[#151B26]"
            }`}
          >
            ESIC Monthly Return
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vault")}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "vault"
                ? "bg-[#0052CC] text-white shadow-xs"
                : "text-[#6B778C] dark:text-[#94A3B8] hover:bg-[#EBECF0] dark:hover:bg-[#151B26]"
            }`}
          >
            <FolderLock size={13} />
            <span>Document Vault &amp; Expiry Sentinel</span>
            {sentinelStats?.expired > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFEBE6] text-[#DE350B]">
                {sentinelStats.expired}
              </span>
            ) : sentinelStats?.expiringSoon > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFF0B3] text-[#B9770E]">
                {sentinelStats.expiringSoon}
              </span>
            ) : null}
          </button>
        </div>

        {/* Month & Year Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8]">
              Month:
            </span>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="text-xs px-2.5 py-1 bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
            >
              <option value="All">All Months</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8]">
              Year:
            </span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="text-xs px-2.5 py-1 bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#0052CC]"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: FORM B (WAGE REGISTER) */}
      {activeTab === "form-b" && (
        <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
          {/* Official Form Header */}
          <div className="px-5 py-3.5 bg-[#F4F5F7] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042]">
            <div className="text-center space-y-1">
              <h3 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-wider uppercase">
                FORM B — WAGE REGISTER
              </h3>
              <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                [See Rule 78(1)(a)(i) of Contract Labour (Regulation & Abolition) Central Rules, 1971 / Payment of Wages Act]
              </p>
              <div className="text-[11px] text-[#172B4D] dark:text-[#F1F5F9] font-medium pt-1">
                <span>Month & Year: <strong>{month} {year}</strong></span>
                <span className="mx-2">&bull;</span>
                <span>Employer / Agency: <strong>{isAgencyWorkspace ? activeVendorName : "All Staffing Agencies"}</strong></span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFBFC] dark:bg-[#151B26]/80 border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-[#94A3B8] font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Sl.</th>
                  <th className="py-2.5 px-3">Worker & Role</th>
                  <th className="py-2.5 px-3 text-right">Days</th>
                  <th className="py-2.5 px-3 text-right">Rate/Day</th>
                  <th className="py-2.5 px-3 text-right">Base Pay</th>
                  <th className="py-2.5 px-3 text-right">OT Hrs/Pay</th>
                  <th className="py-2.5 px-3 text-right font-bold text-[#172B4D] dark:text-[#F1F5F9]">Gross Pay</th>
                  <th className="py-2.5 px-3 text-right">EPF (12%)</th>
                  <th className="py-2.5 px-3 text-right">PT</th>
                  <th className="py-2.5 px-3 text-right">Deductions</th>
                  <th className="py-2.5 px-3 text-right font-bold text-[#0052CC] dark:text-[#579DFF]">Net Payable</th>
                  <th className="py-2.5 px-3">Bank Transfer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBECF0] dark:divide-[#263042]">
                {loading ? (
                  <tr>
                    <td colSpan="12" className="text-center py-10 text-[#6B778C] dark:text-[#94A3B8]">
                      Loading Form B Wage Register...
                    </td>
                  </tr>
                ) : formBData.data?.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center py-10 text-[#6B778C] dark:text-[#94A3B8]">
                      No wage records found for {month} {year}.
                    </td>
                  </tr>
                ) : (
                  formBData.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F4F5F7]/60 dark:hover:bg-[#151B26]/60 transition">
                      <td className="py-2.5 px-3 text-[#6B778C]">{row.serialNo}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">{row.workerName}</div>
                        <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">{row.workerId} &bull; {row.designation}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">{row.payableDays}</td>
                      <td className="py-2.5 px-3 text-right">Rs {Number(row.normalDailyRate).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right">Rs {Number(row.basePay).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div>{row.overtimeHours}h</div>
                        <div className="text-[10px] text-[#6B778C]">Rs {Number(row.overtimePay).toLocaleString()}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                        Rs {Number(row.grossSalary).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#DE350B]">Rs {Number(row.employeePf).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-[#DE350B]">Rs {Number(row.professionalTax).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#DE350B]">
                        Rs {Number(row.totalDeductions).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#00875A]">
                        Rs {Number(row.netSalary).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        <div className="font-mono text-[#172B4D] dark:text-[#F1F5F9]">{row.bankAccount}</div>
                        <div className="text-[10px] text-[#6B778C]">{row.ifscCode}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {formBData.data?.length > 0 && (
                <tfoot>
                  <tr className="bg-[#F4F5F7] dark:bg-[#151B26] font-bold text-[#172B4D] dark:text-[#F1F5F9] border-t-2 border-[#DFE1E6] dark:border-[#263042]">
                    <td colSpan="6" className="py-3 px-3 uppercase text-[11px]">Grand Total (INR)</td>
                    <td className="py-3 px-3 text-right text-xs">
                      Rs {Number(formBData.totals?.grandGross || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-[#DE350B]">
                      Rs {Number(formBData.totals?.grandPf || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-[#DE350B]">
                      Rs {Number(formBData.totals?.grandPt || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-[#DE350B]">
                      Rs {Number(formBData.totals?.grandDeductions || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-[#00875A] text-xs">
                      Rs {Number(formBData.totals?.grandNet || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: FORM D (MUSTER ROLL) */}
      {activeTab === "form-d" && (
        <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
          {/* Official Form Header */}
          <div className="px-5 py-3.5 bg-[#F4F5F7] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042]">
            <div className="text-center space-y-1">
              <h3 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-wider uppercase">
                FORM D — MUSTER ROLL REGISTER
              </h3>
              <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                [See Rule 78(1)(a)(i) of Contract Labour Rules / Minimum Wages Act]
              </p>
              <div className="text-[11px] text-[#172B4D] dark:text-[#F1F5F9] font-medium pt-1">
                <span>Month & Year: <strong>{month} {year}</strong></span>
                <span className="mx-2">&bull;</span>
                <span>Work Location: <strong>Client Delivery Sites</strong></span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFBFC] dark:bg-[#151B26]/80 border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-[#94A3B8] font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Sl.</th>
                  <th className="py-2.5 px-3">Worker & Designation</th>
                  <th className="py-2.5 px-3">Client Work Site</th>
                  <th className="py-2.5 px-3 text-right">Days Present</th>
                  <th className="py-2.5 px-3 text-right">Half Days</th>
                  <th className="py-2.5 px-3 text-right">OT Hours</th>
                  <th className="py-2.5 px-3 text-right">Daily Rate</th>
                  <th className="py-2.5 px-3 text-right">OT Rate/Hr</th>
                  <th className="py-2.5 px-3 text-right font-bold text-[#0052CC] dark:text-[#579DFF]">Total Earned</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBECF0] dark:divide-[#263042]">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-10 text-[#6B778C] dark:text-[#94A3B8]">
                      Loading Form D Muster Roll...
                    </td>
                  </tr>
                ) : formDData.data?.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-10 text-[#6B778C] dark:text-[#94A3B8]">
                      No muster roll entries found for {month} {year}.
                    </td>
                  </tr>
                ) : (
                  formDData.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F4F5F7]/60 dark:hover:bg-[#151B26]/60 transition">
                      <td className="py-2.5 px-3 text-[#6B778C]">{row.serialNo}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">{row.workerName}</div>
                        <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">{row.workerId} &bull; {row.designation}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">{row.clientName}</div>
                        <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">{row.siteName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">{row.daysPresent} d</td>
                      <td className="py-2.5 px-3 text-right">{row.halfDays}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-[#B9770E]">{row.overtimeHours} h</td>
                      <td className="py-2.5 px-3 text-right">Rs {Number(row.normalDailyRate).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right">Rs {Number(row.otHourlyRate).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#0052CC] dark:text-[#579DFF]">
                        Rs {Number(row.totalEarned).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusLozenge status={row.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {formDData.data?.length > 0 && (
                <tfoot>
                  <tr className="bg-[#F4F5F7] dark:bg-[#151B26] font-bold text-[#172B4D] dark:text-[#F1F5F9] border-t-2 border-[#DFE1E6] dark:border-[#263042]">
                    <td colSpan="3" className="py-3 px-3 uppercase text-[11px]">Summary Totals</td>
                    <td className="py-3 px-3 text-right">{formDData.totals?.totalPresentDays} days</td>
                    <td className="py-3 px-3 text-right">{formDData.totals?.totalHalfDays}</td>
                    <td className="py-3 px-3 text-right text-[#B9770E]">{formDData.totals?.totalOtHours} hrs</td>
                    <td colSpan="2"></td>
                    <td className="py-3 px-3 text-right text-[#0052CC] dark:text-[#579DFF] text-xs">
                      Rs {Number(formDData.totals?.totalLaborCost || 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: EPF ECR & CHALLAN */}
      {activeTab === "epf" && (
        <div className="space-y-4">
          {/* Statutory EPF Remittance Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">Total EPF Wages</span>
              <span className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-0.5 block">
                Rs {Number(epfData.summary?.totalEpfWages || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#6B778C]">Ceiling Rs 15,000</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">Employee Share (12%)</span>
              <span className="text-sm font-bold text-[#DE350B] mt-0.5 block">
                Rs {Number(epfData.summary?.totalEeShare12 || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#6B778C]">A/C 01 (EPF)</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">Employer EPF (3.67%)</span>
              <span className="text-sm font-bold text-[#0052CC] dark:text-[#579DFF] mt-0.5 block">
                Rs {Number(epfData.summary?.totalErShareEpf367 || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#6B778C]">A/C 01 (Diff)</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">Pension EPS (8.33%)</span>
              <span className="text-sm font-bold text-[#0052CC] dark:text-[#579DFF] mt-0.5 block">
                Rs {Number(epfData.summary?.totalErShareEps833 || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#6B778C]">A/C 10 (Pension)</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">Admin + EDLI (1%)</span>
              <span className="text-sm font-bold text-[#B9770E] mt-0.5 block">
                Rs {Number((epfData.summary?.totalEdli05 || 0) + (epfData.summary?.totalAdmin05 || 0)).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#6B778C]">A/C 02 & A/C 21</span>
            </div>
            <div className="p-3 bg-[#DEEBFF]/50 dark:bg-[#1C2331] border border-[#B3D4FF] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-bold text-[#0052CC] dark:text-[#579DFF] uppercase block">Challan Payable</span>
              <span className="text-sm font-bold text-[#0052CC] dark:text-[#579DFF] mt-0.5 block">
                Rs {Number(epfData.summary?.totalChallanPayable || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#0052CC] dark:text-[#579DFF] font-medium">Monthly ECR</span>
            </div>
          </div>

          {/* ECR Table */}
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#151B26]">
              <div>
                <h3 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                  Electronic Challan cum Return (ECR) Schedule
                </h3>
                <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                  Worker-wise provident fund statutory breakdown ready for EPFO portal upload
                </p>
              </div>
              <span className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                {epfData.summary?.headcount || 0} Subscribed Workers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAFBFC] dark:bg-[#151B26]/80 border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-[#94A3B8] font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Worker ID & Name</th>
                    <th className="py-2.5 px-3">UAN Number</th>
                    <th className="py-2.5 px-3 text-right">Gross Wage</th>
                    <th className="py-2.5 px-3 text-right">EPF Wage</th>
                    <th className="py-2.5 px-3 text-right text-[#DE350B]">EE Share (12%)</th>
                    <th className="py-2.5 px-3 text-right text-[#0052CC]">ER EPF (3.67%)</th>
                    <th className="py-2.5 px-3 text-right text-[#0052CC]">ER EPS (8.33%)</th>
                    <th className="py-2.5 px-3 text-right font-bold text-[#172B4D] dark:text-[#F1F5F9]">Total Remittance</th>
                    <th className="py-2.5 px-3 text-right">NCP Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBECF0] dark:divide-[#263042]">
                  {epfData.data?.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-10 text-[#6B778C] dark:text-[#94A3B8]">
                        No EPF contribution records found for {month} {year}.
                      </td>
                    </tr>
                  ) : (
                    epfData.data.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F5F7]/60 dark:hover:bg-[#151B26]/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                          <div>{r.workerName}</div>
                          <div className="text-[10px] text-[#6B778C]">{r.workerId}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#0052CC] dark:text-[#579DFF]">{r.uan}</td>
                        <td className="py-2.5 px-3 text-right">Rs {Number(r.grossWage).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-medium">Rs {Number(r.epfWage).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-[#DE350B] font-medium">Rs {Number(r.eeShare12).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-[#0052CC] dark:text-[#579DFF]">Rs {Number(r.erShareEpf367).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-[#0052CC] dark:text-[#579DFF]">Rs {Number(r.erShareEps833).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                          Rs {Number(r.totalContribution).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">{r.ncpDays}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ESIC MONTHLY RETURN */}
      {activeTab === "esic" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">Eligible Workers</span>
              <span className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-0.5 block">
                {esicData.summary?.eligibleHeadcount || 0} Staff
              </span>
              <span className="text-[10px] text-[#6B778C]">Gross Wage &lt;= Rs 21,000</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">Employee Share (0.75%)</span>
              <span className="text-sm font-bold text-[#DE350B] mt-0.5 block">
                Rs {Number(esicData.summary?.totalEeShare075 || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#6B778C]">Deducted from Worker Pay</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-semibold text-[#6B778C] uppercase block">Employer Share (3.25%)</span>
              <span className="text-sm font-bold text-[#0052CC] dark:text-[#579DFF] mt-0.5 block">
                Rs {Number(esicData.summary?.totalErShare325 || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#6B778C]">Agency Statutory Contribution</span>
            </div>
            <div className="p-3 bg-[#E3FCEF] dark:bg-[#00875A]/20 border border-[#ABF5D1] dark:border-[#263042] rounded-lg">
              <span className="text-[10px] font-bold text-[#00875A] uppercase block">Total ESIC Challan (4%)</span>
              <span className="text-sm font-bold text-[#00875A] mt-0.5 block">
                Rs {Number(esicData.summary?.totalChallanPayable || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#00875A]">Due on 15th of Next Month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#F4F5F7] dark:bg-[#151B26]">
              <h3 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                ESIC Monthly Contribution Statement
              </h3>
              <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                Insurance contributions statement under Employees' State Insurance Act, 1948
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAFBFC] dark:bg-[#151B26]/80 border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-[#94A3B8] font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Worker ID & Name</th>
                    <th className="py-2.5 px-3">IP (Insurance No)</th>
                    <th className="py-2.5 px-3 text-right">Days Worked</th>
                    <th className="py-2.5 px-3 text-right">Gross Wages</th>
                    <th className="py-2.5 px-3 text-right text-[#DE350B]">EE Share (0.75%)</th>
                    <th className="py-2.5 px-3 text-right text-[#0052CC]">ER Share (3.25%)</th>
                    <th className="py-2.5 px-3 text-right font-bold text-[#00875A]">Total ESIC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBECF0] dark:divide-[#263042]">
                  {esicData.data?.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-[#6B778C] dark:text-[#94A3B8]">
                        All deployed workers in current payroll have monthly earnings exceeding the Rs 21,000 ESIC ceiling.
                      </td>
                    </tr>
                  ) : (
                    esicData.data.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F5F7]/60 dark:hover:bg-[#151B26]/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                          <div>{r.workerName}</div>
                          <div className="text-[10px] text-[#6B778C]">{r.workerId}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#0052CC]">{r.ipNumber}</td>
                        <td className="py-2.5 px-3 text-right">{r.daysWorked}</td>
                        <td className="py-2.5 px-3 text-right">Rs {Number(r.grossWages).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-[#DE350B]">Rs {Number(r.eeShare075).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-[#0052CC]">Rs {Number(r.erShare325).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#00875A]">
                          Rs {Number(r.totalEsicPayable).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DOCUMENT VAULT & EXPIRY SENTINEL ==================== */}
      {activeTab === "vault" && (
        <div className="space-y-4">
          {/* Sentinel Risk Alert Feed Banner */}
          {sentinelAlerts.length > 0 && (
            <div className="space-y-2">
              {sentinelAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    alert.severity === "CRITICAL"
                      ? "bg-[#FFEBE6] dark:bg-rose-950/40 border-[#FFBDAD] dark:border-rose-900 text-[#DE350B] dark:text-rose-200"
                      : "bg-[#FFF0B3] dark:bg-amber-950/40 border-[#FFE380] dark:border-amber-900 text-[#B9770E] dark:text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BellRing size={16} className="shrink-0" />
                    <div>
                      <span className="font-bold uppercase tracking-wider mr-1.5 text-[10px] px-1.5 py-0.2 rounded bg-white/60 dark:bg-black/30">
                        {alert.severity}
                      </span>
                      <span>{alert.message}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold shrink-0">
                    {alert.daysRemaining <= 0 ? `Lapsed ${Math.abs(alert.daysRemaining)}d ago` : `Expires in ${alert.daysRemaining}d`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Vault Top Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0F131C] p-3 border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[#6B778C] dark:text-neutral-400">
                Filter Licenses:
              </span>
              {["All", "Active", "Expiring Soon", "Expired"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setVaultFilter(st);
                    complianceApi.getDocuments({ status: st !== "All" ? st : undefined }).then((res) => {
                      if (res.data?.data) setDocuments(res.data.data);
                    });
                  }}
                  className={`text-xs px-2.5 py-1 rounded transition cursor-pointer font-medium ${
                    vaultFilter === st
                      ? "bg-[#0052CC] text-white shadow-2xs font-semibold"
                      : "text-[#42526E] dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-[#1C2331]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddDocModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs transition cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Register Statutory Document</span>
            </button>
          </div>

          {/* Documents Table */}
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-neutral-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Document Title &amp; Type</th>
                    <th className="py-2.5 px-3">License / Policy #</th>
                    <th className="py-2.5 px-3">Linked Client / Site</th>
                    <th className="py-2.5 px-3">Issuing Authority</th>
                    <th className="py-2.5 px-3 text-center">Capacity</th>
                    <th className="py-2.5 px-3 text-center">Valid Until</th>
                    <th className="py-2.5 px-3 text-center">Sentinel Countdown</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBECF0] dark:divide-[#263042]">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-[#6B778C] dark:text-neutral-400">
                        No statutory documents found matching filter.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => {
                      const isExpired = doc.status === "Expired";
                      const isExpiring = doc.status === "Expiring Soon";
                      return (
                        <tr
                          key={doc.documentId}
                          className="hover:bg-gray-50 dark:hover:bg-[#151B26]/60 transition"
                        >
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#172B4D] dark:text-white">{doc.title}</div>
                            <div className="text-[10px] text-[#0052CC] dark:text-[#579DFF] font-medium">
                              {doc.documentType}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#172B4D] dark:text-neutral-200">
                            {doc.licenseNumber}
                          </td>
                          <td className="py-3 px-3 text-[#42526E] dark:text-neutral-300">
                            <div>{doc.clientName || "General State"}</div>
                            <div className="text-[10px] text-[#6B778C]">{doc.siteName || doc.state}</div>
                          </td>
                          <td className="py-3 px-3 text-[#6B778C] dark:text-neutral-400 max-w-[160px] truncate">
                            {doc.issuingAuthority}
                          </td>
                          <td className="py-3 px-3 text-center font-bold">
                            {doc.maxWorkerCapacity} Workers
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {new Date(doc.validUntil).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                                isExpired
                                  ? "bg-[#FFEBE6] text-[#DE350B]"
                                  : isExpiring
                                  ? "bg-[#FFF0B3] text-[#B9770E]"
                                  : "bg-[#E3FCEF] text-[#006644]"
                              }`}
                            >
                              {doc.daysRemaining <= 0
                                ? `Lapsed ${Math.abs(doc.daysRemaining)}d`
                                : `${doc.daysRemaining} days left`}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <StatusLozenge status={doc.status} size="xs" />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc.documentId)}
                              className="text-[#6B778C] hover:text-[#DE350B] p-1 rounded transition"
                              title="Delete document"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Register Statutory Document Modal */}
      {isAddDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg max-w-lg w-full p-5 shadow-xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE1E6] dark:border-[#263042]">
              <div className="flex items-center gap-2">
                <FolderLock size={18} className="text-[#0052CC] dark:text-[#579DFF]" />
                <h3 className="text-sm font-bold text-[#172B4D] dark:text-white">
                  Register Statutory License / Insurance Policy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDocModalOpen(false)}
                className="text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karnataka State Contractor License Form VI-B"
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-medium focus:border-[#0052CC] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Document Category
                  </label>
                  <select
                    value={newDocForm.documentType}
                    onChange={(e) => setNewDocForm({ ...newDocForm, documentType: e.target.value })}
                    className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-medium focus:border-[#0052CC] focus:outline-hidden"
                  >
                    <option value="Contractor Labor License (Form VI-B)">CLRA License (Form VI-B)</option>
                    <option value="Workers Compensation Insurance Policy">WC Insurance Policy</option>
                    <option value="Principal Employer Registration (Form V)">PE Registration (Form V)</option>
                    <option value="EPF Establishment Code Certificate">EPF Establishment Code</option>
                    <option value="ESIC Registration Letter">ESIC Code Letter</option>
                    <option value="Inter-State Migrant Workmen License">ISMW License</option>
                    <option value="Factory / State Trade License">State Trade License</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    License / Policy #
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-BLR-CLRA-2024-8842"
                    value={newDocForm.licenseNumber}
                    onChange={(e) => setNewDocForm({ ...newDocForm, licenseNumber: e.target.value })}
                    className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-mono font-bold focus:border-[#0052CC] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={newDocForm.issuingAuthority}
                    onChange={(e) => setNewDocForm({ ...newDocForm, issuingAuthority: e.target.value })}
                    className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-medium focus:border-[#0052CC] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    State / Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={newDocForm.state}
                    onChange={(e) => setNewDocForm({ ...newDocForm, state: e.target.value })}
                    className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-medium focus:border-[#0052CC] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    required
                    value={newDocForm.validFrom}
                    onChange={(e) => setNewDocForm({ ...newDocForm, validFrom: e.target.value })}
                    className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-mono focus:border-[#0052CC] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Valid Until (Expiry Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={newDocForm.validUntil}
                    onChange={(e) => setNewDocForm({ ...newDocForm, validUntil: e.target.value })}
                    className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-mono font-bold text-[#0052CC] focus:border-[#0052CC] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Client Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Projects Limited"
                    value={newDocForm.clientName}
                    onChange={(e) => setNewDocForm({ ...newDocForm, clientName: e.target.value })}
                    className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-medium focus:border-[#0052CC] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                    Max Worker Capacity
                  </label>
                  <input
                    type="number"
                    value={newDocForm.maxWorkerCapacity}
                    onChange={(e) => setNewDocForm({ ...newDocForm, maxWorkerCapacity: e.target.value })}
                    className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-2 text-xs font-mono focus:border-[#0052CC] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE1E6] dark:border-[#263042]">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-neutral-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-4 py-1.5 rounded bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingDoc ? "Registering..." : "Save to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
