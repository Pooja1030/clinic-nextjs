"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/api";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Plus, X, Eye, Edit, Trash2, Search } from "lucide-react";
import Link from "next/link";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prescData, patientData] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/prescriptions`),
          fetchWithAuth(`${API_BASE}/api/patients`),
        ]);
        setPrescriptions(prescData);
        setPatients(patientData);
      } catch {
        toast.error("Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId || !diagnosis || medications.length === 0) {
      return toast.error("Please fill all required fields.");
    }
    try {
      setSubmitting(true);
      await fetchWithAuth(`${API_BASE}/api/prescriptions`, "POST", {
        patientId,
        diagnosis,
        notes,
        medications,
      });
      const updated = await fetchWithAuth(`${API_BASE}/api/prescriptions`);
      setPrescriptions(updated);

      // Reset
      setShowForm(false);
      setPatientId("");
      setDiagnosis("");
      setNotes("");
      setMedications([]);
      toast.success("Prescription added successfully!");
    } catch {
      toast.error("Failed to add prescription");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this prescription?")) return;
    try {
      await fetchWithAuth(`${API_BASE}/api/prescriptions/${id}`, "DELETE");
      setPrescriptions((prev) => prev.filter((p) => p._id !== id));
      toast.success("Prescription deleted");
    } catch {
      toast.error("Failed to delete prescription.");
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() && !recentSearches.includes(searchTerm)) {
      setRecentSearches((prev) => [searchTerm, ...prev.slice(0, 4)]);
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.patientId?.name?.toLowerCase().includes(term) ||
      p.diagnosis?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">Prescriptions</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? "Cancel" : "Add Prescription"}
            </button>
            <Link href="/doctor/prescriptions/upload">
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition">
                Upload (OCR)
              </button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-2/3">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search prescriptions by patient or diagnosis"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Search
            </button>
          </div>

          {recentSearches.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Recent Searches:</p>
              <div className="flex gap-2 flex-wrap">
                {recentSearches.map((term, idx) => (
                  <span
                    key={idx}
                    onClick={() => setSearchTerm(term)}
                    className="cursor-pointer bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Prescription Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6"
          >
            {/* Patient & Diagnosis */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-700 font-semibold">Select Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700 font-semibold">Diagnosis</label>
                <input
                  type="text"
                  placeholder="Diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-gray-700 font-semibold">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-3">
              <h3 className="text-blue-600 font-semibold text-lg">Medications</h3>
              <button
                type="button"
                onClick={() =>
                  setMedications([...medications, { name: "", dosage: "", duration: "" }])
                }
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mb-2"
              >
                + Add Medication
              </button>

              {medications.map((med, idx) => (
                <div key={idx} className="grid sm:grid-cols-4 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Name"
                    value={med.name}
                    onChange={(e) =>
                      setMedications((prev) =>
                        prev.map((m, i) => (i === idx ? { ...m, name: e.target.value } : m))
                      )
                    }
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) =>
                      setMedications((prev) =>
                        prev.map((m, i) => (i === idx ? { ...m, dosage: e.target.value } : m))
                      )
                    }
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={med.duration}
                    onChange={(e) =>
                      setMedications((prev) =>
                        prev.map((m, i) => (i === idx ? { ...m, duration: e.target.value } : m))
                      )
                    }
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setMedications((prev) => prev.filter((_, i) => i !== idx))}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Prescription"}
              </button>
            </div>
          </form>
        )}

        {/* Prescription List */}
        {loading ? (
          <p className="text-gray-500 text-center">Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 border">
            No prescriptions found.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">Patient</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">Diagnosis</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">Medications</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">Notes</th>
                  <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{p.patientId?.name}</td>
                    <td className="p-4">{p.diagnosis}</td>
                    <td className="p-4">
                      {p.medications?.map((m, i) => (
                        <span key={i} className="block text-sm text-gray-700">
                          {m.name} – {m.dosage} – {m.duration}
                        </span>
                      ))}
                    </td>
                    <td className="p-4">{p.notes || "-"}</td>
                    <td className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() => router.push(`/doctor/prescriptions/${p._id}`)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => router.push(`/doctor/prescriptions/${p._id}/edit`)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg"
                      >
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Prescriptions;
