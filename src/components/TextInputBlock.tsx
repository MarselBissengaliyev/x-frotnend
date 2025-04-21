import React from "react";

type TextInputBlockProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

const TextInputBlock: React.FC<TextInputBlockProps> = ({
  label,
  icon,
  value,
  onChange,
  placeholder = "",
}) => {
  return (
    <div className="flex flex-col space-y-3 p-4 bg-white rounded-2xl shadow-sm transition-all">
      {/* Label */}
      <label className="flex items-center space-x-2 text-gray-800 text-sm font-medium">
        <div className="text-indigo-600 text-base">{icon}</div>
        <span>{label}</span>
      </label>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400"
        placeholder={placeholder}
        aria-label={placeholder || label}
      />
    </div>
  );
};

export default TextInputBlock;
