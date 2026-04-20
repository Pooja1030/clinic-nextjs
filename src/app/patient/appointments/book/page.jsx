"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import PatientLayout from "@/app/patient/layout";
import { fetchWithAuth } from "@/utils/api";
import toast, { Toaster } from "react-hot-toast";
import { CalendarDays, Clock, FileText, CheckCircle2, Stethoscope } from "lucide-react";

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState(1);

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/users?role=doctor`);
        setDoctors(res || []);
      } catch {
        toast.error("Unable to load doctors");
      }
    };
    loadDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`${API_BASE}/api/appointments`, "POST", { doctorId, date, time, reason });
      setStep(3);
    } catch {
      toast.error("Booking failed");
    }
  };

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  return (
    <PatientLayout>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto py-10 px-6">
        {/* Step Indicators */}
        <div className="flex justify-center mb-10 gap-6 text-sm font-medium">
          {["Doctor", "Details", "Confirm"].map((label, i) => (
            <div
              key={i}
              className={`px-4 py-2 rounded-full ${
                step === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-blue-600" /> Select a Doctor
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {doctors.map((doc) => (
                <motion.div
                  key={doc._id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setDoctorId(doc._id);
                    setStep(2);
                  }}
                  className="cursor-pointer bg-white rounded-2xl p-5 shadow-md hover:shadow-lg"
                >
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.specialization || "General"}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Step 2: Appointment Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Appointment Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <CalendarDays className="w-4 h-4" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 w-full border rounded-xl px-4 py-3 shadow-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4" /> Time
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {timeSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={`px-4 py-2 rounded-lg border ${
                        time === slot ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" /> Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. Consultation for headache..."
                className="mt-1 w-full border rounded-xl px-4 py-3 shadow-sm"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold"
            >
              Confirm Appointment
            </motion.button>
          </form>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Appointment Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your appointment with{" "}
              {doctors.find((d) => d._id === doctorId)?.name || "Doctor"} is booked.
            </p>
            <button
              onClick={() => router.push("/patient/appointments")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Go to My Appointments
            </button>
          </motion.div>
        )}
      </div>
    </PatientLayout>
  );
};

export default BookAppointment;
