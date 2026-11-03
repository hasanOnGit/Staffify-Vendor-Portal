import React, { useState, useEffect } from "react";
import {
  QrCode,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  ShieldCheck,
  Radio,
  Zap,
} from "lucide-react";
import StatusLozenge from "../components/StatusLozenge";
import { kioskApi } from "../services/api";
import toast from "react-hot-toast";

function Kiosk() {
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [workerInput, setWorkerInput] = useState("WRK-8001");
  const [workerData, setWorkerData] = useState(null);
  const [loadingWorker, setLoadingWorker] = useState(false);
  const [recentPunches, setRecentPunches] = useState([]);
  const [loadingPunches, setLoadingPunches] = useState(false);
  const [punching, setPunching] = useState(false);
  const [overrideGeofence, setOverrideGeofence] = useState(false);

  // GPS coordinates state
  const [gps, setGps] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    accuracy: 15,
    simulated: true,
  });

  const selectedSite = sites.find((s) => s.siteId === selectedSiteId) || sites[0] || null;

  // Calculate distance on client side for display
  const distance = selectedSite?.geofence
    ? Math.round(
        Math.hypot(
          (gps.latitude - selectedSite.geofence.latitude) * 111320,
          (gps.longitude - selectedSite.geofence.longitude) * 110540
        )
      )
    : 25;

  const insideGeofence = selectedSite?.geofence
    ? distance <= (selectedSite.geofence.radiusMeters || 200)
    : true;

  useEffect(() => {
    loadSites();
    // Try browser geolocation if available
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            simulated: false,
          });
        },
        () => {
          // Fallback to default simulated site GPS
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    if (selectedSiteId) {
      loadRecentPunches(selectedSiteId);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (workerInput.trim().length >= 4) {
      lookupWorker(workerInput.trim());
    }
  }, [workerInput]);

  const loadSites = async () => {
    try {
      const res = await kioskApi.getSites();
      setSites(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedSiteId(res.data.data[0].siteId);
      }
    } catch (err) {
      toast.error("Failed to load work sites: " + err.message);
    }
  };

  const lookupWorker = async (id) => {
    try {
      setLoadingWorker(true);
      const res = await kioskApi.getWorker(id);
      setWorkerData(res.data.data);
    } catch {
      setWorkerData(null);
    } finally {
      setLoadingWorker(false);
    }
  };

  const loadRecentPunches = async (siteId) => {
    try {
      setLoadingPunches(true);
      const res = await kioskApi.getRecentPunches({ siteId });
      setRecentPunches(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPunches(false);
    }
  };

  const handlePunch = async (punchType) => {
    if (!workerInput.trim()) {
      toast.error("Please enter or scan a Worker ID.");
      return;
    }
    if (!selectedSite) {
      toast.error("Please select an active site location.");
      return;
    }

    try {
      setPunching(true);
      const res = await kioskApi.punch({
        workerId: workerInput.trim(),
        siteId: selectedSite.siteId,
        type: punchType,
        coordinates: {
          latitude: gps.latitude,
          longitude: gps.longitude,
        },
        overrideGeofence,
      });

      const punch = res.data.data;
      if (punch.status === "Verified") {
        toast.success(`Punch ${punchType} registered for ${punch.workerName}!`);
      } else {
        toast.error(`Punch notice: ${punch.status} (${punch.notes || "Check location"})`);
      }

      loadRecentPunches(selectedSite.siteId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit attendance punch.");
    } finally {
      setPunching(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#172B4D] dark:text-white tracking-tight flex items-center gap-2">
            <Radio size={22} className="text-[#0052CC] dark:text-[#579DFF]" />
            Site Punch Kiosk &amp; GPS Geofence Radar
          </h1>
          <p className="text-xs text-[#6B778C] dark:text-neutral-400 mt-0.5">
            Field supervisor gate terminal: scan worker QR gate passes, verify GPS site perimeter, and record instant punches
          </p>
        </div>

        {/* Site Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded px-3 py-1.5 shadow-2xs">
            <Building2 size={14} className="text-[#0052CC] shrink-0" />
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#172B4D] dark:text-white focus:outline-hidden cursor-pointer"
            >
              {sites.map((s) => (
                <option key={s.siteId} value={s.siteId} className="dark:bg-[#151B26]">
                  {s.siteName} ({s.clientName})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => loadRecentPunches(selectedSiteId)}
            className="p-2 rounded bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-neutral-300 hover:bg-gray-50 cursor-pointer shadow-2xs"
            title="Refresh feed"
          >
            <RefreshCw size={14} className={loadingPunches ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Grid Layout: Left Column = Scanner & Action Pad; Right Column = GPS Radar & Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Worker Gate Pass Terminal */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
            {/* Terminal Header */}
            <div className="p-4 bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-[#0052CC] dark:text-[#579DFF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#172B4D] dark:text-white">
                  Gate Pass Identification &amp; Scanner
                </span>
              </div>
              <span className="text-[11px] font-mono font-medium text-[#6B778C] dark:text-neutral-400">
                Turnstile Terminal #01
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Worker Search / Scan Input */}
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1.5">
                  Worker ID / QR Badge Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={workerInput}
                    onChange={(e) => setWorkerInput(e.target.value)}
                    placeholder="Scan QR or enter Worker ID (e.g. WRK-8001)..."
                    className="w-full bg-[#FAFBFC] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-md px-3.5 py-2.5 text-sm font-mono text-[#172B4D] dark:text-white focus:outline-hidden focus:border-[#0052CC]"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                    {loadingWorker ? (
                      <RefreshCw size={16} className="animate-spin text-[#0052CC]" />
                    ) : workerData ? (
                      <CheckCircle2 size={16} className="text-[#00875A]" />
                    ) : null}
                  </div>
                </div>

                {/* Quick Worker Test Pills */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-[#6B778C] dark:text-neutral-400 uppercase font-semibold">
                    Quick Sample Badges:
                  </span>
                  {["WRK-8001", "WRK-8002", "WRK-8004"].map((wId) => (
                    <button
                      key={wId}
                      type="button"
                      onClick={() => setWorkerInput(wId)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
                        workerInput === wId
                          ? "bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] border-[#B3D4FF] dark:border-[#263042] font-bold"
                          : "bg-white dark:bg-[#151B26] text-[#42526E] dark:text-neutral-300 border-[#DFE1E6] dark:border-[#263042]"
                      }`}
                    >
                      {wId}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Worker Preview Card */}
              {workerData ? (
                <div className="p-3.5 rounded-lg border border-[#B3D4FF] dark:border-[#263042] bg-[#DEEBFF]/30 dark:bg-[#151B26] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-[#0052CC] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                      {workerData.workerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#172B4D] dark:text-white flex items-center gap-1.5">
                        <span>{workerData.workerName}</span>
                        <StatusLozenge status={workerData.trade} size="xs" />
                      </div>
                      <div className="text-[11px] font-mono text-[#0052CC] dark:text-[#579DFF] mt-0.5">
                        Badge ID: {workerData.workerId} &bull; KYC: {workerData.kycStatus}
                      </div>
                      <div className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                        {workerData.activeDeployment
                          ? `Assigned: ${workerData.activeDeployment.siteName}`
                          : "Status: Available on Bench"}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-1 rounded text-[10px] font-bold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                    GATE PASS VALID
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-[#DFE1E6] dark:border-[#263042] text-center text-xs text-[#6B778C] dark:text-neutral-400">
                  Scan CR80 gate pass QR code or select a sample badge above to authenticate worker.
                </div>
              )}

              {/* Big Touch Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handlePunch("IN")}
                  disabled={punching || !workerData}
                  className="py-3 px-4 rounded-lg bg-[#00875A] hover:bg-[#006644] active:bg-[#004D34] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  <span>{punching ? "Punching..." : "PUNCH IN"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePunch("OUT")}
                  disabled={punching || !workerData}
                  className="py-3 px-4 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Clock size={18} />
                  <span>{punching ? "Punching..." : "PUNCH OUT"}</span>
                </button>
              </div>

              {/* Geofence Override Option */}
              <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[#6B778C] dark:text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overrideGeofence}
                    onChange={(e) => setOverrideGeofence(e.target.checked)}
                    className="rounded border-[#DFE1E6] text-[#0052CC] focus:ring-0"
                  />
                  <span>Supervisor Emergency Override (Ignore GPS Perimeter)</span>
                </label>

                {overrideGeofence && (
                  <span className="text-[10px] font-bold text-[#B9770E] dark:text-amber-400 bg-[#FFF0B3] dark:bg-amber-950/40 px-2 py-0.5 rounded">
                    OVERRIDE ENABLED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: GPS Geofence Radar & Live Feed */}
        <div className="lg:col-span-5 space-y-4">
          {/* Geofence Radar Card */}
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
                <h3 className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
                  Site Geofence Perimeter
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  insideGeofence
                    ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                    : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                }`}
              >
                {insideGeofence ? "INSIDE GEOFENCE" : "OUT OF BOUNDS"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#DFE1E6]/50 dark:border-[#263042]/50">
                <span className="text-[#6B778C] dark:text-neutral-400">Target Site:</span>
                <span className="font-semibold text-[#172B4D] dark:text-white truncate max-w-[200px]">
                  {selectedSite?.siteName || "Site"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#DFE1E6]/50 dark:border-[#263042]/50">
                <span className="text-[#6B778C] dark:text-neutral-400">Allowed Perimeter:</span>
                <span className="font-mono font-bold text-[#172B4D] dark:text-white">
                  {selectedSite?.geofence?.radiusMeters || 200} meters radius
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#DFE1E6]/50 dark:border-[#263042]/50">
                <span className="text-[#6B778C] dark:text-neutral-400">Calculated Distance:</span>
                <span
                  className={`font-mono font-bold ${
                    insideGeofence ? "text-[#00875A]" : "text-[#DE350B]"
                  }`}
                >
                  {distance} meters away
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#6B778C] dark:text-neutral-400">Device GPS:</span>
                <span className="font-mono text-[10px] text-[#42526E] dark:text-neutral-300">
                  {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)} ({gps.simulated ? "Simulated" : "Hardware"})
                </span>
              </div>
            </div>
          </div>

          {/* Supervisor Live Punch Activity Feed */}
          <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden flex flex-col">
            <div className="p-3 bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B4D] dark:text-white flex items-center gap-1.5">
                <Clock size={13} className="text-[#0052CC]" />
                Recent Site Punches
              </span>
              <span className="text-[10px] font-mono text-[#6B778C] dark:text-neutral-400">
                {recentPunches.length} recorded
              </span>
            </div>

            <div className="divide-y divide-[#DFE1E6] dark:divide-[#263042] max-h-[320px] overflow-y-auto">
              {recentPunches.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#6B778C] dark:text-neutral-400">
                  No punches recorded yet for this site today.
                </div>
              ) : (
                recentPunches.map((p) => (
                  <div key={p.punchId} className="p-3 hover:bg-gray-50 dark:hover:bg-[#151B26] transition flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#172B4D] dark:text-white flex items-center gap-1.5">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded text-white ${
                            p.type === "IN" ? "bg-[#00875A]" : "bg-[#0052CC]"
                          }`}
                        >
                          {p.type}
                        </span>
                        <span>{p.workerName}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#6B778C] dark:text-neutral-400 mt-0.5">
                        {p.workerId} &bull; {p.distanceMeters}m away &bull; {new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                    </div>
                    <StatusLozenge status={p.status} size="xs" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Kiosk;
