"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";
import toast, { Toaster } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaNotesMedical,
  FaVenusMars,
  FaHeartbeat,
  FaProcedures,
  FaPills,
} from "react-icons/fa";

const EditPatientPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    disease: "",
    lastVisit: "",
    vitals: { bloodPressure: "", heartRate: "", temperature: "", weight: "" },
    medicalHistory: { allergies: [], surgeries: [], chronicConditions: [] },
  });

  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/patients/${id}`);
        data.lastVisit = data.lastVisit ? new Date(data.lastVisit).toISOString().slice(0, 10) : "";
        setFormData({
          ...formData,
          name: data.name || "",
          email: data.email || "",
          age: data.age || "",
          gender: data.gender || "",
          disease: data.disease || "",
          lastVisit: data.lastVisit,
          vitals: { ...formData.vitals, ...data.vitals },
          medicalHistory: { ...formData.medicalHistory, ...data.medicalHistory },
        });
      } catch {
        toast.error("Failed to fetch patient");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPatient();
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleVitalsChange = (e) => setFormData({ ...formData, vitals: { ...formData.vitals, [e.target.name]: e.target.value } });
  const handleMedicalHistoryChange = (field, index, value) => {
    const updatedArray = [...formData.medicalHistory[field]];
    updatedArray[index] = value;
    setFormData({ ...formData, medicalHistory: { ...formData.medicalHistory, [field]: updatedArray } });
  };
  const addMedicalHistoryItem = (field) => setFormData({ ...formData, medicalHistory: { ...formData.medicalHistory, [field]: [...formData.medicalHistory[field], ""] } });
  const removeMedicalHistoryItem = (field, index) => {
    const updatedArray = [...formData.medicalHistory[field]];
    updatedArray.splice(index, 1);
    setFormData({ ...formData, medicalHistory: { ...formData.medicalHistory, [field]: updatedArray } });
  };

  const validateForm = () => {
    const { name, email, age, gender, disease } = formData;
    if (!name || !email || !age || !gender || !disease) {
      toast.error("All fields are required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const bodyData = { ...formData, age: Number(formData.age), lastVisit: formData.lastVisit ? new Date(formData.lastVisit).toISOString() : null };
    try {
      await fetchWithAuth(`${API_BASE}/api/patients/${id}`, "PUT", bodyData);
      toast.success("Patient updated successfully");
      setTimeout(() => {
        router.push(`/doctor/patients/${id}`);
        router.refresh();
      }, 1500);
    } catch {
      toast.error("Server error");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-600">Loading patient data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-blue-600 text-3xl font-bold shadow">{formData.name?.[0] || "P"}</div>
          <div className="text-white">
            <h1 className="text-2xl font-bold">{formData.name}</h1>
            <p>{formData.email}</p>
            <p className="text-sm">Last Visit: {formData.lastVisit ? new Date(formData.lastVisit).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <InputWithIcon icon={<FaUser />} label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <InputWithIcon icon={<FaEnvelope />} label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <InputWithIcon icon={<FaVenusMars />} label="Gender" name="gender" type="select" value={formData.gender} onChange={handleChange} options={["Male","Female","Other"]} />
            <InputWithIcon icon={<FaNotesMedical />} label="Disease" name="disease" value={formData.disease} onChange={handleChange} />
            <InputWithIcon icon={<FaCalendarAlt />} label="Last Visit" name="lastVisit" type="date" value={formData.lastVisit} onChange={handleChange} max={new Date().toISOString().slice(0,10)} />
            <InputWithIcon icon={<FaCalendarAlt />} label="Age" name="age" type="number" value={formData.age} onChange={handleChange} min={0} />
          </div>

          {/* Vitals */}
          <CardSection title="Vitals" icon={<FaHeartbeat />}>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { key: "bloodPressure", label: "Blood Pressure" },
      { key: "heartRate", label: "Heart Rate" },
      { key: "temperature", label: "Temperature" },
      { key: "weight", label: "Weight" },
    ].map((vital) => (
      <div key={vital.key} className="flex flex-col">
        <label className="text-gray-700 font-medium mb-1">{vital.label}</label>
        <input
          type="text"
          name={vital.key}
          placeholder={vital.label}
          value={formData.vitals[vital.key]}
          onChange={handleVitalsChange}
          className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>
    ))}
  </div>
</CardSection>


          {/* Medical History */}
          <CardSection title="Medical History" icon={<FaProcedures />}>
            {["allergies","surgeries","chronicConditions"].map((field) => (
              <div key={field} className="mb-4">
                <h3 className="font-semibold mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</h3>
                {formData.medicalHistory[field].map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <input type="text" value={item} onChange={(e)=>handleMedicalHistoryChange(field,idx,e.target.value)} className="flex-1 border p-2 rounded" placeholder={item || field.slice(0,-1)} />
                    <button type="button" onClick={()=>removeMedicalHistoryItem(field,idx)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">&times;</button>
                  </div>
                ))}
                <button type="button" onClick={()=>addMedicalHistoryItem(field)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Add {field.slice(0,-1)}</button>
              </div>
            ))}
          </CardSection>

          {/* Actions */}
          <div className="flex justify-between pt-4 sticky bottom-0 bg-white p-4 shadow">
            <button type="button" onClick={()=>router.back()} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition">Back</button>
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:opacity-90 transition">Update Patient</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable InputWithIcon Component
const InputWithIcon = ({ icon, label, name, value, onChange, type="text", options=[], min }) => (
  <div className="flex items-center gap-3 border p-3 rounded-lg focus-within:ring-2 focus-within:ring-blue-400">
    {icon} 
    {type === "select" ? (
      <select name={name} value={value} onChange={onChange} className="flex-1 outline-none bg-transparent">
        <option value="">Select {label}</option>
        {options.map((opt, i)=><option key={i} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={label} min={min} className="flex-1 outline-none bg-transparent" />
    )}
  </div>
);

// Card Section
const CardSection = ({ title, icon, children }) => (
  <div className="bg-white shadow rounded-xl p-4 mb-6">
    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">{icon} {title}</h2>
    {children}
  </div>
);

export default EditPatientPage;
