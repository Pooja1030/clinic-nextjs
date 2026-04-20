"use client";

import Link from "next/link";
import { FaUserMd, FaUser, FaCalendarCheck, FaBell, FaNotesMedical } from "react-icons/fa";
import { motion } from "framer-motion";

export default function HomePage() {
  const features = [
    { icon: <FaCalendarCheck className="text-blue-500 text-5xl" />, title: "Appointments", text: "Smart scheduling with real-time updates for doctors and patients." },
    { icon: <FaNotesMedical className="text-green-500 text-5xl" />, title: "Prescriptions", text: "Easily create, share, and track prescriptions digitally." },
    { icon: <FaBell className="text-yellow-500 text-5xl" />, title: "Reminders", text: "Automated alerts for checkups, medications, and follow-ups." },
  ];

  const testimonials = [
    { name: "Dr. Ananya Singh", role: "Cardiologist", text: "ClinicPro has streamlined my appointments and improved patient follow-ups significantly." },
    { name: "Rohit Sharma", role: "Patient", text: "I never miss my checkups thanks to the automated reminders. Highly recommended!" },
    { name: "Dr. Priya Verma", role: "General Physician", text: "Managing prescriptions and patient data has never been easier." },
  ];

  const stats = [
    { value: "1K+", label: "Doctors Onboarded" },
    { value: "5K+", label: "Appointments Scheduled" },
    { value: "99%", label: "Patient Satisfaction" },
  ];

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-sans flex flex-col items-center overflow-x-hidden">

      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-5 px-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 text-white flex items-center justify-center rounded-full font-bold shadow">C</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">ClinicPro</h1>
        </div>
        <nav className="flex gap-6 text-sm font-medium text-gray-700">
          <Link href="/login/doctor" className="hover:text-blue-600 transition">Doctor Login</Link>
          <Link href="/login/patient" className="hover:text-green-600 transition">Patient Login</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="mt-20 px-6 max-w-4xl text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }} 
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight"
        >
          Smarter Clinic Management for <span className="text-blue-600">Doctors</span> & <span className="text-green-600">Patients</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2, duration: 0.7 }} 
          className="text-lg text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto"
        >
          Manage appointments, prescriptions, and patient reminders in one simple platform. Designed to save time, reduce stress, and improve healthcare outcomes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4, duration: 0.7 }} 
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link href="/register/doctor">
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition">
              <FaUserMd /> Get Started as Doctor
            </button>
          </Link>
          <Link href="/register/patient">
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition">
              <FaUser /> Get Started as Patient
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="mt-24 w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: idx * 0.2, duration: 0.6 }} 
            className="bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <div className="mb-4">{feature.icon}</div>
            <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
            <p className="text-gray-600 text-sm">{feature.text}</p>
          </motion.div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="mt-24 w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: idx * 0.2, duration: 0.6 }} 
            className="bg-gradient-to-r from-blue-100 to-green-100 rounded-2xl p-8 shadow-md"
          >
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-600 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Testimonials Section */}
      <section className="mt-24 max-w-4xl px-6 text-center">
        <h3 className="text-3xl font-bold mb-10 text-gray-900">What People Say</h3>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {testimonials.map((testi, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: idx * 0.2, duration: 0.6 }} 
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 max-w-sm mx-auto relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded-full shadow">
                ❝
              </div>
              <p className="text-gray-700 italic mb-4 mt-6">{testi.text}</p>
              <p className="font-semibold text-gray-900">{testi.name}</p>
              <p className="text-sm text-gray-500">{testi.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About / Value Prop Section */}
      <section className="mt-24 max-w-4xl text-center px-6">
        <h3 className="text-3xl font-bold mb-4 text-gray-900">Why Choose ClinicPro?</h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          ClinicPro bridges the gap between doctors and patients. With an intuitive interface and powerful features, our platform helps doctors manage their practice efficiently while ensuring patients receive better, connected care.
        </p>
        <p className="text-gray-500 text-sm">🔒 HIPAA-compliant • Secure • Reliable</p>
      </section>

      {/* Footer */}
      <footer className="mt-24 text-gray-500 text-sm text-center border-t w-full pt-6 pb-4">
        &copy; {new Date().getFullYear()} <span className="font-semibold">ClinicPro</span>. All rights reserved.
      </footer>

    </main>
  );
}
