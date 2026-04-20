"use client";
import React, { useState } from "react";

const AppointmentForm = ({ onClose }) => {
  const [form, setForm] = useState({
    patientName: "",
    date: "",
    time: "",
    reason: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Appointment Data:", form);
    onClose();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-blue-700 mb-4">Add Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="patientName"
          placeholder="Patient Name"
          value={form.patientName}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="input"
          required
        />
        <textarea
          name="reason"
          placeholder="Reason"
          value={form.reason}
          onChange={handleChange}
          className="input"
        ></textarea>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 0.5rem;
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AppointmentForm;
