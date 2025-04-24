import { useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaHashtag,
  FaImage,
  FaInfoCircle,
  FaLink,
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

  const [imageSource, setImageSource] = useState("");
  const [promptText, setPromptText] = useState("");
  const [promptHashtags, setPromptHashtags] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [isPromoted, setIsPromoted] = useState(false);
  const [isAutoPost, setIsAutoPost] = useState(false);

  const [generatedText, setGeneratedText] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState("");
  const [generatedImage, setGeneratedImage] = useState(imageSource);

  const postValidation = validatePostLength({
    content: generatedText,
    hashtags: generatedHashtags,
  });

  const [loadingState, setLoadingState] = useState({
    text: false,
    hashtags: false,
    image: false
  });

  const [loading, setLoading] = useState(false);

  const promptsMap = {
    text: promptText,
    hashtags: promptHashtags,
    image: imageSource
  };

  const setGeneratedMap = {
    text: setGeneratedText,
    hashtags: setGeneratedHashtags,
    image: setGeneratedImage
  };

  const cleanValue = (value: string) => (value.trim() === "" ? null : value);

  const buildPostData = () => ({
    accountId,
    promptText: cleanValue(promptText),
    promptImage: cleanValue(imageSource),
    promptHashtags: cleanValue(promptHashtags),
    imageSource: "",
    targetUrl: cleanValue(targetUrl),
    cronExpression: cleanValue(cronExpression),
    promotedOnly: isPromoted,
  });

  const handleGenerateClick = async (type: "text" | "hashtags" | "image") => {
    const prompt = promptsMap[type];
    setLoadingState((prev) => ({ ...prev, [type]: true }));

    try {
      const res = await axiosInstance.post("/content-settings/generate", {
        type,
        prompt,
      });

      await axiosInstance.post("/content-settings", buildPostData());
      toast.success(`${type} сгенерирован успешно!`);
      setGeneratedMap[type](res.data?.result || "");
    } catch (err) {
      console.error(err);
      toast.error(`Ошибка при генерации ${type}`);
    } finally {
      setLoadingState((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmitPost = async () => {
    setLoading(true);

    const payload = {
      accountId,
      content: generatedText,
      imageUrl: cleanValue(generatedImage || imageSource),
      hashtags: cleanValue(generatedHashtags),
      targetUrl: cleanValue(targetUrl),
      promoted: isPromoted,
    };

    try {
      let result: any;
      if (isAutoPost) {
        result = await axiosInstance.post("/schedule/schedule-post", {
          accountId,
          cronExpression,
        });
      } else {
        result = await axiosInstance.post("/puppeteer/submit-post", payload);
      }

      toast.success(`Пост успешно создан и запланирован! Ссылка: ${result.url}`);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message;
      if (Array.isArray(errorMsg)) {
        errorMsg.forEach((msg: string) => toast.error(msg));
      } else {
        toast.error(errorMsg || "Ошибка при создании поста.");
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

      {/* Переключатель режимов */}
      <section className="space-y-4">
        <div className="flex gap-4">
          <button
            className={`flex-1 py-2 rounded-xl font-medium transition ${
              isAutoPost
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setIsAutoPost(true)}
          >
            🔄 Авто по CRON
          </button>
          <button
            className={`flex-1 py-2 rounded-xl font-medium transition ${
              !isAutoPost
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setIsAutoPost(false)}
          >
            🖊 Ручной режим
          </button>
        </div>

        {isAutoPost && (
          <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
            <FaInfoCircle className="text-blue-500 mt-1" />
            <p className="text-sm text-blue-700">
              Контент будет автоматически генерироваться на основе последнего
              вручную созданного поста.
            </p>
          </div>
        )}
      </section>

      {/* Секция промптов (только в ручном режиме) */}
      {!isAutoPost && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            🧩 Источники и промпты
          </h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PromptInputBlock
              label="Источник изображений"
              icon={<FaImage />}
              value={imageSource}
              onChange={(e) => setImageSource(e.target.value)}
              onGenerate={() => handleGenerateClick("image")}
              disabled={loadingState.image}
              generatedContent={generatedImage}
              type="image"
              placeholder="Введите источник изображений"
              btnText="Обработать изображение AI"
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
      )}

      <hr className="border-gray-200" />

      {/* Настройки публикации */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">
          ⚙️ Настройки публикации
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {isAutoPost && (
            <TextInputBlock
              label="Интервал автопубликации"
              icon={<FaClock />}
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="CRON выражение"
            />
          )}
        </div>
      </section>

      {/* Превью и кнопка отправки (ручной режим) */}
      {!isAutoPost && (
        <>
          <PostPreview
            text={generatedText}
            hashtags={generatedHashtags}
            targetUrl={targetUrl}
            image={generatedImage || imageSource}
            isPromoted={isPromoted}
          />
        </>
      )}

      <div className="pt-4">
        <FullAiGenerationBtn
          disabled={
            loading ||
            (!isAutoPost && (!postValidation.isValid || !generatedText))
          }
          onClick={handleSubmitPost}
        >
          {loading ? (
            <FaSpinner className="animate-spin mr-2 inline" />
          ) : isAutoPost ? (
            "📅 Запланировать автопостинг"
          ) : (
            "📤 Опубликовать"
          )}
        </FullAiGenerationBtn>
      </div>
    </div>
  );
}
