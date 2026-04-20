"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { fetchWithAuth } from "@/utils/api";
import { FaCalendarAlt, FaClock, FaNotesMedical, FaInfoCircle, FaUser } from "react-icons/fa";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
];

const EditAppointmentPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState({
    patient: null,
    date: "",
    time: "",
    reason: "",
    status: "pending",
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadData = async () => {
      try {
        const appt = await fetchWithAuth(`${API_BASE}/api/appointments/${id}`);
        setAppointment({
  patient: appt.patientId, // full object { _id, name, email }
  date: appt.date,
  time: appt.time,
  reason: appt.reason,
  status: appt.status || "pending",
});
      } catch (err) {
        toast.error("Error loading appointment");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  const handleChange = (e) => {
    setAppointment({ ...appointment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointment.date || !appointment.time || !appointment.reason) {
      toast.error("Date, Time, and Reason are required");
      return;
    }
    try {
      await fetchWithAuth(`${API_BASE}/api/appointments/${id}`, "PUT", appointment);
      toast.success("Appointment updated successfully!");
      setTimeout(() => router.push("/doctor/appointments"), 1200);
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
  };

  return (
    <>
      <Toaster />
      <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow mt-10 space-y-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Edit Appointment</h2>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        ) : !appointment ? (
          <p className="text-red-500 text-center">Appointment not found.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient (read-only) */}
            <div className="flex flex-col">
              <label className="mb-1 text-gray-500 font-semibold flex items-center gap-2">
                <FaUser /> Patient
              </label>
              <input
                type="text"
                value={appointment.patient?.name || "Unknown"}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col">
              <label className="mb-1 text-gray-500 font-semibold flex items-center gap-2">
                <FaCalendarAlt /> Date
              </label>
              <input
                type="date"
                name="date"
                value={appointment.date?.slice(0, 10)}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Time */}
            <div className="flex flex-col">
              <label className="mb-1 text-gray-500 font-semibold flex items-center gap-2">
                <FaClock /> Time
              </label>
              <input
                type="time"
                name="time"
                value={appointment.time}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Reason */}
            <div className="flex flex-col">
              <label className="mb-1 text-gray-500 font-semibold flex items-center gap-2">
                <FaNotesMedical /> Reason
              </label>
              <input
                type="text"
                name="reason"
                placeholder="Reason"
                value={appointment.reason}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label className="mb-1 text-gray-500 font-semibold flex items-center gap-2">
                <FaInfoCircle /> Status
              </label>
              <select
                name="status"
                value={appointment.status}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-4 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded hover:opacity-90 transition"
              >
                Update Appointment
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default EditAppointmentPage;
