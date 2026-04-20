"use client";

import React, { useEffect, useState } from "react";
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
  FaTrashAlt,
  FaSignOutAlt,
  FaMobileAlt,
} from "react-icons/fa";

const PatientSettings = () => {
  const { user, refreshUser } = useAuth(); // refreshUser optional if you have it
  const [activeTab, setActiveTab] = useState("profile");

  // profile form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [age, setAge] = useState(user?.age ?? "");
  const [gender, setGender] = useState(user?.gender || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

  // security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // notification preferences
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyPush, setNotifyPush] = useState(false);

  // loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [loadingDanger, setLoadingDanger] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // initialize from server profile (ensures fresh values)
    const fetchProfile = async () => {
      try {
        const data = await fetchWithAuth(`${API_BASE}/api/patients/profile`);
        if (data) {
          setName(data.name || "");
          setEmail(data.email || "");
          setAge(data.age ?? "");
          setGender(data.gender || "");
          setAvatarPreview(data.avatar || "");
          // if your profile stores notification preferences:
          if (data.preferences) {
            setNotifyEmail(!!data.preferences.email);
            setNotifySMS(!!data.preferences.sms);
            setNotifyPush(!!data.preferences.push);
          }
        }
      } catch (err) {
        // do not block UI; show toast
        toast.error("Could not load profile — some values may be stale.");
      }
    };
    fetchProfile();
    // only once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Avatar selection preview
  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // PROFILE SAVE
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      // FormData for avatar upload
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("age", age === "" ? "" : Number(age));
      fd.append("gender", gender);
      if (avatarFile) fd.append("avatar", avatarFile);

      // fetchWithAuth(url, method, body, isMultipart)
      const updated = await fetchWithAuth(`${API_BASE}/api/patients/profile`, "PUT", fd, true);
      toast.success("Profile updated");
      // optional: refresh auth context user data
      if (typeof refreshUser === "function") refreshUser();
    } catch (err) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // PASSWORD CHANGE
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Provide current and new password");
      return;
    }
    setLoadingPassword(true);
    try {
      await fetchWithAuth(`${API_BASE}/api/users/change-password`, "PUT", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setLoadingPassword(false);
    }
  };

  // NOTIFICATION PREFERENCES
  const handleSavePreferences = async () => {
    setLoadingPrefs(true);
    try {
      const payload = {
        preferences: {
          email: !!notifyEmail,
          sms: !!notifySMS,
          push: !!notifyPush,
        },
      };
      await fetchWithAuth(`${API_BASE}/api/patients/preferences`, "PUT", payload);
      toast.success("Preferences saved");
    } catch (err) {
      toast.error(err?.message || "Failed to save preferences");
    } finally {
      setLoadingPrefs(false);
    }
  };

  // DELETE ACCOUNT (danger)
  const handleDeleteAccount = async () => {
    if (!confirm("This will permanently delete your account and data. Are you sure?")) return;
    setLoadingDanger(true);
    try {
      await fetchWithAuth(`${API_BASE}/api/patients/profile`, "DELETE");
      toast.success("Account deleted");
      // (Optional) redirect to homepage or logout
      window.location.href = "/";
    } catch (err) {
      toast.error(err?.message || "Failed to delete account");
    } finally {
      setLoadingDanger(false);
    }
  };

  // LOGOUT ALL DEVICES
  const handleLogoutAll = async () => {
    if (!confirm("Log out of all devices?")) return;
    setLoadingDanger(true);
    try {
      await fetchWithAuth(`${API_BASE}/api/users/logout-all`, "POST");
      toast.success("Logged out of all sessions");
      // redirect to login
      window.location.href = "/login";
    } catch (err) {
      toast.error(err?.message || "Failed to logout from other sessions");
    } finally {
      setLoadingDanger(false);
    }
  };

  // small helper: join date display if available on user
  const joinedText = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-8">
          {[
            { key: "profile", label: "Profile", icon: <FaUser /> },
            { key: "security", label: "Security", icon: <FaLock /> },
            { key: "notifications", label: "Notifications", icon: <FaBell /> },
            { key: "billing", label: "Billing", icon: <FaCreditCard /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 pb-3 px-1 font-medium transition ${
                activeTab === t.key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-8">
          {/* PROFILE VIEW + EDIT */}
          {activeTab === "profile" && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <FaUser className="text-blue-500" /> Profile Overview
                </h2>
                <div className="grid sm:grid-cols-3 gap-6 text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                      {user?.name?.charAt(0) || "P"}
                    </div>
                    <span>{user?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span>{user?.email || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>Joined: {joinedText}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
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
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="block text-sm font-medium text-gray-600">Avatar</label>
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-14 h-14 rounded-full object-cover border" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">{name?.charAt(0) || "P"}</div>
                    )}
                    <label className="cursor-pointer bg-gray-50 px-3 py-2 border rounded text-sm hover:bg-gray-100">
                      Change
                      <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                    </label>
                    {avatarPreview && (
                      <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(""); }} className="text-sm text-red-500 hover:underline">
                        Remove
                      </button>
                    )}
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

          {/* SECURITY */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordChange} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <FaLock /> Change Password
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Tip: Use a strong password with letters, numbers & symbols.</div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleLogoutAll}
                    disabled={loadingDanger}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <FaSignOutAlt /> Logout all
                  </button>
                  <button
                    type="submit"
                    disabled={loadingPassword}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:from-red-600 hover:to-red-700 transition disabled:opacity-50"
                  >
                    {loadingPassword && <FaSpinner className="animate-spin" />}
                    {loadingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FaBell className="text-blue-500" /> Notifications & Preferences
              </h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between gap-6 p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Email notifications</div>
                    <div className="text-sm text-gray-500">Receive appointment & prescription updates by email</div>
                  </div>
                  <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                </label>

                <label className="flex items-center justify-between gap-6 p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">SMS reminders</div>
                    <div className="text-sm text-gray-500">Receive SMS reminders for appointments</div>
                  </div>
                  <input type="checkbox" checked={notifySMS} onChange={(e) => setNotifySMS(e.target.checked)} />
                </label>

                <label className="flex items-center justify-between gap-6 p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Push notifications</div>
                    <div className="text-sm text-gray-500">Enable in-browser push notifications (if supported)</div>
                  </div>
                  <input type="checkbox" checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />
                </label>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => { /* reset to last saved preferences - reload from server */ window.location.reload(); }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={loadingPrefs}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700"
                  >
                    {loadingPrefs ? <FaSpinner className="animate-spin" /> : "Save Preferences"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BILLING */}
          {activeTab === "billing" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FaCreditCard className="text-blue-500" /> Billing
              </h3>
              <p className="text-gray-600 text-sm">Billing details and payment history will appear here. (Integrate your payment provider.)</p>
            </div>
          )}

          {/* Danger area (always visible at bottom) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-red-600 mb-3">Danger Zone</h4>
            <p className="text-sm text-gray-600 mb-4">Account deletion and logout-all are irreversible — use with caution.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loadingDanger}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:opacity-50"
              >
                {loadingDanger ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />}
                Delete account
              </button>
              <button
                onClick={handleLogoutAll}
                disabled={loadingDanger}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <FaSignOutAlt /> Logout all devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientSettings;
