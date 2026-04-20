"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/useAuth";
import { fetchWithAuth } from "@/utils/api";
import dynamic from "next/dynamic";
import Modal from "@/components/Shared/Modal";
import AppointmentForm from "@/components/Forms/AppointmentForm";
import PrescriptionForm from "@/components/Forms/PrescriptionForm";
import ReminderForm from "@/components/Forms/ReminderForm";
import { FaCalendarAlt, FaBell, FaClipboardList, FaPills, FaCheckCircle, FaUser } from "react-icons/fa";

const ProgressRing = dynamic(() => import("@/components/Dashboard/ProgressRing"), { ssr: false });
const StackedBarChart = dynamic(() => import("@/components/Dashboard/StackedBarChart"), { ssr: false });

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: null });
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [apptData, prescData, reminderData] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/appointments/profile`),
          fetchWithAuth(`${API_BASE}/api/prescriptions/profile`),
          fetchWithAuth(`${API_BASE}/api/reminders/profile`)
        ]);

        setAppointments(apptData || []);
        setPrescriptions(prescData || []);
        setReminders(reminderData || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [API_BASE]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDoctorName = (item) => {
    if (item.doctor) return `Dr. ${item.doctor}`;
    if (item.doctorName) return `Dr. ${item.doctorName}`;
    return "Dr. Unknown";
  };

  const getMedications = (presc) =>
    presc.medications?.length
      ? presc.medications.map((m) => `${m.name || ""}${m.dosage ? ` - ${m.dosage}` : ""}${m.duration ? ` for ${m.duration}` : ""}`).join(", ")
      : "No meds";

  // --- Stats Cards ---
  const stats = useMemo(() => {
    const apptsToday = appointments.filter(a => a.date && new Date(a.date).toDateString() === today.toDateString()).length;
    const completed = appointments.filter(a => a.status === "completed").length;
    const pending = appointments.filter(a => a.status === "pending").length;
    const pendingPresc = prescriptions.filter(p => !p.taken).length;
    const upcomingRem = reminders.filter(r => r.remindOn && new Date(r.remindOn) >= today).length;

    return [
      { label: "Appointments Today", value: apptsToday, color: "green", icon: <FaCalendarAlt /> },
      { label: "Completed Appointments", value: completed, color: "blue", icon: <FaCheckCircle /> },
      { label: "Pending Appointments", value: pending, color: "orange", icon: <FaCalendarAlt /> },
      { label: "Pending Prescriptions", value: pendingPresc, color: "purple", icon: <FaPills /> },
      { label: "Upcoming Reminders", value: upcomingRem, color: "teal", icon: <FaBell /> },
    ];
  }, [appointments, prescriptions, reminders, today]);

  // Completion Rate %
  const completionRate = useMemo(() => {
    const total = appointments.length;
    if (!total) return 0;
    const completed = appointments.filter((a) => a.status === "completed").length;
    return Math.round((completed / total) * 100);
  }, [appointments]);

  // Prescription Stats
  const prescriptionStats = useMemo(() => {
    if (!prescriptions.length) return { avgMeds: 0, last7Days: 0, total: 0, takenCount: 0 };
    const now = new Date();
    const last7 = prescriptions.filter(p => p.createdAt && (now - new Date(p.createdAt)) / (1000*60*60*24) <= 7);
    const avgMeds = Math.round(prescriptions.reduce((sum,p) => sum + (p.medications?.length || 0),0)/prescriptions.length);
    const takenCount = prescriptions.filter(p => p.taken).length;
    return { avgMeds, last7Days: last7.length, total: prescriptions.length, takenCount };
  }, [prescriptions]);

  // Weekly Appointments Chart
  const weeklyAppointments = useMemo(() => {
    const week = Array(7).fill(0);
    const today = new Date();
    appointments.forEach(a => {
      if (!a.date) return;
      const apptDate = new Date(a.date);
      const diffDays = Math.floor((apptDate - today) / (1000*60*60*24));
      if (diffDays >= 0 && diffDays < 7) week[apptDate.getDay()] += 1;
    });
    return week;
  }, [appointments]);

  const upcomingReminders = useMemo(() => reminders.filter(r => r.remindOn && new Date(r.remindOn) >= today), [reminders, today]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
        Welcome, <span className="text-blue-600">{user?.name || "Patient"}</span>
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Loading your dashboard...</p>
      ) : (
        <>
          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-8">
            {stats.map((s, i) => {
              const bgGradient = {
                green: "bg-gradient-to-r from-green-400 to-green-600",
                blue: "bg-gradient-to-r from-blue-400 to-blue-600",
                orange: "bg-gradient-to-r from-orange-400 to-orange-600",
                purple: "bg-gradient-to-r from-purple-400 to-purple-600",
                teal: "bg-gradient-to-r from-teal-400 to-teal-600",
              }[s.color];

              return (
                <div key={i} className={`${bgGradient} p-6 rounded-2xl shadow-lg transform transition hover:scale-105 text-white relative overflow-hidden`}>
                  <div className="flex items-center gap-2 text-xl">{s.icon} <span className="font-semibold">{s.label}</span></div>
                  <p className="text-3xl font-bold mt-2">{s.value}</p>
                  <span className="absolute bottom-2 right-4 w-3 h-3 rounded-full bg-white animate-ping-slow"></span>
                </div>
              );
            })}
          </section>

          {/* Upcoming Lists */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
            {/* Appointments */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg rounded-2xl p-6">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><FaCalendarAlt /> Upcoming Appointments</h3>
              <ul>
                {appointments.filter(a => new Date(a.date) >= today).slice(0,5).map((a,idx) => (
                  <li key={idx} className="py-2 border-b border-white/20 flex justify-between items-center">
                    <span>{getDoctorName(a)}</span>
                    <span className="text-sm">{new Date(a.date).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.status==="completed"?"bg-green-100 text-green-800":"bg-yellow-100 text-yellow-800"}`}>{a.status||"pending"}</span>
                  </li>
                ))}
                {!appointments.filter(a => new Date(a.date) >= today).length && <li className="text-sm text-white/70">No upcoming appointments</li>}
              </ul>
            </div>

            {/* Prescriptions */}
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg rounded-2xl p-6">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><FaPills /> Recent Prescriptions</h3>
              <ul>
                {prescriptions.slice(0,5).map((p,idx)=>(
                  <li key={idx} className="py-2 border-b border-white/20">
                    <p className="font-medium">{getDoctorName(p)}</p>
                    <p className="text-sm">Meds: {getMedications(p)}</p>
                  </li>
                ))}
                {!prescriptions.length && <li className="text-sm text-white/70">No recent prescriptions</li>}
              </ul>
            </div>

            {/* Reminders */}
            <div className="bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-lg rounded-2xl p-6">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><FaBell /> Upcoming Reminders</h3>
              <ul>
                {upcomingReminders.slice(0,5).map((r,idx)=>(
                  <li key={idx} className="py-2 border-b border-white/20 flex justify-between">
                    <span>{r.title || r.message || "Reminder"}</span>
                    <span className="text-sm">{new Date(r.remindOn).toLocaleDateString()}</span>
                  </li>
                ))}
                {!upcomingReminders.length && <li className="text-sm text-white/70">No upcoming reminders</li>}
              </ul>
            </div>
          </div>

          {/* Progress & Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:shadow-2xl transition">
              <ProgressRing percentage={completionRate} />
              <p className="mt-2 font-medium text-gray-700">Completion Rate</p>
            </div>

            {/* Redesigned Prescription Stats */}
            <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition">
              <h3 className="font-semibold text-xl mb-3 text-gray-800 flex items-center gap-2"><FaPills /> Prescription Stats</h3>
              <p className="text-gray-700 text-lg">Avg meds / script: {prescriptionStats.avgMeds}</p>
              <p className="text-gray-700 text-lg">Last 7 days: {prescriptionStats.last7Days}</p>
              <p className="text-gray-700 text-lg">Total prescriptions: {prescriptionStats.total}</p>
              <p className="text-gray-700 text-lg">Taken: {prescriptionStats.takenCount} / {prescriptionStats.total}</p>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition">
              <h3 className="font-semibold text-xl mb-3 text-gray-800">Appointments This Week</h3>
              <StackedBarChart data={weeklyAppointments} labels={["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]} />
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, type: null })}>
        {modal.type === "appointment" && <AppointmentForm onClose={() => setModal({ open: false, type: null })} />}
        {modal.type === "prescription" && <PrescriptionForm onClose={() => setModal({ open: false, type: null })} />}
        {modal.type === "reminder" && <ReminderForm onClose={() => setModal({ open: false, type: null })} />}
      </Modal>

      <style jsx>{`
        .animate-ping-slow {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default PatientDashboard;
