import React from "react";
import { FaSpinner } from "react-icons/fa";

type PromptInputBlockProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange:  (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  disabled: boolean;
  generatedContent?: string;
  type: "text" | "image" | "hashtags";
  placeholder?: string;
  btnText?: string;
};

const PromptInputBlock: React.FC<PromptInputBlockProps> = ({
  label,
  icon,
  value,
  onChange,
  onGenerate,
  disabled,
  generatedContent,
  type,
  placeholder,
  btnText="Сгенерировать"
}) => {
  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-2xl shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="text-indigo-600 text-xl">{icon}</div>
        <span className="font-semibold text-gray-800 text-lg">{label}</span>
      </div>

      {/* Input */}
      <textarea
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none"
        placeholder={!placeholder ? `Введите prompt для ${type}` : placeholder}
        aria-label={`Введите prompt для ${type}`}
      />

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={disabled}
        className={`mt-2 px-4 py-3 rounded-xl text-white font-medium transition-all duration-300 ease-in-out w-full flex items-center justify-center ${
          disabled
            ? "bg-indigo-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {disabled ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Генерация...
          </>
        ) : btnText}
      </button>

      {/* Generated Result */}
      <div className="mt-4 transition-all duration-500">
        {generatedContent || value ? (
          type === "image" ? (
            <img
              src={generatedContent || value}
              alt="Generated"
              className="rounded-lg shadow-md max-h-64 object-contain w-full"
            />
          ) : (
            <div className="p-4 bg-gray-100 rounded-xl text-sm text-gray-800 whitespace-pre-wrap border border-gray-200">
              {generatedContent}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default PromptInputBlock;
