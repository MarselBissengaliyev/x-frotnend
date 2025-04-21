import React from "react";

type ToggleInputProps = {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: () => void;
};

const ToggleInput: React.FC<ToggleInputProps> = ({
  label,
  icon,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm transition-all">
      {/* Label + Icon */}
      <div className="flex items-center space-x-3">
        <div className="text-indigo-600 text-xl">{icon}</div>
        <span className="text-gray-800 font-medium">{label}</span>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
          checked ? "bg-indigo-600" : "bg-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
        aria-pressed={checked}
        role="switch"
      >
        <span
          className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-300 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleInput;
