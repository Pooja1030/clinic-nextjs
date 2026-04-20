"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  X,
  Pill,
  Stethoscope,
  FileDown,
  CheckCircle,
  Activity,
} from "lucide-react";
import { fetchWithAuth } from "@/utils/api";
import { groupByDate } from "@/utils/groupByDate";
import ResetButton from "@/components/common/ResetButton";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/Shared/Modal";

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [diagnosisFilter, setDiagnosisFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalData, setModalData] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/prescriptions/profile`);
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPrescriptions(sorted);
        setFiltered(sorted);
      } catch (err) {
        setError(err.message || "Failed to load prescriptions");
        toast.error("Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    };
    loadPrescriptions();
  }, []);

  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const filteredList = prescriptions.filter((p) => {
      const created = new Date(p.createdAt);
      const matchesSearch = p.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDiagnosis = p.diagnosis?.toLowerCase().includes(diagnosisFilter.toLowerCase());

      const matchDate =
        dateFilter === "all" ||
        (dateFilter === "7days" && created >= sevenDaysAgo) ||
        (dateFilter === "month" && created >= startOfMonth);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !p.taken) ||
        (statusFilter === "completed" && p.taken);

      return matchesSearch && matchesDiagnosis && matchDate && matchStatus;
    });

    setFiltered(filteredList);
  }, [searchTerm, diagnosisFilter, prescriptions, dateFilter, statusFilter]);

  const grouped = groupByDate(filtered, "createdAt");

  // Fake PDF feature
  const handlePDF = () => {
    toast("📄 PDF download coming soon!", {
      icon: "⏳",
      style: { background: "#f9fafb", border: "1px solid #e5e7eb" },
    });
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            💊 My Prescriptions
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Track, review, and manage prescriptions issued by your doctors.
          </p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-10 p-5 rounded-2xl border border-gray-200 bg-white shadow-md"
        >
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Search doctor */}
            <div className="col-span-12 md:col-span-6 lg:col-span-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by doctor name..."
                  className="w-full h-12 pl-12 pr-12 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/40"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Diagnosis filter */}
            <div className="col-span-6 md:col-span-3">
              <input
                type="text"
                placeholder="Diagnosis"
                value={diagnosisFilter}
                onChange={(e) => setDiagnosisFilter(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Date filter */}
            <div className="col-span-6 md:col-span-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="col-span-12 md:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <ResetButton
              onClick={() => {
                setSearchTerm("");
                setDiagnosisFilter("");
                setDateFilter("all");
                setStatusFilter("all");
              }}
            />
          </div>
        </motion.div>

        {/* Loading / Error */}
        {loading && <p className="text-gray-500 text-center mt-10 animate-pulse">Loading prescriptions...</p>}
        {error && !loading && <p className="text-red-500 text-center mt-4">{error}</p>}

        {/* Prescriptions */}
        {!loading && filtered.length === 0 ? (
          <p className="italic text-gray-500 text-center py-16">No prescriptions found. Try adjusting filters.</p>
        ) : (
          Object.entries(grouped).map(([label, group]) => (
            <div key={label} className="mb-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">{label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {group.map((presc, index) => (
                  <motion.div
                    key={presc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-2xl border border-gray-200 bg-white shadow hover:shadow-xl transition"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-blue-700">
                        <Stethoscope className="w-5 h-5" /> Dr. {presc.doctor || "Unknown"}
                      </h3>
                      <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {presc.createdAt?.slice(0, 10)}
                      </span>
                    </div>

                    {/* Diagnosis */}
                    <p className="mb-2">
                      <strong>Diagnosis:</strong>{" "}
                      {presc.diagnosis || <i className="text-gray-400">Not specified</i>}
                    </p>
                    {presc.notes && (
                      <p className="mb-2">
                        <strong>Notes:</strong> {presc.notes}
                      </p>
                    )}

                    {/* Medications */}
                    <div className="mb-4">
                      <strong className="block mb-2">Medications ({presc.medications?.length || 0}):</strong>
                      {Array.isArray(presc.medications) && presc.medications.length > 0 ? (
                        <ul className="space-y-1">
                          {presc.medications.map((med, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-700">
                              <Pill className="w-4 h-4 text-indigo-500" />
                              <span>
                                <strong>{med.name || "Unnamed"}</strong> – {med.dosage || "No dosage"} –{" "}
                                {med.duration || "No duration"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-gray-400">No medications listed</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 flex justify-between items-center">
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          presc.taken
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {presc.taken ? (
                          <>
                            <CheckCircle className="w-4 h-4" /> Completed
                          </>
                        ) : (
                          <>
                            <Activity className="w-4 h-4" /> Active
                          </>
                        )}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setModalData(presc)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm shadow hover:from-blue-600 hover:to-indigo-700"
                        >
                          View Details
                        </button>
                        <button
                          onClick={handlePDF}
                          className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
                        >
                          <FileDown className="w-4 h-4" /> PDF
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal open={!!modalData} onClose={() => setModalData(null)}>
        {modalData && (
          <div className="p-6 bg-white rounded-xl">
            <h2 className="text-xl font-bold text-blue-700 mb-4">
              Prescription Details
            </h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>👨‍⚕️ Doctor:</strong> Dr. {modalData.doctor}</p>
              <p><strong>📅 Date:</strong> {modalData.createdAt?.slice(0, 10)}</p>
              <p><strong>🩺 Diagnosis:</strong> {modalData.diagnosis || "—"}</p>
              {modalData.notes && <p><strong>📝 Notes:</strong> {modalData.notes}</p>}
            </div>
            <div className="mt-4">
              <strong>💊 Medications:</strong>
              {modalData.medications?.length ? (
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  {modalData.medications.map((m, i) => (
                    <li key={i}>{m.name} – {m.dosage} – {m.duration}</li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-gray-400 mt-2">No medications listed</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PatientPrescriptions;
