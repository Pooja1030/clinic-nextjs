"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { fetchWithAuth } from "@/utils/api";
import { FaUser, FaBell, FaCalendarAlt } from "react-icons/fa";

const EditReminderPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminder, setReminder] = useState({
    patientId: "",
    message: "",
    remindOn: "",
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rem, pats] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/reminders/${id}`),
          fetchWithAuth(`${API_BASE}/api/patients`),
        ]);
        setReminder({
          ...rem,
          patientId: rem.patientId?._id || rem.patientId || "",
        });
        setPatients(pats);
      } catch {
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  const handleChange = (e) => {
    setReminder({ ...reminder, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`${API_BASE}/api/reminders/${id}`, "PUT", reminder);
      toast.success("Reminder updated successfully");
      setTimeout(() => router.push("/doctor/reminders"), 1500);
    } catch (err) {
      toast.error(err.message || "Server error");
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="max-w-2xl mx-auto p-6 mt-10">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Edit Reminder</h2>

        {loading ? (
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">

            {/* Patient Select */}
            <div className="relative">
              <FaUser className="absolute top-3 left-3 text-gray-400" />
              <select
                name="patientId"
                value={reminder.patientId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="relative">
              <FaBell className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                name="message"
                value={reminder.message}
                onChange={handleChange}
                placeholder="Reminder message"
                className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Remind Date */}
            <div className="relative">
              <FaCalendarAlt className="absolute top-3 left-3 text-gray-400" />
              <input
                type="date"
                name="remindOn"
                value={reminder.remindOn ? reminder.remindOn.slice(0, 10) : ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Update Reminder
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default EditReminderPage;
