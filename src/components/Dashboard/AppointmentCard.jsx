"use client";

import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";
import { groupByDate } from "@/utils/groupByDate";
import { FaCheckCircle, FaClock, FaCalendarAlt } from "react-icons/fa";

const AppointmentCard = ({ appointments = [], setAppointments, metrics = {} }) => {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const groupedAppointments = groupByDate(appointments, "date");

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    await fetchWithAuth(`${API_BASE}/api/appointments/${id}`, "DELETE");
    if (setAppointments) {
      const updated = await fetchWithAuth(`${API_BASE}/api/appointments`);
      setAppointments(updated);
    } else location.reload();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <FaCheckCircle className="text-green-500" />;
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "completed":
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 min-h-[380px] border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaCalendarAlt className="text-indigo-500" /> Recent Appointments
      </h2>

      {appointments.length === 0 ? (
        <p className="text-sm text-gray-500">No appointments available.</p>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
          {Object.entries(groupedAppointments).map(([date, items]) => (
            <div key={date}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{date}</h4>
              {items.map((appt) => (
                <div
                  key={appt._id}
                  className="flex flex-col p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white shadow-md border border-gray-100 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                      {getStatusIcon(appt.status)} {appt.patientId?.name || "Unknown"}
                    </h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold shadow ${getStatusBadge(
                        appt.status
                      )}`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Date:</strong> {appt.date?.slice(0, 10) || "—"}</p>
                    <p><strong>Time:</strong> {appt.time || "—"}</p>
                    <p><strong>Reason:</strong> {appt.reason || "—"}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => router.push(`/doctor/appointments/${appt._id}`)}
                      className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 shadow transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/doctor/appointments/${appt._id}/edit`)}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(appt._id)}
                      className="text-xs px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Footer Metrics */}
      {metrics && (
        <div className="mt-4 flex flex-wrap gap-2">
          {metrics.total && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              Total: {metrics.total}
            </span>
          )}
          {metrics.upcoming && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Upcoming: {metrics.upcoming}
            </span>
          )}
          {metrics.completed && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              Completed: {metrics.completed}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
