export const parsePrescriptionText = (text) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const result = {
    diagnosis: "",
    medications: [],
    notes: "",
  };

  lines.forEach((line) => {
    const lower = line.toLowerCase();

    // Detect diagnosis line
    if (!result.diagnosis && (lower.startsWith("diagnosis") || lower.includes("diagnosis:"))) {
      result.diagnosis = line.split(":")[1]?.trim() || line.replace(/diagnosis[:]?/i, "").trim();
      return;
    }

    // Detect medication lines (heuristic: contains mg/ml/tablet/capsule)
    if (/(mg|ml|tablet|capsule)/i.test(line)) {
      // Try to split name, dosage, duration
      const medRegex = /(.+?)\s+([\d.]+\s*(mg|ml|g|units|tablet|capsule|puff)?)\s*(.*)/i;
      const match = line.match(medRegex);

      if (match) {
        const name = match[1].trim();
        const dosage = match[2]?.trim() || "";
        const duration = match[4]?.trim() || "";
        result.medications.push({ name, dosage, duration });
      } else {
        // fallback if regex fails
        result.medications.push({ name: line, dosage: "", duration: "" });
      }
      return;
    }

    // Otherwise, append line to notes
    result.notes += (result.notes ? " " : "") + line;
  });

  return result;
};
