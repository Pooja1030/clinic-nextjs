"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  const isDoctor = user?.role === "doctor";
  const isPatient = user?.role === "patient";

  return (
    <nav className="w-full h-16 flex justify-between items-center px-6 bg-white shadow">
      <Link to="/" className="text-xl font-bold text-blue-600">
        ClinicPro
      </Link>

      <div className="space-x-4">
        {!user && (
          <>
            {pathname !== "/login/doctor" && (
              <Link
                to="/login/doctor"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Doctor Login
              </Link>
            )}
            {pathname !== "/login/patient" && (
              <Link
                to="/login/patient"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Patient Login
              </Link>
            )}
          </>
        )}

        {isPatient && (
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
