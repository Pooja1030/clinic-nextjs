"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";
import Link from "next/link";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaNotesMedical,
  FaVenusMars,
  FaHeartbeat,
  FaFileMedical,
  FaPencilAlt,
  FaCommentDots,
} from "react-icons/fa";

const PatientDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("history");
  const isDoctor = true; // toggle based on user role if needed

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/patients/${id}`);
        setPatient(data);
      } catch {
        setError("Failed to fetch patient details");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadPatient();
  }, [id]);

  if (loading) return <SkeletonLoader />;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!patient) return <p className="p-6">Patient not found.</p>;

  const {
    name,
    email,
    disease,
    gender,
    age,
    lastVisit,
    vitals,
    medicalHistory,
    prescriptions,
    reports,
    appointments,
  } = patient;

  const tabs = [
    { key: "history", label: "Medical History" },
    { key: "prescriptions", label: "Prescriptions" },
    { key: "reports", label: "Reports" },
    { key: "appointments", label: "Appointments" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-5xl">
          <FaUser />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-2xl font-semibold flex items-center gap-3">
            <FaUser className="text-blue-500" /> {name}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <FaEnvelope className="text-gray-500" /> {email}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <FaNotesMedical className="text-gray-500" /> {disease || "N/A"}
          </p>
          <div className="flex gap-8 text-gray-600 flex-wrap">
            <span className="flex items-center gap-1">
              <FaVenusMars className="text-gray-500" /> {gender || "N/A"}
            </span>
            <span>Age: {age || "N/A"}</span>
            <span className="flex items-center gap-1">
              <FaCalendarAlt className="text-gray-500" /> Last Visit:{" "}
              {lastVisit ? new Date(lastVisit).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back
            </button>
            {isDoctor && (
              <>
                <Link
                  href={`/doctor/patients/${id}/edit`}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded shadow hover:opacity-90 flex items-center gap-2"
                >
                  <FaPencilAlt /> Edit
                </Link>
                <button
                  onClick={() => alert("Messaging not implemented")}
                  className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 flex items-center gap-2"
                >
                  <FaCommentDots /> Message
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vitals */}
      <CardSection title="Vitals" icon={<FaHeartbeat />} colored>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: "Blood Pressure", value: vitals?.bloodPressure },
            { label: "Heart Rate", value: vitals?.heartRate },
            { label: "Temperature", value: vitals?.temperature },
            { label: "Weight", value: vitals?.weight },
          ].map((v, i) => (
            <div key={i} className="bg-blue-50 p-3 rounded text-center">
              <p className="font-medium">{v.label}</p>
              <p className="text-gray-700">{v.value || "N/A"}</p>
            </div>
          ))}
        </div>
      </CardSection>

      {/* Tabs */}
      <div className="bg-white shadow rounded-xl">
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[200px]">
          {activeTab === "history" && (
            <MedicalHistorySection data={medicalHistory} />
          )}
          {activeTab === "prescriptions" && (
            <PatientPrescriptions data={prescriptions} />
          )}
          {activeTab === "reports" && <ReportsSection data={reports} />}
          {activeTab === "appointments" && (
            <PatientAppointments data={appointments} />
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------- Reusable Components -----------------

const CardSection = ({ title, icon, children, colored }) => (
  <div className={`shadow rounded-xl p-4 mb-6 ${colored ? "bg-white" : ""}`}>
    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
      {icon} {title}
    </h2>
    {children}
  </div>
);

const MedicalHistorySection = ({ data }) => (
  <>
    {["allergies", "surgeries", "chronicConditions"].map((field) => (
      <div key={field} className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {field.charAt(0).toUpperCase() + field.slice(1)}
        </h3>
        {data?.[field]?.length > 0 ? (
          <ul className="list-disc list-inside">
            {data[field].map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No {field} recorded.</p>
        )}
      </div>
    ))}
  </>
);

// ----------------- Patient-Specific Components -----------------

// ----------------- Patient-Specific Components -----------------

const PatientPrescriptions = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 py-4 border rounded-lg bg-gray-50 text-center">
        No prescriptions available for this patient.
      </p>
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-3 border">Name</th>
          <th className="p-3 border">Dosage</th>
          <th className="p-3 border">Frequency</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p, i) => (
          <tr key={i} className="border hover:bg-gray-50">
            <td className="p-3 border">{p.name}</td>
            <td className="p-3 border">{p.dosage}</td>
            <td className="p-3 border">{p.frequency}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PatientAppointments = ({ data }) => {
  const upcoming = data?.upcoming || [];
  const past = data?.past || [];

  return (
    <>
      <h3 className="font-semibold mb-2">Upcoming</h3>
      {upcoming.length > 0 ? (
        <ul className="list-disc list-inside mb-4">
          {upcoming.map((a, i) => (
            <li key={i}>
              {new Date(a.date).toLocaleDateString()} with Dr. {a.doctor} — {a.purpose}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 py-4 border rounded-lg bg-gray-50 text-center mb-4">
          No upcoming appointments.
        </p>
      )}

      <h3 className="font-semibold mb-2">Past</h3>
      {past.length > 0 ? (
        <ul className="list-disc list-inside">
          {past.map((a, i) => (
            <li key={i}>
              {new Date(a.date).toLocaleDateString()} with Dr. {a.doctor} — {a.purpose}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 py-4 border rounded-lg bg-gray-50 text-center">
          No past appointments.
        </p>
      )}
    </>
  );
};


const ReportsSection = ({ data }) =>
  data?.length > 0 ? (
    <ul className="space-y-2">
      {data.map((r, i) => (
        <li key={i} className="flex items-center gap-3">
          <FaFileMedical className="text-gray-500" />
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            {r.name}
          </a>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500">No reports available.</p>
  );

const SkeletonLoader = () => (
  <div className="p-6 space-y-4">
    <div className="animate-pulse bg-gray-200 h-32 w-full rounded-xl"></div>
    <div className="animate-pulse bg-gray-200 h-20 w-full rounded-xl"></div>
    <div className="animate-pulse bg-gray-200 h-64 w-full rounded-xl"></div>
  </div>
);

export default PatientDetailPage;
