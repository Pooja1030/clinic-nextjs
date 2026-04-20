"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { fetchWithAuth } from "@/utils/api";
import { FaPills, FaNotesMedical, FaUser, FaPlus, FaTrash } from "react-icons/fa";

const EditPrescriptionPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadPrescription = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/prescriptions/${id}`);
        if (!data) throw new Error("No data received");

        // normalize medications
        if (Array.isArray(data.medications) && typeof data.medications[0] === "string") {
          data.medications = data.medications.map((med) => ({ name: med, dosage: "", duration: "" }));
        } else if (!Array.isArray(data.medications)) {
          data.medications = [];
        }
        setPrescription(data);
      } catch (err) {
        toast.error(err.message || "Failed to load prescription");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadPrescription();
  }, [id]);

  const handleChange = (e) => setPrescription({ ...prescription, [e.target.name]: e.target.value });

  const handleMedicationChange = (index, field, value) => {
    const meds = [...prescription.medications];
    meds[index][field] = value;
    setPrescription({ ...prescription, medications: meds });
  };

  const addMedication = () => {
    setPrescription({
      ...prescription,
      medications: [...prescription.medications, { name: "", dosage: "", duration: "" }],
    });
  };

  const removeMedication = (index) => {
    const meds = [...prescription.medications];
    meds.splice(index, 1);
    setPrescription({ ...prescription, medications: meds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`${API_BASE}/api/prescriptions/${id}`, "PUT", prescription);
      toast.success("Prescription updated successfully");
      router.push("/doctor/prescriptions");
    } catch (err) {
      toast.error(err.message || "Failed to update prescription");
    }
  };

  return (
    <>
      <Toaster />
      <div className="max-w-3xl mx-auto mt-10 p-6 space-y-6">
        <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
          <FaNotesMedical /> Edit Prescription
        </h2>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : !prescription ? (
          <p className="text-red-500">Prescription not found.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Diagnosis */}
            <div className="bg-white rounded-xl shadow p-5 space-y-2">
              <label className="font-semibold text-gray-700 flex items-center gap-2">
                <FaNotesMedical /> Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={prescription.diagnosis}
                onChange={handleChange}
                placeholder="Diagnosis"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-400"
                required
              />

              <label className="font-semibold text-gray-700 flex items-center gap-2 mt-3">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={prescription.notes || ""}
                onChange={handleChange}
                placeholder="Additional notes"
                rows={3}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Medications */}
            <div className="bg-white rounded-xl shadow p-5 space-y-3">
              <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                <FaPills /> Medications
              </h3>
              {prescription.medications.map((med, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <input
                    type="text"
                    placeholder="Name"
                    value={med.name}
                    onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                    className="w-24 p-2 border rounded focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={med.duration}
                    onChange={(e) => handleMedicationChange(index, "duration", e.target.value)}
                    className="w-24 p-2 border rounded focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-600 font-bold text-xl hover:bg-gray-100 p-1 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMedication}
                className="flex items-center gap-2 text-blue-600 font-semibold hover:underline mt-2"
              >
                <FaPlus /> Add Medication
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 shadow-md rounded-lg">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Update Prescription
              </button>
            </div>

          </form>
        )}
      </div>
    </>
  );
};

export default EditPrescriptionPage;
