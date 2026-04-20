"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import Link from "next/link";
import {
  FaTachometerAlt,
  FaUserFriends,
  FaCalendarAlt,
  FaFilePrescription,
  FaBell,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const doctorNavItems = [
    { name: "Dashboard", path: "/doctor/dashboard", icon: <FaTachometerAlt /> },
    { name: "Patients", path: "/doctor/patients", icon: <FaUserFriends /> },
    { name: "Appointments", path: "/doctor/appointments", icon: <FaCalendarAlt /> },
    { name: "Prescriptions", path: "/doctor/prescriptions", icon: <FaFilePrescription /> },
    { name: "Reminders", path: "/doctor/reminders", icon: <FaBell /> },
    { name: "Settings", path: "/doctor/settings", icon: <FaCog /> },
  ];

  const patientNavItems = [
    { name: "Dashboard", path: "/patient/home", icon: <FaTachometerAlt /> },
    { name: "Appointments", path: "/patient/appointments", icon: <FaCalendarAlt /> },
    { name: "Prescriptions", path: "/patient/prescriptions", icon: <FaFilePrescription /> },
    { name: "Reminders", path: "/patient/reminders", icon: <FaBell /> },
    { name: "Settings", path: "/patient/settings", icon: <FaCog /> },
  ];

  const navItems = user?.role === "doctor" ? doctorNavItems : patientNavItems;
  const accentColor = user?.role === "doctor" ? "blue" : "green";

  const handleLogout = () => {
    logout();
    const redirectPath = user?.role === "doctor" ? "/login/doctor" : "/login/patient";
    router.push(redirectPath);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg flex flex-col z-50 border-r border-gray-200">
      
      {/* User Info */}
      <div className="p-6 border-b border-gray-100 flex flex-col items-start gap-2">
        <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-${accentColor}-500 text-white font-bold text-lg shadow-md`}>
          {user?.name?.charAt(0) || "U"}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-gray-800 font-semibold truncate max-w-[160px]">{user?.name || "User"}</p>
          <p className={`text-${accentColor}-600 text-sm`}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `bg-${accentColor}-100 text-${accentColor}-700 font-semibold`
                  : `text-gray-700 hover:bg-${accentColor}-50 hover:text-${accentColor}-600`
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          <FaSignOutAlt className="text-base" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
