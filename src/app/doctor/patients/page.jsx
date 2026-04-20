"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/api";
import toast, { Toaster } from "react-hot-toast";
import { Search, Eye, Edit, Trash2, Plus, X } from "lucide-react";

const badgeColors = {
  Male: "bg-blue-100 text-blue-600",
  Female: "bg-pink-100 text-pink-600",
  Other: "bg-purple-100 text-purple-600",
};

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [disease, setDisease] = useState("");
  const [gender, setGender] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsData, usersData] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/patients`),
          fetchWithAuth(`${API_BASE}/api/users?role=patient`),
        ]);
        setPatients(patientsData);
        setUsers(usersData);
      } catch {
        toast.error("Failed to load patient data.");
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error("Please select a patient.");

    try {
      await fetchWithAuth(`${API_BASE}/api/patients`, "POST", {
        userId: selectedUserId,
        name,
        email,
        age,
        disease,
        gender,
      });

      const updated = await fetchWithAuth(`${API_BASE}/api/patients`);
      setPatients(updated);

      setSelectedUserId("");
      setName("");
      setEmail("");
      setAge("");
      setDisease("");
      setGender("");
      setShowForm(false);

      toast.success("Patient added successfully");
    } catch {
      toast.error("Failed to add patient.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await fetchWithAuth(`${API_BASE}/api/patients/${id}`, "DELETE");
      setPatients((prev) => prev.filter((p) => p._id !== id));
      toast.success("Patient deleted");
    } catch {
      toast.error("Failed to delete patient");
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() && !recentSearches.includes(searchTerm)) {
      setRecentSearches((prev) => [searchTerm, ...prev.slice(0, 4)]);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      (p.mrn && p.mrn.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">
            Patients
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-2xl shadow-lg hover:scale-105 hover:from-green-600 hover:to-green-700 transition-all"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Cancel" : "Add Patient"}
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-gray-200 flex flex-col sm:flex-row gap-4 items-center sticky top-5 z-20 transition hover:shadow-2xl">
          <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 w-full sm:w-2/3 focus-within:ring-2 focus-within:ring-blue-400 transition">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search patients by name, MRN, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none bg-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-2xl shadow hover:scale-105 hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            Search
          </button>
        </div>

        {recentSearches.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {recentSearches.map((term, idx) => (
              <span
                key={idx}
                onClick={() => setSearchTerm(term)}
                className="cursor-pointer bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition"
              >
                {term}
              </span>
            ))}
          </div>
        )}

        {/* Add Patient Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6 transition hover:shadow-2xl"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              >
                <option value="">Select Registered Patient</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.email}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
              <input
                type="text"
                placeholder="Disease"
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-2xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Save Patient
              </button>
            </div>
          </form>
        )}

        {/* Patient List */}
        {patients.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-2xl text-center text-gray-500 border">
            No patients added yet.
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition hover:shadow-2xl">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Age
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Disease
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">
                    Gender
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, idx) => (
                  <tr
                    key={patient._id}
                    className={`border-b hover:bg-gray-50 transition ${
                      idx % 2 === 0 ? "bg-white/60" : "bg-gray-50/40"
                    }`}
                  >
                    <td className="p-4">{patient.name}</td>
                    <td className="p-4">{patient.email}</td>
                    <td className="p-4">{patient.age}</td>
                    <td className="p-4">{patient.disease}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block text-sm px-2 py-1 rounded-full ${badgeColors[patient.gender]}`}
                      >
                        {patient.gender}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() =>
                          router.push(`/doctor/patients/${patient._id}`)
                        }
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/doctor/patients/${patient._id}/edit`)
                        }
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                      >
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition"
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

export default PatientsPage;
