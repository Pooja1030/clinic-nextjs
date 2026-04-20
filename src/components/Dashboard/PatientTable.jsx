"use client";

import { useRouter } from "next/navigation";
import { FaHeartbeat, FaTint, FaUserAlt, FaCalendarAlt } from "react-icons/fa";

const PatientTable = ({ patients = [] }) => {
  const router = useRouter();

  if (!patients || patients.length === 0) {
    return <p className="text-gray-500 text-sm">No patients to show.</p>;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      {/* Desktop Table */}
<div className="hidden lg:block bg-white/70 backdrop-blur-xl ring-1 ring-gray-200 shadow-xl rounded-3xl overflow-hidden">
  <table className="min-w-full text-sm text-gray-700">
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 text-xs uppercase tracking-wider">
      <tr>
        <th className="p-3 text-left">Name</th>
        <th className="p-3 text-left">Email</th>
        <th className="p-3 text-left">Age</th>
        <th className="p-3 text-left">Blood Pressure</th>
        <th className="p-3 text-left">Heart Rate</th>
        <th className="p-3 text-left">Allergies</th>
        <th className="p-3 text-left">Last Visit</th>
        <th className="p-3 text-left">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white/60 backdrop-blur-md">
      {patients.map((p) => {
        const bp = p.vitals?.bloodPressure || "—";
        const hr =
          p.vitals?.heartRate && Number(p.vitals.heartRate) > 0
            ? p.vitals.heartRate
            : "—";
        const allergies =
          p.medicalHistory?.allergies?.length > 0
            ? p.medicalHistory.allergies.join(", ")
            : "None";
        const lastVisit =
          p.lastVisit ||
          p.appointments?.[p.appointments.length - 1]?.date ||
          null;

        return (
          <tr
            key={p._id}
            className="border-b hover:bg-indigo-50 cursor-pointer transition-all duration-200"
          >
            {/* Name */}
            <td className="p-3 font-medium text-gray-800">
              <span className="inline-flex items-center gap-2">
                <FaUserAlt className="text-indigo-500" />
                {p.name}
              </span>
            </td>

            {/* Email */}
            <td className="p-3">{p.email}</td>

            {/* Age */}
            <td className="p-3">{p.age || "—"}</td>

            {/* Blood Pressure */}
            <td className="p-3">
              <span className="inline-flex items-center gap-1">
                <FaTint className="text-red-500" />
                {bp}
              </span>
            </td>

            {/* Heart Rate */}
            <td className="p-3">
              <span className="inline-flex items-center gap-1">
                <FaHeartbeat className="text-pink-500" />
                {hr}
              </span>
            </td>

            {/* Allergies */}
            <td className="p-3">{allergies}</td>

            {/* Last Visit */}
            <td className="p-3">
              <span className="inline-flex items-center gap-1">
                <FaCalendarAlt className="text-gray-400" />
                {formatDate(lastVisit)}
              </span>
            </td>

            {/* Actions */}
            <td className="p-3 flex flex-wrap gap-2">
              <button
                onClick={() => router.push(`/doctor/patients/${p._id}`)}
                className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 shadow transition"
              >
                View
              </button>
              <button
                onClick={() => router.push(`/doctor/patients/${p._id}/edit`)}
                className="text-xs px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow transition"
              >
                Edit
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>


      {/* Mobile Stacked Cards */}
      <div className="lg:hidden space-y-4">
        {patients.map((p) => {
          const bp = p.vitals?.bloodPressure || "—";
          const hr =
            p.vitals?.heartRate && Number(p.vitals.heartRate) > 0
              ? p.vitals.heartRate
              : "—";
          const allergies =
            p.medicalHistory?.allergies?.length > 0
              ? p.medicalHistory.allergies.join(", ")
              : "None";
          const lastVisit =
            p.lastVisit ||
            p.appointments?.[p.appointments.length - 1]?.date ||
            null;

          return (
            <div
              key={p._id}
              className="p-4 rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl cursor-pointer transition hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="mb-3 flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/doctor/patients/${p._id}`);
                    }}
                    className="text-xs px-3 py-1 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 shadow transition"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/doctor/patients/${p._id}/edit`);
                    }}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow transition"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <p>
                  <strong>Age:</strong> {p.age || "—"}
                </p>
                <p className="flex items-center gap-1">
                  <FaTint className="text-red-500" />
                  <span>{bp}</span>
                </p>
                <p className="flex items-center gap-1">
                  <FaHeartbeat className="text-pink-500" />
                  <span>{hr}</span>
                </p>
                <p>
                  <strong>Allergies:</strong> {allergies}
                </p>
                <p className="col-span-2 flex items-center gap-1">
                  <FaCalendarAlt className="text-gray-400" />
                  <span>
                    <strong>Last Visit:</strong> {formatDate(lastVisit)}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientTable;
