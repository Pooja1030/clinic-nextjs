"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/useAuth";
import toast, { Toaster } from "react-hot-toast";
import { fetchWithAuth } from "@/utils/api";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCalendarAlt,
  FaSpinner,
  FaBell,
  FaCreditCard,
} from "react-icons/fa";

const DoctorSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await fetchWithAuth(`${API_BASE}/api/users/profile`, "PUT", { name, email });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);
    try {
      await fetchWithAuth(`${API_BASE}/api/users/change-password`, "PUT", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Settings Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-8">
          {[
            { key: "profile", label: "Profile", icon: <FaUser /> },
            { key: "security", label: "Security", icon: <FaLock /> },
            { key: "notifications", label: "Notifications", icon: <FaBell /> },
            { key: "billing", label: "Billing", icon: <FaCreditCard /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-1 font-medium transition ${
                activeTab === tab.key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <>
              {/* Profile Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <FaUser className="text-blue-500" /> Profile Overview
                </h2>
                <div className="grid sm:grid-cols-3 gap-6 text-gray-700">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-blue-500" />
                    <span>{user?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span>{user?.email || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                   <span>
  Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
</span>

                  </div>
                </div>
              </div>

              {/* Profile Update */}
              <form
                onSubmit={handleProfileUpdate}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6"
              >
                <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                  <FaUser /> Update Profile
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50"
                  >
                    {loadingProfile && <FaSpinner className="animate-spin" />}
                    {loadingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form
              onSubmit={handlePasswordChange}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6"
            >
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <FaLock /> Change Password
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:from-red-600 hover:to-red-700 transition disabled:opacity-50"
                >
                  {loadingPassword && <FaSpinner className="animate-spin" />}
                  {loadingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FaBell className="text-blue-500" /> Notifications
              </h3>
              <p className="text-gray-600 text-sm">
                (You can add toggle switches here for email / SMS / push notifications.)
              </p>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FaCreditCard className="text-blue-500" /> Billing
              </h3>
              <p className="text-gray-600 text-sm">
                (Integrate your billing details or payment history here.)
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DoctorSettings;
