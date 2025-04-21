import clsx from "clsx";
import { useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FiSave, FiSend, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../axiosConfig";
import { Account } from "../pages/Dashboard";

type Props = {
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AddAccountModal({
  setAccounts,
  setIsModalOpen,
}: Props) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [proxy, setProxy] = useState("");
  const [method, setMethod] = useState("Полная генерация");
  const [errors, setErrors] = useState<{ login?: string; password?: string }>({});
  const [is2FA, setIs2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChallenge, setIsChallenge] = useState(false);
  const [challengeInput, setChallengeInput] = useState("");
  const [loading, setLoading] = useState(false); // Добавлено состояние для загрузки

  const loginRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const resetFormAndNavigate = (id: string) => {
    setLogin("");
    setPassword("");
    setProxy("");
    setMethod("Полная генерация");
    setTwoFACode("");
    setIs2FA(false);
    setIsChallenge(false);
    setSessionId(null);
    setIsModalOpen(false);
    setErrors({});
    navigate(`/content-settings/${id}`);
  };

  const handleSave = async () => {
    const newErrors: typeof errors = {};
    if (!login.trim()) newErrors.login = "Логин обязателен";
    if (!password.trim()) newErrors.password = "Пароль обязателен";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true); // Начинаем загрузку

    try {
      const response = await axiosInstance.post("/accounts", {
        login,
        password,
        proxy: proxy.length > 0 ? proxy : undefined,
        method: method === "Полная генерация" ? 1 : 2,
        userAgent: "default",
      });

      if (response.data.challengeRequired) {
        toast.info("Требуется подтвердить действие");
        setSessionId(response.data.sessionId);
        setIsChallenge(true);
        return;
      }

      if (response.data.twoFactorRequired) {
        toast.info("Требуется 2FA код");
        setSessionId(response.data.sessionId);
        setIs2FA(true);
        return;
      }

      if (!response.data.id) {
        toast.error("Не валидные данные.");
      }

      const newAccount: Account = {
        id: new Date(Date.now()).toString(),
        login,
        totalPosts: 0,
        postsToday: 0,
        method: method === "Полная генерация" ? 1 : 2,
      };

      setAccounts((prev) => [...prev, newAccount]);
      resetFormAndNavigate(response.data.id);
    } catch {
      toast.error("Ошибка при добавлении аккаунта");
    } finally {
      setLoading(false); // Завершаем загрузку
    }
  };

  const handle2FASubmit = async () => {
    if (!twoFACode.trim()) {
      toast.error("Пожалуйста, введите 2FA код.");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/accounts/submit-code", {
        sessionId,
        code: twoFACode,
        login,
      });

      if (res.data.success) {
        const newAccount: Account = {
          id: new Date(Date.now()).toString(),
          login,
          totalPosts: 0,
          postsToday: 0,
          method: method === "Полная генерация" ? 1 : 2,
        };

        toast.success("Аккаунт добавлен после 2FA!");
        setAccounts((prev) => [...prev, newAccount]);
        resetFormAndNavigate(newAccount.login);
      }
    } catch {
      toast.error("Ошибка при подтверждении 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeSubmit = async () => {
    if (!challengeInput.trim()) {
      toast.error("Пожалуйста, введите подтверждение.");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/accounts/submit-challenge", {
        sessionId,
        challengeInput,
        password,
      });

      if (res.data.success) {
        const newAccount: Account = {
          id: new Date(Date.now()).toString(),
          login,
          totalPosts: 0,
          postsToday: 0,
          method: method === "Полная генерация" ? 1 : 2,
        };

        toast.success("Аккаунт добавлен после подтверждения!");
        setAccounts((prev) => [...prev, newAccount]);
        resetFormAndNavigate(newAccount.id);
      }
    } catch {
      toast.error("Ошибка при подтверждении действия");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsModalOpen(false);
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Закрыть модальное окно"
        >
          <AiOutlineClose size={22} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Добавить аккаунт
        </h2>

        <div className="space-y-5">
          <div>
            <input
              ref={loginRef}
              type="text"
              placeholder="Логин"
              value={login}
              onChange={(e) => {
                setLogin(e.target.value);
                setErrors((prev) => ({ ...prev, login: undefined }));
              }}
              className={clsx(
                "w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none",
                errors.login
                  ? "border-red-500 focus:border-red-500"
                  : "focus:ring focus:border-blue-400"
              )}
              disabled={loading} // Отключаем инпут во время отправки
            />
            {errors.login && (
              <p className="text-red-500 text-sm mt-1">{errors.login}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className={clsx(
                "w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none",
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "focus:ring focus:border-blue-400"
              )}
              disabled={loading} // Отключаем инпут во время отправки
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Прокси (IP:PORT:LOGIN:PASSWORD)"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring focus:border-blue-300"
              disabled={loading} // Отключаем инпут во время отправки
            />
            <p className="text-xs text-gray-400 mt-1">
              💡 Необязательно. Используется для анонимности.
            </p>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Метод генерации
              <span
                className="ml-1 text-gray-400 cursor-help"
                title="Выберите метод генерации"
              >
                ⓘ
              </span>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring focus:border-blue-300"
              disabled={loading} // Отключаем инпут во время отправки
            >
              <option value="Полная генерация">Полная генерация</option>
              <option value="Генерация текста + парсинг">
                Генерация текста + парсинг
              </option>
            </select>
          </div>

          <p className="text-sm text-gray-500 flex items-center gap-1">
            <FiShield className="text-blue-400" /> User-Agent:{" "}
            <span className="italic">по умолчанию</span>
          </p>

          <button
            onClick={handleSave}
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-medium transition-all",
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
            disabled={loading} // Отключаем кнопку во время отправки
          >
            {loading ? (
              <span>Загрузка...</span> // Спиннер или текст "Загрузка..."
            ) : (
              <>
                <FiSave />
                Сохранить и перейти
              </>
            )}
          </button>

          {is2FA && (
            <div className="border-t pt-4 mt-4">
              <input
                type="text"
                placeholder="Введите 2FA код"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring focus:border-green-400"
                disabled={loading}
              />
              <button
                onClick={handle2FASubmit}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl mt-3 transition-all",
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
                )}
                disabled={loading}
              >
                {loading ? <span>Загрузка...</span> : <><FiSend /> Подтвердить 2FA</>}
              </button>
            </div>
          )}

          {isChallenge && (
            <div className="border-t pt-4 mt-4">
              <input
                type="text"
                placeholder={`Введите email или номер телефона вашего аккаунта, аккаунт заподозрен в частой активности.`}
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring focus:border-yellow-400"
                disabled={loading}
              />
              <button
                onClick={handleChallengeSubmit}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl mt-3 transition-all",
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 text-white hover:bg-yellow-700"
                )}
                disabled={loading}
              >
                {loading ? <span>Загрузка...</span> : <><FiSend /> Подтвердить подтверждение</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
