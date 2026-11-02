import React, { useState, useEffect } from "react";
import { X, Download, Landmark, FileText, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { payrollApi } from "../../services/api";
import toast from "react-hot-toast";

function BankCmsExportModal({ isOpen, onClose, payroll }) {
  const [selectedBank, setSelectedBank] = useState("hdfc");
  const [loading, setLoading] = useState(false);
  const [previewMeta, setPreviewMeta] = useState(null);

  useEffect(() => {
    if (isOpen && payroll) {
      loadPreview(selectedBank);
    }
  }, [isOpen, payroll, selectedBank]);

  const loadPreview = async (bank) => {
    if (!payroll?.payrollId) return;
    try {
      setLoading(true);
      const res = await payrollApi.exportBankCms(payroll.payrollId, bank, "json");
      if (res.data?.success) {
        setPreviewMeta(res.data.meta);
      }
    } catch (err) {
      console.error("Failed to load CMS preview:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!payroll?.payrollId) return;
    try {
      setLoading(true);
      const res = await payrollApi.exportBankCms(payroll.payrollId, selectedBank, "file");
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", previewMeta?.filename || `${selectedBank.toUpperCase()}_CMS_SALARY.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${selectedBank.toUpperCase()} CMS Batch file downloaded!`);
      onClose();
    } catch (err) {
      toast.error("Failed to download Bank CMS file: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !payroll) return null;

  const banks = [
    {
      id: "hdfc",
      name: "HDFC Bank",
      badge: "Enet CMS Format",
      desc: "Standard Corporate Net Banking bulk upload file format with 11-field NEFT reconciliation.",
      debitAcc: "000405001234",
    },
    {
      id: "icici",
      name: "ICICI Bank",
      badge: "CIB / I-SurePay",
      desc: "Corporate Internet Banking CMS file formatted for instant NEFT/RTGS salary processing.",
      debitAcc: "000405001234",
    },
    {
      id: "sbi",
      name: "State Bank of India",
      badge: "CMP Salary Batch",
      desc: "Corporate Monthly Payment (CMP) file format for bulk salary disbursement.",
      debitAcc: "30198273645",
    },
  ];

  const totalBeneficiaries = payroll.records?.length || 0;
  const totalAmount = payroll.totalNetPayable || payroll.records?.reduce((acc, r) => acc + (r.netSalary || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#0F131C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0052CC] text-white flex items-center justify-center shadow-xs">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Bank CMS Bulk Salary Payout Export
              </h3>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8]">
                Batch {payroll.payrollId} &bull; {payroll.month} {payroll.year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#DEEBFF]/40 dark:bg-[#0052CC]/10 border border-[#DEEBFF] dark:border-[#0052CC]/30 rounded-lg text-xs">
            <div>
              <span className="text-[#6B778C] dark:text-[#94A3B8] block text-[11px] uppercase font-bold tracking-wider">
                Total Salary Payout
              </span>
              <span className="text-base font-extrabold text-[#0052CC] dark:text-[#579DFF]">
                Rs {totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-[#6B778C] dark:text-[#94A3B8] block text-[11px] uppercase font-bold tracking-wider">
                Total Beneficiaries
              </span>
              <span className="text-base font-extrabold text-[#172B4D] dark:text-[#F1F5F9]">
                {totalBeneficiaries} Deployed Workers
              </span>
            </div>
          </div>

          {/* Bank Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-[#94A3B8] mb-2.5">
              Select Corporate Banking Partner
            </label>
            <div className="space-y-2.5">
              {banks.map((b) => {
                const isSelected = selectedBank === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBank(b.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition flex items-start justify-between ${
                      isSelected
                        ? "border-[#0052CC] bg-[#F4F5F7] dark:bg-[#1C2331] shadow-xs"
                        : "border-[#DFE1E6] dark:border-[#263042] hover:bg-[#FAFBFC] dark:hover:bg-[#1A202C]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-[#0052CC] bg-[#0052CC]" : "border-[#DFE1E6] dark:border-[#42526E]"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#172B4D] dark:text-[#F1F5F9]">
                            {b.name}
                          </span>
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#DEEBFF] dark:bg-[#1E293B] text-[#0052CC] dark:text-[#579DFF]">
                            {b.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Spec Details */}
          <div className="p-3 bg-[#F4F5F7] dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#6B778C] dark:text-[#94A3B8]">Target Output File:</span>
              <span className="font-mono font-bold text-[#172B4D] dark:text-[#F1F5F9] text-[11px]">
                {previewMeta?.filename || "Loading..."}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B778C] dark:text-[#94A3B8]">Payment Gateway Mode:</span>
              <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">NEFT Batch Mode</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B778C] dark:text-[#94A3B8]">Format Standard:</span>
              <span className="font-medium text-[#00875A] dark:text-[#36B37E] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Direct Corporate Upload Ready
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#0F131C]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#42526E] dark:text-[#94A3B8] hover:bg-gray-200 dark:hover:bg-[#1C2331] rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{loading ? "Generating..." : "Download Bank CMS Batch"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BankCmsExportModal;
