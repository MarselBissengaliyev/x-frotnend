import React, { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import axiosInstance from "../axiosConfig";

interface ScheduledPost {
  id: string;
  scheduledAt: string;
  status: string;
  post: {
    content: string;
    hashtags: string;
    imageUrl: string;
    targetUrl: string;
    promoted: boolean;
  };
}

interface Props {
  accountId: string;
}

const ScheduledPosts: React.FC<Props> = ({ accountId }) => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/schedule/scheduled-posts/${accountId}`
      );
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить задачи");
    } finally {
      setLoading(false);
    }
  };

  const deleteScheduledPost = async (id: string) => {
    try {
      await axiosInstance.delete(`/schedule/scheduled-post/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении задачи");
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, [accountId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Запланированные посты</h1>
      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Дата</th>
                <th className="p-3">Статус</th>
                <th className="p-3">Контент</th>
                <th className="p-3">Хештеги</th>
                <th className="p-3">Цель</th>
                <th className="p-3">Promoted</th>
                <th className="p-3">Действия</th>
              </tr>
            </thead>
            <tbody>
  {posts.length === 0 ? (
    <tr>
      <td colSpan={8} className="p-4 text-center text-gray-500">
        Нет задач
      </td>
    </tr>
  ) : (
    posts.map((post) => (
      <tr key={post.id} className="border-t border-gray-200">
        {post.post ? (
          <>
            <td className="p-3 text-sm text-gray-700">{post.id}</td>
            <td className="p-3 text-sm text-gray-700">
              {new Date(post.scheduledAt).toLocaleString()}
            </td>
            <td className="p-3 text-sm">
              <span
                className={`px-2 py-1 rounded text-white text-xs ${
                  post.status === "pending"
                    ? "bg-yellow-500"
                    : post.status === "done"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {post.status}
              </span>
            </td>
            <td className="p-3 text-sm text-gray-700 line-clamp-2 max-w-xs">
              {post.post.content}
            </td>
            <td className="p-3 text-sm text-gray-500">{post.post.hashtags}</td>
            <td className="p-3 text-sm text-blue-600 underline">
              <a href={post.post.targetUrl} target="_blank" rel="noreferrer">
                Перейти
              </a>
            </td>
            <td className="p-3 text-sm text-center">
              {post.post.promoted ? "✅" : "—"}
            </td>
            <td className="p-3 text-sm">
              <button
                onClick={() => deleteScheduledPost(post.id)}
                className="text-red-600 hover:text-red-800 transition"
                title="Удалить задачу"
              >
                <FaTrashAlt />
              </button>
            </td>
          </>
        ) : (
          <td colSpan={8} className="p-4 text-center text-gray-500">
            Вы ещё не создали запланированный пост или он ещё не опубликован
          </td>
        )}
      </tr>
    ))
  )}
</tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduledPosts;
