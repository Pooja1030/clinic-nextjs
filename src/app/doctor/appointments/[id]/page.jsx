"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";
import toast, { Toaster } from "react-hot-toast";
import { 
  FaUser, 
  FaCalendarAlt, 
  FaClock, 
  FaNotesMedical, 
  FaInfoCircle, 
  FaArrowLeft, 
  FaCheckCircle 
} from "react-icons/fa";

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: <FaInfoCircle /> },
  confirmed: { color: "bg-blue-100 text-blue-800", icon: <FaClock /> },
  completed: { color: "bg-green-100 text-green-800", icon: <FaCheckCircle /> },
};

const ViewAppointmentPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/appointments/${id}`);
        setAppointment(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadAppointment();
  }, [id]);

  return (
    <>
      <Toaster />
      <div className="p-6 max-w-xl mx-auto mt-10 space-y-6">
        {/* Breadcrumb */}
        <div 
          className="flex items-center gap-2 text-gray-500 text-sm cursor-pointer hover:underline"
          onClick={() => router.push("/doctor/appointments")}
        >
          <FaArrowLeft /> Back to Appointments
        </div>

        <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
          <FaNotesMedical /> Appointment Details
        </h2>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        ) : !appointment ? (
          <p className="text-red-500 text-center">Appointment not found.</p>
        ) : (
          <div className="space-y-4">
            {/* Patient */}
            <div className="bg-white rounded-xl shadow p-5 flex items-center gap-3 hover:shadow-lg transition">
              <FaUser className="text-blue-500 text-2xl" />
              <div>
                <p className="text-gray-500 text-sm">Patient</p>
                <p className="font-semibold text-gray-800">{appointment.patientId?.name || "Unknown"}</p>
                {appointment.patientId?.email && <p className="text-gray-400 text-sm">{appointment.patientId.email}</p>}
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center flex-wrap gap-4 hover:shadow-lg transition">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" />
                <div>
                  <p className="text-gray-500 text-sm">Date</p>
                  <p className="font-semibold text-gray-800">{appointment.date?.slice(0, 10) || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-gray-500" />
                <div>
                  <p className="text-gray-500 text-sm">Time</p>
                  <p className="font-semibold text-gray-800">{appointment.time || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-2">
                <FaNotesMedical className="text-blue-500" />
                <p className="text-gray-500 text-sm">Reason</p>
              </div>
              <p className="text-gray-800">{appointment.reason || "-"}</p>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow p-5 flex items-center gap-2 hover:shadow-lg transition">
              {statusConfig[appointment.status]?.icon}
              <span className={`px-3 py-1 rounded-full font-medium ${statusConfig[appointment.status]?.color}`}>
                {appointment.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-4 flex-wrap gap-2">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => router.push(`/doctor/appointments/${id}/edit`)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded hover:from-blue-600 hover:to-blue-800 transition"
              >
                Edit
              </button>
              <button
                onClick={() => toast("Reschedule feature coming soon!")}
                className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
              >
                Reschedule
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewAppointmentPage;
