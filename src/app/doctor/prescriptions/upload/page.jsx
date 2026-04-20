"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import toast, { Toaster } from "react-hot-toast";
import { fetchWithAuth } from "@/utils/api";
import { useRouter } from "next/navigation";
import { parsePrescriptionText } from "../../../../../backend/utils/parsePrescription";
import { FaFileUpload, FaPills, FaUser, FaNotesMedical, FaPlus, FaTrash } from "react-icons/fa";

const UploadPrescriptionPage = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/patients`);
        setPatients(data);
      } catch {
        toast.error("Failed to load patients");
      }
    };
    loadPatients();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleOCR = () => {
    if (!image) return toast.error("Please upload an image first");
    setLoading(true);
    toast.loading("Extracting text...");
    Tesseract.recognize(image, "eng")
      .then(({ data: { text } }) => {
        setExtractedText(text);

        // Use improved parser
        const parsed = parsePrescriptionText(text);
        setDiagnosis(parsed.diagnosis || "");
        setNotes(parsed.notes || "");
        setMedications(Array.isArray(parsed.medications) ? parsed.medications.map((med) =>
          typeof med === "string" ? { name: med.trim(), dosage: "", duration: "" } : med
        ) : []);

        toast.dismiss();
        toast.success("Text extracted!");
      })
      .catch(() => toast.error("OCR failed"))
      .finally(() => setLoading(false));
  };

  const handleMedicationChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const addMedication = () => setMedications([...medications, { name: "", dosage: "", duration: "" }]);
  const removeMedication = (index) => setMedications(medications.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId || medications.length === 0) return toast.error("Required fields missing");
    try {
      const formData = new FormData();
      if (image) formData.append("image", image);

      const uploadRes = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData });
      const { imageUrl } = await uploadRes.json();

      await fetchWithAuth(`${API_BASE}/api/prescriptions`, "POST", {
        patientId, diagnosis, notes, medications, imageUrl, extractedText,
      });

      toast.success("Prescription saved!");
      router.push("/doctor/prescriptions");
    } catch {
      toast.error("Failed to submit");
    }
  };

  return (
    <>
      <Toaster />
      <div className="max-w-3xl mx-auto mt-10 space-y-6">

        {/* Upload & Preview */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <FaFileUpload /> Upload Prescription (OCR)
          </h2>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" />
          {preview && <img src={preview} alt="Preview" className="w-full max-h-80 object-contain rounded border mt-2" />}
          <button type="button" onClick={handleOCR} className={`w-full text-white px-4 py-2 rounded ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`} disabled={loading}>
            {loading ? "Processing..." : "Extract Text"}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-6">

          {/* Patient */}
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 flex items-center gap-2"><FaUser /> Select Patient</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" required>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          {/* Diagnosis & Notes */}
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 flex items-center gap-2"><FaNotesMedical /> Diagnosis</label>
            <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Diagnosis" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" />
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-gray-700">Additional Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" rows={3} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Medications */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2"><FaPills /> Medications</h3>
            {medications.map((med, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 sm:items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <input type="text" placeholder="Name" value={med.name} onChange={(e) => handleMedicationChange(index,"name", e.target.value)} className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-400" required />
                <input type="text" placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicationChange(index,"dosage", e.target.value)} className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-400" />
                <input type="text" placeholder="Duration" value={med.duration} onChange={(e) => handleMedicationChange(index,"duration", e.target.value)} className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-400" />
                <button type="button" onClick={() => removeMedication(index)} className="text-red-500 font-bold text-2xl hover:text-red-600"><FaTrash /></button>
              </div>
            ))}
            <button type="button" onClick={addMedication} className="flex items-center gap-2 text-blue-600 font-semibold hover:underline mt-2"><FaPlus /> Add Medication</button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 shadow-md rounded-lg">
            <button type="button" onClick={() => router.push("/doctor/prescriptions")} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Save Prescription</button>
          </div>

        </form>
      </div>
    </>
  );
};

export default UploadPrescriptionPage;
