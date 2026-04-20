"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchWithAuth } from "@/utils/api";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Plus, X, Eye, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import debounce from "lodash.debounce";
import Select from "react-select";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  confirmed: "bg-blue-100 text-blue-700 border border-blue-300",
  completed: "bg-green-100 text-green-700 border border-green-300",
};

const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
    return "Today";
  else if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  )
    return "Yesterday";
  else return date.toLocaleDateString();
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: null,
    date: "",
    time: "",
    reason: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [appts, pats] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/appointments`),
          fetchWithAuth(`${API_BASE}/api/patients`),
        ]);
        setAppointments(appts);
        setFilteredAppointments(appts);
        setPatients(pats);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Debounced search
  const handleSearchDebounced = useMemo(
    () =>
      debounce((term) => {
        setSearchTerm(term);
      }, 300),
    []
  );

  // Filter appointments
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7 = new Date(now);
    last7.setDate(now.getDate() - 7);

    const filtered = appointments.filter((appt) => {
      const apptDate = new Date(appt.date);
      const matchSearch =
        !searchTerm ||
        appt.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.status?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate =
        dateFilter === "all" ||
        (dateFilter === "7days" && apptDate >= last7) ||
        (dateFilter === "month" && apptDate >= startOfMonth);
      return matchSearch && matchDate;
    });

    setFilteredAppointments(filtered);
  }, [searchTerm, dateFilter, appointments]);

  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    return filteredAppointments.reduce((acc, appt) => {
      const label = formatDateLabel(appt.date);
      if (!acc[label]) acc[label] = [];
      acc[label].push(appt);
      return acc;
    }, {});
  }, [filteredAppointments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { patientId, date, time, reason, status } = formData;
    if (!patientId || !date || !time || !reason) {
      toast.error("All fields are required");
      return;
    }
    try {
      setSubmitting(true);
      await fetchWithAuth(`${API_BASE}/api/appointments`, "POST", {
        patientId: patientId.value,
        date,
        time,
        reason,
        status,
      });
      const updated = await fetchWithAuth(`${API_BASE}/api/appointments`);
      setAppointments(updated);
      setShowForm(false);
      setFormData({ patientId: null, date: "", time: "", reason: "", status: "pending" });
      toast.success("Appointment created successfully!");
    } catch {
      toast.error("Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await fetchWithAuth(`${API_BASE}/api/appointments/${id}`, "DELETE");
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Appointment deleted");
    } catch {
      toast.error("Failed to delete appointment.");
    }
  };

  const toggleCollapse = (label) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const patientOptions = patients.map((p) => ({
    value: p._id,
    label: `${p.name} (${p.email})`,
  }));

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">Appointments</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-2xl shadow-lg hover:scale-105 hover:from-green-600 hover:to-green-700 transition-all"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Cancel" : "Add Appointment"}
          </button>
        </div>

        {/* Search & Filters */}
        <div className="sticky top-5 z-20 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-gray-200 flex flex-col sm:flex-row gap-4 items-center transition hover:shadow-2xl">
          <input
            type="text"
            placeholder="Search by patient, reason, status"
            onChange={(e) => handleSearchDebounced(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
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
        </div>

        {/* Form Modal */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6 transition hover:shadow-2xl"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-700 font-semibold">Select Patient</label>
                <Select
                  options={patientOptions}
                  value={formData.patientId}
                  onChange={(val) => setFormData({ ...formData, patientId: val })}
                  placeholder="Select Patient"
                  isSearchable
                  required
                />
              </div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
              <input
                type="text"
                placeholder="Reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-2xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Appointment"}
              </button>
            </div>
          </form>
        )}

        {/* Appointment List */}
        {loading ? (
          <Skeleton count={5} height={100} className="rounded-2xl" />
        ) : Object.keys(groupedAppointments).length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-2xl text-center text-gray-500 border">
            No appointments found.
          </div>
        ) : (
          Object.entries(groupedAppointments).map(([label, appts]) => (
            <div key={label} className="space-y-4">
              <button
                onClick={() => toggleCollapse(label)}
                className="w-full flex justify-between items-center text-xl font-semibold text-gray-700 border-b pb-2 hover:text-blue-600 transition"
              >
                {label} ({appts.length}) {collapsedGroups[label] ? <ChevronDown /> : <ChevronUp />}
              </button>
              {!collapsedGroups[label] &&
                appts.map((appt) => (
                  <div
                    key={appt._id}
                    className="bg-white/80 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.01] transition flex flex-col sm:flex-row sm:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p>
                        <strong>Patient:</strong> {appt.patientId?.name}
                      </p>
                      <p>
                        <strong>Date:</strong> {appt.date?.slice(0, 10)}
                      </p>
                      <p>
                        <strong>Time:</strong> {appt.time}
                      </p>
                      <p>
                        <strong>Reason:</strong> {appt.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[appt.status]}`}
                      >
                        {appt.status}
                      </span>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => router.push(`/doctor/appointments/${appt._id}`)}
                          className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
                        >
                          <Eye size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => router.push(`/doctor/appointments/${appt._id}/edit`)}
                          className="bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(appt._id)}
                          className="bg-red-100 hover:bg-red-200 p-2 rounded-lg transition"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Appointments;
