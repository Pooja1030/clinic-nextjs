"use client";

import { useEffect, useState } from "react";
import DoctorLayout from "@/app/doctor/layout";
import { fetchWithAuth } from "@/utils/api";

// Utility to group logs
const groupLogsByDate = (logs) => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const groups = { Today: [], Yesterday: [], Older: [] };

  logs.forEach((log) => {
    const dateStr = new Date(log.createdAt).toDateString();
    if (dateStr === today) groups.Today.push(log);
    else if (dateStr === yesterday) groups.Yesterday.push(log);
    else groups.Older.push(log);
  });

  return groups;
};

export default function CampaignsPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [patients, setPatients] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatientsAndLogs = async () => {
      setLoading(true);
      try {
        const [patData, logData] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/patients`),
          fetchWithAuth(`${API_BASE}/api/campaigns/logs`),
        ]);
        setPatients(patData);
        setLogs(logData.reverse());
        setFilteredLogs(logData.reverse());
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadPatientsAndLogs();
  }, []);

  useEffect(() => {
    if (status) {
      const timeout = setTimeout(() => setStatus(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    if (!selectedPatient || !message.trim()) {
      setError("Please select a patient and enter a message.");
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_BASE}/api/campaigns/send`, "POST", {
        patientId: selectedPatient,
        message,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message");

      setStatus("✅ Message sent successfully!");
      setMessage("");
      setSelectedPatient("");

      const logData = await fetchWithAuth(`${API_BASE}/api/campaigns/logs`);
      setLogs(logData.reverse());
      setFilteredLogs(logData.reverse());
    } catch (err) {
      setError(err.message || "Sending failed.");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (!term) return setFilteredLogs(logs);

    const filtered = logs.filter((log) => {
      const patient = log.patient?.name?.toLowerCase() || "";
      const msg = log.message?.toLowerCase() || "";
      const status = log.status?.toLowerCase() || "";
      return (
        patient.includes(term) || msg.includes(term) || status.includes(term)
      );
    });
    setFilteredLogs(filtered);
  };

  const groupedLogs = groupLogsByDate(filteredLogs);

  return (
    <DoctorLayout>
      <h1 className="text-2xl font-bold text-blue-600 mb-4">WhatsApp Campaigns</h1>

      {/* Responsive 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/*  Form */}
        <form onSubmit={handleSend} className="bg-white p-4 rounded shadow space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          {status && <p className="text-green-600">{status}</p>}

          <div>
            <label className="block font-medium mb-1">Select Patient:</label>
            <select
              className="w-full border p-2 rounded"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.contact})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Message:</label>
            <textarea
              className="w-full border p-2 rounded"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              maxLength={500}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Send Message
          </button>
        </form>

        {/*  Logs */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Message Logs</h2>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={handleSearch}
              className="border px-3 py-1 rounded text-sm"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Loading logs...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-gray-500">No messages found.</p>
          ) : (
            Object.entries(groupedLogs).map(([group, logs]) =>
              logs.length > 0 ? (
                <div key={group} className="mb-4">
                  <h3 className="text-sm font-bold text-blue-500 mb-2">{group}</h3>
                  <ul className="space-y-2">
                    {logs.map((log) => (
                      <li
                        key={log._id}
                        className="border-b pb-2 text-sm text-gray-700"
                      >
                        <p>
                          <strong>To:</strong> {log.patient?.name} ({log.patient?.contact})
                        </p>
                        <p>
                          <strong>Message:</strong> {log.message}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span
                            className={`font-semibold ${
                              log.status === "SENT"
                                ? "text-green-600"
                                : log.status === "FAILED"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {log.status}
                          </span>
                        </p>
                        <p className="text-gray-500">
                          <strong>Sent On:</strong>{" "}
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
