import { useEffect, useState } from "react";
import { FaClock, FaCog } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import AiMediaParser from "../components/AiMediaParser";
import FullAiGeneration from "../components/FullAiGeneration";

type AccountSettings = {
  method: 1 | 2;
};

// Пример заглушки — замени на реальный fetch аккаунта
const fetchAccountSettings = async (
  accountId: string
): Promise<AccountSettings> => {
  const res = await axiosInstance.get(`/accounts/${accountId}`);
  return res.data;
};

export default function ContentSettings() {
  const { accountId } = useParams();
  const [method, setMethod] = useState<1 | 2 | null>(null);

  useEffect(() => {
    if (accountId) {
      fetchAccountSettings(accountId)
        .then((data) => {
          setMethod(data.method); // Type-safe ✅
        })
        .catch((err) => {
          console.error("Ошибка при загрузке настроек аккаунта:", err);
          setMethod(null); // или показать сообщение об ошибке
        });
    }
  }, [accountId]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center">
        <FaCog className="mr-2 text-indigo-600" />
        Настройка контента для аккаунта{" "}
        <span className="font-semibold text-indigo-600 ml-1">{accountId}</span>
      </h1>

      {accountId && (
        <div className="mb-6">
          <Link
            to={`/scheduled-posts/${accountId}`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <FaClock className="mr-2" />
            Посмотреть автопостинг
          </Link>
        </div>
      )}

      <div className="transition-all duration-500 ease-in-out">
        {method === 1 && <FullAiGeneration />}
        {method === 2 && <AiMediaParser />}
        {method === null && <p>Загрузка настроек...</p>}
      </div>
    </div>
  );
}
