"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/api";
import SearchInput from "@/components/common/SearchInput";
import ResetButton from "@/components/common/ResetButton";
import { groupByDate } from "@/utils/groupByDate";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Hourglass,
  CheckCheck,
  XCircle,
  RotateCw,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PatientAppointments = () => {
  const [allAppointments, setAllAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/appointments/profile`);
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllAppointments(sorted);
      } catch (err) {
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, []);

  const filtered = allAppointments.filter((a) => {
    const matchDoctor = a.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status?.toLowerCase() === statusFilter;
    return matchDoctor && matchStatus;
  });

  const grouped = groupByDate(filtered, "date");

  const formatDateTime = (date, time) => {
    const d = new Date(date);
    return `${d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}${time ? " · " + time : ""}`;
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle2 className="w-4 h-4" /> Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <Hourglass className="w-4 h-4" /> Pending
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <CheckCheck className="w-4 h-4" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-4 h-4" /> Cancelled
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

  const handleCancel = async (id) => {
    try {
      await fetchWithAuth(`${API_BASE}/api/appointments/${id}`, "DELETE");
      toast.success("Appointment cancelled");
      setAllAppointments(allAppointments.filter((a) => a.id !== id));
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-blue-700 flex items-center gap-2">
              <ClipboardList className="w-9 h-9 text-blue-600" />
              My Appointments
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Track upcoming visits, past consultations, and more.
            </p>
          </div>
          <Link
            href="/patient/appointments/book"
            className="mt-6 sm:mt-0 inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-7 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition"
          >
            + Book Appointment
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <SearchInput
            placeholder="Search by doctor name"
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <ResetButton onClick={() => setSearchTerm("")} />

          <div className="flex gap-2 ml-auto">
            {["all", "upcoming", "confirmed", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  statusFilter === status
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-14 text-center flex flex-col items-center gap-4 shadow-inner">
            <CalendarDays className="w-10 h-10 text-gray-400" />
            <p className="italic text-gray-500 text-lg">
              No appointments found.{" "}
              <Link href="/patient/appointments/book" className="text-blue-600 underline">
                Book one now
              </Link>
              .
            </p>
          </div>
        )}

        {/* Appointment list */}
        <AnimatePresence>
          {!loading &&
            filtered.length > 0 &&
            Object.entries(grouped).map(([label, group]) => (
              <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">{label}</h3>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((appt) => (
                    <div
                      key={appt.id}
                      className="relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col gap-6"
                    >
                      {/* Doctor */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                          {appt.doctor?.charAt(0) || "D"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{appt.doctor}</p>
                          {appt.doctorId?.specialization && (
                            <p className="text-xs text-gray-500">{appt.doctorId.specialization}</p>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <CalendarDays className="w-4 h-4" /> {formatDateTime(appt.date, appt.time)}
                      </div>

                      {/* Reason */}
                      <p className="text-sm text-gray-700">📝 {appt.reason || "No reason provided"}</p>

                      {/* Status + Actions */}
                      <div className="mt-auto flex justify-between items-center">
                        {getStatusBadge(appt.status)}
                        {appt.status?.toLowerCase() === "confirmed" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => toast("Reschedule coming soon!")}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                            >
                              <RotateCw className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="p-2 rounded-lg bg-red-100 hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default PatientAppointments;
