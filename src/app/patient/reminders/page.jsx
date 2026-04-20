"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/api";
import SearchInput from "@/components/common/SearchInput";
import { groupByDate } from "@/utils/groupByDate";
import ResetButton from "@/components/common/ResetButton";
import toast, { Toaster } from "react-hot-toast";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";

const PatientReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [remindersData, campaignsData] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/reminders`),
          fetchWithAuth(`${API_BASE}/api/campaigns/logs`),
        ]);

        const campaignsNormalized = campaignsData.map((c) => ({
          _id: c._id,
          message: c.message,
          remindOn: c.createdAt,
          status: c.status,
          doctorId: c.doctor || { name: "System" },
        }));

        const merged = [...remindersData, ...campaignsNormalized];

        const sorted = merged.sort(
          (a, b) => new Date(b.remindOn) - new Date(a.remindOn)
        );

        setReminders(sorted);
        setFiltered(sorted);
      } catch (err) {
        setError("Failed to load reminders or campaigns");
        toast.error("Could not load reminders or campaigns.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let updated = [...reminders];
    const today = new Date();

    if (statusFilter !== "all") {
      updated = updated.filter((r) => {
        const remindDate = new Date(r.remindOn);
        if (statusFilter === "MISSED") {
          return r.status === "PENDING" && remindDate < today;
        }
        return r.status === statusFilter.toUpperCase();
      });
    }

    if (searchTerm) {
      updated = updated.filter(
        (r) =>
          r.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.remindOn?.includes(searchTerm) ||
          r.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFiltered(updated);
  }, [statusFilter, searchTerm, reminders]);

  const grouped = groupByDate(filtered, "remindOn");

  const getStatusBadge = (status, remindOn) => {
    const today = new Date();
    const remindDate = new Date(remindOn);

    if (status?.toUpperCase() === "PENDING" && remindDate < today) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
          <XCircle className="w-4 h-4" /> Missed
        </span>
      );
    }

    switch (status?.toUpperCase()) {
      case "SENT":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle2 className="w-4 h-4" /> Sent
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-4 h-4" /> Failed
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <Hourglass className="w-4 h-4" /> Pending
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            N/A
          </span>
        );
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-purple-700 flex items-center gap-2">
              <Bell className="w-9 h-9 text-purple-600" />
              My Reminders
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Stay on top of prescriptions, medications, and campaigns.
            </p>
          </div>
        </div>

        {error && <p className="text-red-500 mb-6">{error}</p>}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <SearchInput
            placeholder="Search by message, date, or doctor name"
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="PENDING">Pending</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="MISSED">Missed</option>
          </select>
          <ResetButton
            onClick={() => {
              setStatusFilter("all");
              setSearchTerm("");
            }}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-600 shadow-inner">
            <p className="text-lg font-medium">Loading your reminders...</p>
            <p className="text-sm text-gray-400 mt-2">
              Please wait while we fetch your latest reminders.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center shadow-inner">
            <p className="text-lg font-medium text-gray-600">
              You have no reminders at the moment.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Once your doctor or system sets new reminders, they’ll appear
              here.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([label, group]) => (
            <div key={label} className="mb-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">
                {label}
              </h3>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((r) => (
                  <div
                    key={r._id}
                    className="relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col gap-6 hover:border-purple-300 hover:scale-[1.02]"
                  >
                    {/* Doctor / Creator Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl shadow-inner">
                        {r.doctorId?.name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Set By</p>
                        <p className="font-semibold text-gray-800 text-lg">
                          {r.doctorId?.name || "System"}
                        </p>
                      </div>
                    </div>

                    {/* Reminder Message */}
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Message</p>
                        <p className="text-gray-700">{r.message}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-500">Remind On</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(r.remindOn)}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mt-auto flex justify-between items-center">
                      {getStatusBadge(r.status, r.remindOn)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default PatientReminders;
