import { FaCapsules, FaNotesMedical } from "react-icons/fa";

const PrescriptionCard = ({ prescriptions = [], metrics = {} }) => {
  return (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 min-h-[380px] border border-gray-200">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaNotesMedical className="text-emerald-500" /> Recent Prescriptions
      </h2>

      {/* Prescription List */}
      {prescriptions.length === 0 ? (
        <p className="text-sm text-gray-500">No prescriptions available.</p>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
          {prescriptions.slice(0, 5).map((prescription, idx) => (
            <div
              key={prescription._id || idx}
              className="flex flex-col p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white shadow-md border border-gray-100 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-md font-semibold text-gray-800">
                  {prescription.patientId?.name || "Unknown"}
                </h3>
                <span className="flex items-center gap-1 text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                  <FaCapsules /> Prescription
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">Date: {prescription.date?.slice(0, 10) || "—"}</p>
              <p className="text-sm text-gray-700"><strong>Diagnosis:</strong> {prescription.diagnosis || "—"}</p>
              <p className="text-sm text-gray-700">
                <strong>Medications:</strong>{" "}
                {Array.isArray(prescription.medications) && prescription.medications.length > 0
                  ? prescription.medications.map((m) => `${m.name || "?"} (${m.dosage || "?"}, ${m.duration || "?"})`).join(", ")
                  : "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer Metrics */}
      <div className="mt-4 flex flex-wrap gap-2">
        {metrics.completionRate !== undefined && (
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Completion: {metrics.completionRate}%
          </span>
        )}
        {metrics.avgMeds !== undefined && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Avg. Meds / Script: {metrics.avgMeds}
          </span>
        )}
        {metrics.last7Days !== undefined && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            Last 7 Days: {metrics.last7Days}
          </span>
        )}
      </div>
    </div>
  );
};

export default PrescriptionCard;
