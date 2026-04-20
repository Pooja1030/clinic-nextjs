"use client";

import { useEffect, useState, useMemo } from "react";
import { FaUserMd, FaCalendarCheck, FaUserCheck, FaClock, FaSearch } from "react-icons/fa";
import Link from "next/link";
import dynamic from "next/dynamic";
import CountUp from "react-countup";
import { fetchWithAuth } from "@/utils/api";

// Components
import StatCard from "@/components/Dashboard/StatCard";
import AppointmentCard from "@/components/Dashboard/AppointmentCard";
import PrescriptionCard from "@/components/Dashboard/PrescriptionCard";
import ReminderCard from "@/components/Dashboard/ReminderCard";
import PatientTable from "@/components/Dashboard/PatientTable";

// Dynamic imports for Recharts
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then(m => m.Legend), { ssr: false });
const ProgressRing = dynamic(() => import("@/components/Dashboard/ProgressRing"), { ssr: false });

// Colors
const GENDER_COLORS = ["#4f46e5", "#10b981", "#f59e0b"];
const REMINDER_COLORS = ["#6366f1", "#f43f5e", "#fbbf24"];

// Pie chart component
const RevampedPieChart = ({ data, title, colors }) => {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
const [activeIndex, setActiveIndex] = useState(null);

  if (!total) return <p className="text-gray-500 text-sm">No data to display</p>;

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-5 flex flex-col items-center hover:shadow-3xl transition">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="80%"
              paddingAngle={3}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              activeIndex={activeIndex ?? undefined}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={colors[i % colors.length]}
                  stroke={i === activeIndex ? "#000" : "#fff"}
                  strokeWidth={i === activeIndex ? 2 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}`, `${name}`]}
              contentStyle={{
                backgroundColor: "#f9fafb",
                borderRadius: 8,
                border: "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [apptData, prescData, patientData, reminderData] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/appointments`),
          fetchWithAuth(`${API_BASE}/api/prescriptions`),
          fetchWithAuth(`${API_BASE}/api/patients`),
          fetchWithAuth(`${API_BASE}/api/reminders`),
        ]);
        setAppointments(apptData || []);
        setPrescriptions((prescData || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setPatients(patientData || []);
        setReminders(reminderData || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [API_BASE]);

  // Stats
  const stats = useMemo(() => {
    const pending = appointments.filter(a => a.status === "pending").length;
    const upcomingCheckups = appointments.filter(a => {
      const apptDate = new Date(a.date);
      const diffDays = (apptDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    const sentMessages = reminders.filter(r => r.status === "SENT").length;

    return [
      { label: "Total Patients", value: patients.length, icon: <FaUserMd />, color: "from-blue-500 to-indigo-600" },
      { label: "Upcoming Checkups", value: upcomingCheckups, icon: <FaCalendarCheck />, color: "from-green-500 to-emerald-600" },
      { label: "Sent Messages", value: sentMessages, icon: <FaUserCheck />, color: "from-purple-500 to-fuchsia-600" },
      { label: "Pending Appointments", value: pending, icon: <FaClock />, color: "from-orange-500 to-red-600" },
    ];
  }, [appointments, patients, reminders]);

  // Completion rate
  const completionRate = useMemo(() => {
    if (!appointments.length) return 0;
    const completed = appointments.filter(a => a.status === "completed").length;
    return Math.round((completed / appointments.length) * 100);
  }, [appointments]);

  // Pie chart data
  const patientSegmentData = useMemo(() => {
    const counts = {};
    patients.forEach(p => counts[p.gender || "Other"] = (counts[p.gender || "Other"] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const reminderSegmentData = useMemo(() => {
    const counts = {};
    reminders.forEach(r => {
      const status = (r.status || "PENDING").toUpperCase();
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reminders]);

  // Search filter helper
  const matchesQuery = (field, query) =>
    field?.toString().toLowerCase().includes(query.toLowerCase());

  // Filters
  const filteredPatients = useMemo(() => {
    if (!query.trim()) return patients;
    return patients.filter(p => matchesQuery(p.name, query) || matchesQuery(p.email, query));
  }, [patients, query]);

  const filteredAppointments = useMemo(() => {
    if (!query.trim()) return appointments;
    return appointments.filter(a =>
      matchesQuery(a.patientId?.name, query) ||
      matchesQuery(a.patientId?.email, query) ||
      matchesQuery(a.status, query) ||
      matchesQuery(a.reason, query)
    );
  }, [appointments, query]);

  const filteredPrescriptions = useMemo(() => {
    if (!query.trim()) return prescriptions;
    return prescriptions.filter(p =>
      matchesQuery(p.patientId?.name, query) ||
      matchesQuery(p.patientId?.email, query) ||
      matchesQuery(p.medicine, query) ||
      matchesQuery(p.dosage, query) ||
      matchesQuery(p.instructions, query)
    );
  }, [prescriptions, query]);

  const filteredReminders = useMemo(() => {
    if (!query.trim()) return reminders;
    return reminders.filter(r =>
      matchesQuery(r.patientId?.name, query) ||
      matchesQuery(r.patientId?.email, query) ||
      matchesQuery(r.message, query) ||
      matchesQuery(r.status, query)
    );
  }, [reminders, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 min-h-screen">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Clinic overview at a glance</p>
          </div>
          <div className="flex items-center border rounded-full px-4 py-2 bg-white shadow-inner w-full sm:w-72 focus-within:ring-2 focus-within:ring-blue-400 transition">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search patients, appointments, prescriptions..."
              className="outline-none w-full text-sm bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard
            key={i}
            {...s}
            value={<CountUp end={s.value} duration={1.5} />}
            className={`bg-gradient-to-r ${s.color} text-white shadow-2xl rounded-2xl hover:scale-105 hover:shadow-3xl transition transform p-6`}
          />
        ))}
      </section>

      {/* Top Cards */}
      <section className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Appointments */}
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg">Recent Appointments</h2>
              <Link href="/doctor/appointments" className="text-blue-600 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            <AppointmentCard appointments={filteredAppointments.slice(0, 5)} />
          </div>

          {/* Prescriptions */}
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg">Recent Prescriptions</h2>
              <Link href="/doctor/prescriptions" className="text-blue-600 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            <PrescriptionCard prescriptions={filteredPrescriptions.slice(0, 5)} />
          </div>

          {/* Reminders */}
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg">Recent Reminders</h2>
              <Link href="/doctor/reminders" className="text-blue-600 text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            <ReminderCard reminders={filteredReminders.slice(0, 5)} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-5 flex flex-col items-center hover:shadow-3xl transition">
            <ProgressRing percentage={completionRate} />
            <span className="text-sm mt-2 font-medium text-gray-700">Weekly Completion</span>
          </div>
          <RevampedPieChart data={patientSegmentData} title="Patient Gender Distribution" colors={GENDER_COLORS} />
          <RevampedPieChart data={reminderSegmentData} title="Reminder Status" colors={REMINDER_COLORS} />
        </div>

        {/* Patients Table */}
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Patients Overview</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Total: {patients.length}</span>
              {query && (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                  Filtered: {filteredPatients.length}
                </span>
              )}
            </div>
          </div>
          <PatientTable patients={filteredPatients} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
