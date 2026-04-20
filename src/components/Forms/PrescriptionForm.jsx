"use client";
import React, { useState } from "react";

const PrescriptionForm = ({ onClose }) => {
  const [form, setForm] = useState({
    patientName: "",
    medicine: "",
    dosage: "",
    instructions: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace this with API call to save prescription
    console.log("Prescription Submitted:", form);
    onClose();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-blue-700 mb-4">Add Prescription</h2>
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
          type="text"
          name="medicine"
          placeholder="Medicine Name"
          value={form.medicine}
          onChange={handleChange}
          className="input"
          required
        />
        <input
          type="text"
          name="dosage"
          placeholder="Dosage"
          value={form.dosage}
          onChange={handleChange}
          className="input"
        />
        <textarea
          name="instructions"
          placeholder="Instructions"
          value={form.instructions}
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

export default PrescriptionForm;
