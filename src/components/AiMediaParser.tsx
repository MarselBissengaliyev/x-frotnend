import { useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaHashtag,
  FaLink,
  FaSourcetree,
  FaSpinner,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../axiosConfig";
import { validatePostLength } from "../utils/validatePostLength";
import FullAiGenerationBtn from "./FullAiGenerationBtn";
import PostPreview from "./PostPreview";
import PromptInputBlock from "./PromptInputBlock";
import TextInputBlock from "./TextInputBlock";
import ToggleInput from "./ToggleInput";

export default function AiMediaParser() {
  const { accountId } = useParams<{ accountId: string }>();

  const [imagesSource, setImagesSource] = useState("");
  const [promptText, setPromptText] = useState("");
  const [promptHashtags, setPromptHashtags] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [isPromoted, setIsPromoted] = useState(false);

  const [generatedText, setGeneratedText] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState("");

  const postValidation = validatePostLength({
    content: generatedText,
    hashtags: generatedHashtags,
  });

  const [loadingState, setLoadingState] = useState({
    text: false,
    hashtags: false,
  });

  const [loading, setLoading] = useState(false);

  const promptsMap = {
    text: promptText,
    hashtags: promptHashtags,
  };

  const setGeneratedMap = {
    text: setGeneratedText,
    hashtags: setGeneratedHashtags,
  };

  const cleanValue = (value: string) => (value.trim() === "" ? null : value);

  const buildPostData = () => ({
    accountId,
    promptText: cleanValue(promptText),
    imagesSource: cleanValue(imagesSource),
    promptHashtags: cleanValue(promptHashtags),
    targetUrl: cleanValue(targetUrl),
    cronExpression: cleanValue(cronExpression),
    promotedOnly: isPromoted,
  });

  const handleGenerateClick = async (type: "text" | "hashtags") => {
    const prompt = promptsMap[type];
    setLoadingState((prev) => ({ ...prev, [type]: true }));

    const data = { type, prompt };
    try {
      const res = await axiosInstance.post(
        "/content-generation/generate",
        data
      );
      toast.success(`${type} сгенерирован успешно!`);
      setGeneratedMap[type](res.data?.result || "");
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        const errorMessages = err.response.data.message;
        if (Array.isArray(errorMessages)) {
          errorMessages.forEach((msg: string) => toast.error(msg));
        } else {
          toast.error(errorMessages);
        }
      } else {
        toast.error("Ошибка при создании поста.");
      }
      toast.error(`Ошибка при генерации ${type}`);
    } finally {
      setLoadingState((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmitPost = async () => {
    setLoading(true);

    try {
      await axiosInstance.post("/schedule/schedule-post", buildPostData());
      toast.success(<span>Пост успешно создан и запланирован!</span>);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        const errorMessages = err.response.data.message;
        if (Array.isArray(errorMessages)) {
          errorMessages.forEach((msg: string) => toast.error(msg));
        } else {
          toast.error(errorMessages);
        }
      } else {
        toast.error("Ошибка при создании поста.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!accountId) {
    toast.error("Не найден accountId");
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-10 border-l-4 border-indigo-600">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          🔹 Метод 2: AI + Media Parser
        </h2>
        <p className="text-gray-500 text-sm">
          Создавайте и публикуйте посты с помощью AI и медиаисточников
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">
          🧩 Источники и промпты
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PromptInputBlock
            label="Prompt для текста"
            icon={<FaHashtag />}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onGenerate={() => handleGenerateClick("text")}
            generatedContent={generatedText}
            type="text"
            disabled={loadingState.text}
          />
          <PromptInputBlock
            label="Prompt для хештегов"
            icon={<FaHashtag />}
            value={promptHashtags}
            onChange={(e) => setPromptHashtags(e.target.value)}
            onGenerate={() => handleGenerateClick("hashtags")}
            generatedContent={generatedHashtags}
            type="hashtags"
            disabled={loadingState.hashtags}
          />
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* Настройки публикации */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">
          ⚙️ Настройки публикации
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInputBlock
            label="Источник изображений"
            icon={<FaSourcetree />}
            value={imagesSource}
            onChange={(e) => setImagesSource(e.target.value)}
            placeholder="Введите Google Drive источник изоображений"
          />
          <TextInputBlock
            label="Target URL"
            icon={<FaLink />}
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="Введите URL"
          />
          <ToggleInput
            label="Promoted only"
            icon={<FaCheckCircle />}
            checked={isPromoted}
            onChange={() => setIsPromoted(!isPromoted)}
          />

          <TextInputBlock
            label="Интервал автопубликации"
            icon={<FaClock />}
            value={cronExpression}
            onChange={(e) => setCronExpression(e.target.value)}
            placeholder="CRON выражение"
          />
        </div>
      </section>

      <div className="pt-4">
        <PostPreview
          text={generatedText}
          image={""}
          hashtags={generatedHashtags}
          targetUrl={targetUrl}
          isPromoted={isPromoted}
        />
        <FullAiGenerationBtn
          disabled={loading || !postValidation.isValid || !generatedText}
          onClick={handleSubmitPost}
        >
          {loading ? (
            <FaSpinner className="animate-spin mr-2 inline" />
          ) : (
            "📅 Запланировать автопостинг"
          )}
        </FullAiGenerationBtn>
      </div>
    </div>
  );
}
