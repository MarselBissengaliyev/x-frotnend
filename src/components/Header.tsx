import { FaRobot } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Логотип */}
      <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
        <FaRobot className="text-2xl" />
        <span>AI Composer</span>
      </Link>

    </header>
  );
};

export default Header;
