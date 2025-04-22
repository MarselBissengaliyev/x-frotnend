import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { Account } from "../pages/Dashboard";
import { FaCog, FaTrashAlt } from "react-icons/fa";
import { useState } from "react";

type Props = {
  accounts: Account[];
  onDelete: (accountId: string) => Promise<void>; // Убедитесь, что onDelete возвращает Promise
};

export default function AccountsTable({ accounts, onDelete }: Props) {
  const navigate = useNavigate();
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const handleDelete = async (accountId: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот аккаунт?")) return; // Подтверждение удаления
    setDeletingAccountId(accountId);
    try {
      await onDelete(accountId);
    } catch (error) {
      console.error("Failed to delete account", error);
    } finally {
      setDeletingAccountId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
      <table className="min-w-full bg-white rounded-xl text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-700 uppercase tracking-wider text-xs">
            <th className="py-4 px-5 text-left">Логин</th>
            <th className="py-4 px-5 text-left">Все посты</th>
            <th className="py-4 px-5 text-left">Посты сегодня</th>
            <th className="py-4 px-5 text-left">Метод генерации</th>
            <th className="py-4 px-5 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc, idx) => (
            <tr
              key={idx}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="py-4 px-5 font-medium text-gray-800">{acc.login}</td>
              <td className="py-4 px-5 text-gray-600">{acc.totalPosts}</td>
              <td
                className={clsx(
                  "py-4 px-5 font-medium",
                  acc.postsToday > 0 ? "text-green-600" : "text-gray-400"
                )}
              >
                {acc.postsToday}
              </td>
              <td className="py-4 px-5">
                <span
                  className={clsx(
                    "px-3 py-1 rounded-full text-xs font-semibold inline-block",
                    acc.method === 1
                      ? "bg-blue-100 text-blue-800"
                      : "bg-violet-100 text-violet-800"
                  )}
                >
                  {acc.method === 1 ? "Полная генерация" : "Текст + парсинг"}
                </span>
              </td>
              <td className="py-4 px-5">
                <button
                  onClick={() => navigate(`/content-settings/${acc.id}`)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-150"
                >
                  <FaCog className="text-sm" />
                  Настроить
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  disabled={deletingAccountId === acc.id}
                  className="flex items-center gap-2 ml-4 text-red-600 hover:text-red-800 hover:underline transition-colors duration-150"
                >
                  <FaTrashAlt className="text-sm" />
                  {deletingAccountId === acc.id ? "Удаление..." : "Удалить"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
