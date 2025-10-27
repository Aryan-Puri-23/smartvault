import React, { useState, useRef, useEffect } from "react";

export default function Dropdown({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div
      ref={ref}
      className="relative w-3/4 sm:w-auto cursor-pointer"
    >
      <button
        type="button"
        className="w-full sm:w-auto rounded-md border px-2 py-1 text-sm cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
        <span className="ml-2 text-xl">&#9662;</span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full sm:w-auto bg-white border rounded-md mt-1 shadow-lg max-h-48 overflow-auto text-xs">
          {options.map((option, index) => (
            <li
              key={index}
              className={`px-2 py-1 hover:bg-gray-100 ${
                option === value ? "bg-gray-100 font-medium" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
