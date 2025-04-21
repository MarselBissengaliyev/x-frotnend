type Props = {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export default function FullAiGenerationBtn({
  disabled,
  onClick,
  children,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`mt-4 px-5 py-3 rounded-xl w-full text-white font-semibold text-sm transition-all duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
          ${
            disabled
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 active:scale-[0.98]"
          }`}
    >
      {children}
    </button>
  );
}
