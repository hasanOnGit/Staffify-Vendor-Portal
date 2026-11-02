import React, { useState, useEffect } from "react";
import { X, MessageSquare, Phone, ExternalLink, CheckCheck, RefreshCw, Search } from "lucide-react";
import { notificationsApi } from "../../services/api";
import toast from "react-hot-toast";

function NotificationLogModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalLogs: 0, deliveredCount: 0, deliveryRate: 100 });
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, filterType]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getLogs({
        templateType: filterType !== "All" ? filterType : undefined,
      });
      if (res.data?.success) {
        setLogs(res.data.data || []);
        setStats(res.data.stats || {});
      }
    } catch (err) {
      toast.error("Failed to load notification logs: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.recipientName?.toLowerCase().includes(q) ||
      l.recipientId?.toLowerCase().includes(q) ||
      l.phone?.includes(q) ||
      l.title?.toLowerCase().includes(q)
    );
  });

  const getTemplateBadge = (t) => {
    switch (t) {
      case "DEPLOYMENT_DISPATCH":
        return { label: "Deployment Notice", color: "bg-[#DEEBFF] text-[#0052CC]" };
      case "PAYSLIP_DELIVERY":
        return { label: "Payslip Advice", color: "bg-[#E3FCEF] text-[#00875A]" };
      case "LOAN_CREDIT":
        return { label: "Advance Disbursal", color: "bg-[#FFF0B3] text-[#B9770E]" };
      default:
        return { label: t, color: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#0F131C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00875A] text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                WhatsApp &amp; SMS Dispatch Logs
              </h3>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8]">
                Real-time delivery status &bull; {stats.totalLogs} total messages dispatched
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              title="Refresh logs"
              className="p-1.5 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] rounded-md transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] rounded-md transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="p-4 bg-[#FAFBFC] dark:bg-[#111622] border-b border-[#DFE1E6] dark:border-[#263042] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[#6B778C] dark:text-[#94A3B8]">Delivery Rate: </span>
              <span className="font-bold text-[#00875A] dark:text-[#36B37E]">{stats.deliveryRate}%</span>
            </div>
            <div className="px-3 py-1.5 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg">
              <span className="text-[#6B778C] dark:text-[#94A3B8]">Channel: </span>
              <span className="font-bold text-[#0052CC] dark:text-[#579DFF]">WhatsApp Click-to-Chat</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6B778C]" />
              <input
                type="text"
                placeholder="Search recipient, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg focus:outline-none focus:border-[#0052CC] w-48"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg focus:outline-none focus:border-[#0052CC]"
            >
              <option value="All">All Templates</option>
              <option value="DEPLOYMENT_DISPATCH">Deployment Notice</option>
              <option value="PAYSLIP_DELIVERY">Payslip Delivery</option>
              <option value="LOAN_CREDIT">Loan Alerts</option>
            </select>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#6B778C]">Loading dispatch history...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B778C]">
              No notification logs found matching criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getTemplateBadge(log.templateType);
              const waUrl = log.metadata?.waLink;

              return (
                <div
                  key={log.notificationId || log._id}
                  className="p-3.5 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xs hover:border-[#0052CC]/50 transition space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="font-bold text-xs text-[#172B4D] dark:text-[#F1F5F9]">
                        {log.recipientName}
                      </span>
                      <span className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                        ({log.recipientId})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                      <span className="flex items-center gap-1 text-[#00875A] font-semibold">
                        <CheckCheck className="w-3.5 h-3.5" /> Delivered
                      </span>
                      <span>&bull;</span>
                      <span>{new Date(log.deliveredAt || log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#42526E] dark:text-[#94A3B8] whitespace-pre-line line-clamp-3 bg-[#F4F5F7] dark:bg-[#0F131C] p-2.5 rounded-md font-mono text-[11px]">
                    {log.messageBody}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#6B778C] dark:text-[#94A3B8] flex items-center gap-1.5 text-[11px]">
                      <Phone className="w-3 h-3 text-[#00875A]" />
                      +{log.phone}
                    </span>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00875A] hover:underline"
                      >
                        <span>Open WhatsApp Chat</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#F4F5F7] dark:bg-[#0F131C] text-xs">
          <span className="text-[#6B778C] dark:text-[#94A3B8]">
            Showing {filteredLogs.length} of {logs.length} dispatches
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-[#F1F5F9] hover:bg-gray-100 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationLogModal;
