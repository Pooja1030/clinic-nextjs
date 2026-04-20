"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { fetchWithAuth } from "@/utils/api";
import { FaUser, FaCalendarAlt, FaNotesMedical, FaPills, FaImage, FaPrint } from "react-icons/fa";

const ViewPrescriptionPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadPrescription = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/prescriptions/${id}`);
        setPrescription(data);
      } catch {
        toast.error("Failed to load prescription");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadPrescription();
  }, [id]);

  const handlePrint = () => {
    if (!prescription) return;
    window.print();
  };

  return (
    <>
      <Toaster />
      <div className="p-6 max-w-3xl mx-auto mt-10 space-y-6">

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : !prescription ? (
          <p className="text-red-500">No prescription found.</p>
        ) : (
          <>
            {/* Print / View Wrapper */}
            <div className="print-area space-y-6">

              {/* Header */}
              <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
                <FaNotesMedical /> Prescription Details
              </h2>

              {/* Patient & Date */}
              <div className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FaUser className="text-blue-500 text-xl" />
                  <span className="font-semibold text-gray-700">{prescription.patientId?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-gray-500" />
                  <span className="text-gray-600">{prescription.date?.slice(0,10) || "N/A"}</span>
                </div>
              </div>

              {/* Diagnosis & Notes */}
              <div className="bg-white rounded-xl shadow p-5 space-y-3">
                <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                  <FaNotesMedical /> Diagnosis
                </h3>
                <p className="text-gray-700">{prescription.diagnosis || "-"}</p>

                {prescription.notes && (
                  <>
                    <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2 mt-3">
                      <FaNotesMedical /> Notes
                    </h3>
                    <p className="text-gray-700">{prescription.notes}</p>
                  </>
                )}
              </div>

              {/* Medications */}
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2 mb-3">
                  <FaPills /> Medications
                </h3>
                {prescription.medications?.length > 0 ? (
                  <ul className="space-y-2">
                    {prescription.medications.map((med, idx) => (
                      <li key={idx} className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row sm:justify-between items-start sm:items-center hover:bg-gray-100 transition">
                        <span className="font-medium text-gray-800">{med.name || <em>Unnamed</em>}</span>
                        <div className="flex gap-2 mt-1 sm:mt-0">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">{med.dosage || "No dosage"}</span>
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-sm">{med.duration || "No duration"}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No medications listed.</p>
                )}
              </div>

              {/* Prescription Image */}
              {prescription.imageUrl && (
                <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                    <FaImage /> Prescription Image
                  </h3>
                  <img
                    src={prescription.imageUrl}
                    alt="Prescription"
                    className="w-full max-h-96 object-contain rounded border cursor-pointer hover:opacity-90"
                    onClick={() => setShowImageModal(true)}
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-3 no-print">
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <FaPrint /> Print
              </button>
              <button
                onClick={() => router.back()}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Back
              </button>
            </div>

            {/* Image Modal */}
            {showImageModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 no-print">
                <div className="bg-white p-4 rounded shadow max-w-3xl w-full relative">
                  <button
                    className="absolute top-2 right-2 text-red-500 text-2xl font-bold"
                    onClick={() => setShowImageModal(false)}
                  >×</button>
                  <img src={prescription.imageUrl} alt="Prescription" className="w-full max-h-[80vh] object-contain rounded"/>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ViewPrescriptionPage;
