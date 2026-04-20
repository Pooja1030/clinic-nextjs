"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/useAuth";
import { useState } from "react";
import { FaBars } from "react-icons/fa";

export default function PatientLayout({ children }) {
  const { loading, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <div className="p-6">Loading...</div>;
  if (user?.role !== "patient") return <div className="p-6 text-red-600">Access denied: patient only</div>;

  return (
    <main className="flex min-h-screen bg-gray-50 relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 fixed h-full">
       <div className="p-6 text-blue-600 font-bold text-xl border-b border-gray-100">ClinicPro</div>
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="w-64 h-full bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
           <div className="p-6 text-blue-600 font-bold text-xl border-b border-gray-100">ClinicPro</div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 w-full p-4 sm:p-6">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="block lg:hidden mb-4 text-blue-600 text-xl"
        >
          <FaBars />
        </button>
        {children}
      </div>
    </main>
  );
}
