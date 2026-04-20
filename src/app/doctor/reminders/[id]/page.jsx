"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { fetchWithAuth } from "@/utils/api";
import { FaUser, FaCalendarAlt, FaBell, FaClipboardList, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";

const ViewReminderPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadReminder = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/reminders/${id}`);
        setReminder(data);
      } catch {
        toast.error("Failed to load reminder");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadReminder();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "SENT":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800"><FaCheckCircle /> {status}</span>;
      case "FAILED":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800"><FaTimesCircle /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800"><FaExclamationCircle /> {status}</span>;
    }
  };

  return (
    <>
      <Toaster />
      <div className="max-w-3xl mx-auto mt-10 space-y-6">

        <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
          <FaBell /> Reminder Details
        </h2>

        {loading ? (
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        ) : !reminder ? (
          <p className="text-red-500">No reminder found.</p>
        ) : (
          <>
            {/* Patient & Date Card */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 border-l-4 border-blue-400">
              <div className="flex items-center gap-3">
                <FaUser className="text-blue-500 text-xl" />
                <span className="font-semibold text-gray-700">{reminder.patientId?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-gray-500" />
                <span className="text-gray-600">{reminder.remindOn?.slice(0, 10) || "N/A"}</span>
              </div>
            </div>

            {/* Message Card */}
            <div className="bg-white rounded-xl shadow p-5 space-y-3 border-l-4 border-yellow-400">
              <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                <FaClipboardList /> Message
              </h3>
              <p className="text-gray-700">{reminder.message || "-"}</p>
            </div>

            {/* Status Card */}
            {reminder.status && (
              <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-400">
                <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                  <FaBell /> Status
                </h3>
                <div className="mt-2">{getStatusBadge(reminder.status)}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end mt-4 sticky bottom-0 bg-white py-3">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => router.push(`/doctor/reminders/${id}/edit`)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Edit
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ViewReminderPage;
