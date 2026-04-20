"use client";
import { FiSearch } from "react-icons/fi";

const SearchInput = ({ placeholder, value, onChange, className = "" }) => {
  return (
    <div className={`relative w-full md:w-1/3 ${className}`}>
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <FiSearch />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-3 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default SearchInput;
