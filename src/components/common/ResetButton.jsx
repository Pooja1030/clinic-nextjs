"use client";

const ResetButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition duration-200"
    >
      Reset
    </button>
  );
};

export default ResetButton;
