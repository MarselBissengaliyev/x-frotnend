import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import AccountsTable from "../components/AccountsTable";
import AddAcountModal from "../components/AddAcountModal";
import axiosInstance from "../axiosConfig";
import { toast } from "react-toastify";

export type Account = {
  id: string;
  login: string;
  totalPosts: number;
  postsToday: number;
  method: number;
};

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Функция для получения данных с сервера
    const fetchAccounts = async () => {
      try {
        const response = await axiosInstance.get(`/accounts`);
        setAccounts(response.data);  // Обновление состояния с полученными данными
      } catch (error) {
        console.error("Ошибка при получении аккаунтов:", error);
      }
    };

    fetchAccounts();  // Вызов функции для загрузки данных при монтировании компонента
  }, []);

  const handleAddAccount = () => {
    setIsModalOpen(true);
  };

   // Функция удаления аккаунта
   const handleDelete = async (accountId: string) => {
    try {
      await axiosInstance.delete(`/accounts/${accountId}`); // Здесь ты вызываешь API для удаления аккаунта
      setAccounts((prevAccounts) => prevAccounts.filter((acc) => acc.id !== accountId));
      toast.success("Аккаунт удален");
    } catch (error) {
      toast.error("Ошибка при удалении аккаунта");
      console.error("Ошибка при удалении аккаунта:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        📊 Dashboard
      </h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddAccount}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow hover:bg-blue-700 transition"
        >
          <FaPlus /> Добавить аккаунт
        </button>
      </div>

      <AccountsTable accounts={accounts} onDelete={handleDelete} />

      {/* Модалка */}
      {isModalOpen && <AddAcountModal setIsModalOpen={setIsModalOpen} setAccounts={setAccounts} />}
    </div>
  );
}
