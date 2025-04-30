import { useCallback, useEffect, useState } from "react";
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
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../axiosConfig";
import { validatePostLength } from "../utils/validatePostLength";
import FullAiGenerationBtn from "./FullAiGenerationBtn";
import PostPreview from "./PostPreview";
import PromptInputBlock from "./PromptInputBlock";
import TextInputBlock from "./TextInputBlock";
import ToggleInput from "./ToggleInput";

type Props = {};

export default function FullAiGeneration({}: Props) {
  const { accountId } = useParams<{ accountId: string }>();

  const [promptText, setPromptText] = useState("");
  const [promptImage, setPromptImage] = useState("");
  const [promptHashtags, setPromptHashtags] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [isPromoted, setIsPromoted] = useState(false);
  const [isAutoPost, setIsAutoPost] = useState(false);

  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState("");
  const postValidation = validatePostLength({
    content: generatedText,
    hashtags: generatedHashtags,
  });

  const [loadingState, setLoadingState] = useState<{
    text: boolean;
    image: boolean;
    hashtags: boolean;
  }>({
    text: false,
    image: false,
    hashtags: false,
  });

  const promptsMap: Record<"text" | "image" | "hashtags", string> = {
    text: promptText,
    image: promptImage,
    hashtags: promptHashtags,
  };

  const setGeneratedMap: Record<
    "text" | "image" | "hashtags",
    React.Dispatch<React.SetStateAction<string>>
  > = {
    text: setGeneratedText,
    image: setGeneratedImage,
    hashtags: setGeneratedHashtags,
  };

  const [loading, setLoading] = useState(false);

  const cleanValue = (value: string) => (value.trim() === "" ? null : value);

  const buildPostData = () => ({
    accountId,
    promptText: cleanValue(promptText),
    promptImage: cleanValue(promptImage),
    promptHashtags: cleanValue(promptHashtags),
    targetUrl: cleanValue(targetUrl),
    cronExpression: cleanValue(cronExpression),
    promotedOnly: isPromoted,
  });

  const loadData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `/content-settings/${accountId}`
      );
      const data = response.data;

      setPromptText(data.promptText || "");
      setPromptImage(data.promptImage || "");
      setPromptHashtags(data.promptHashtags || "");
      setTargetUrl(data.targetUrl || "");
      setCronExpression(data.cronExpression || "");
      setIsPromoted(data.isPromoted || false);
      setIsAutoPost(data.isAutoPost || false);
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
    }
  }, [accountId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateClick = async (type: "text" | "image" | "hashtags") => {
    const prompt = promptsMap[type];

    setLoadingState((prev) => ({ ...prev, [type]: true }));

    try {
      const res = await axiosInstance.post("/content-generation/generate", {
        type,
        prompt,
      });

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
      imageUrl: cleanValue(generatedImage),
      hashtags: cleanValue(generatedHashtags),
      targetUrl: cleanValue(targetUrl),
      promoted: isPromoted,
    };

    try {
      let result;
      if (isAutoPost) {
        result = await axiosInstance.post(
          "/schedule/schedule-post",
          buildPostData()
        );
      } else {
        result = await axiosInstance.post("/puppeteer/submit-post", payload);
        console.log(result);
      }

      toast.success(
        <span>
          Пост успешно создан и запланирован! 
        </span>
      );
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
      <h2 className="text-2xl font-semibold text-gray-800">
        🔹 Метод 1: Full AI Generation
      </h2>

      {/* Секция генерации контента */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold text-gray-700 mb-2">
          🧠 Генерация контента
        </legend>

        {/* Переключатель для режимов */}
        <div className="mb-6 flex space-x-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              isAutoPost ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setIsAutoPost(true)}
          >
            🔄 Авто по CRON
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              !isAutoPost ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setIsAutoPost(false)}
          >
            🖊 Ручной режим
          </button>
        </div>

        {/* Включаем/выключаем режим генерации контента */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PromptInputBlock
            label="Prompt для изображения"
            icon={<FaImage />}
            value={promptImage}
            onChange={(e) => setPromptImage(e.target.value)}
            onGenerate={() => handleGenerateClick("image")}
            disabled={loadingState.image}
            generatedContent={generatedImage}
            type="image"
          />
          <PromptInputBlock
            label="Prompt для хештегов"
            icon={<FaHashtag />}
            value={promptHashtags}
            onChange={(e) => setPromptHashtags(e.target.value)}
            onGenerate={() => handleGenerateClick("hashtags")}
            disabled={loadingState.hashtags}
            generatedContent={generatedHashtags}
            type="hashtags"
          />
        </div>

        <PromptInputBlock
          label="Prompt для текста"
          icon={<FaHashtag />}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          onGenerate={() => handleGenerateClick("text")}
          disabled={loadingState.text}
          generatedContent={generatedText}
          type="text"
        />
      </fieldset>

      {/* Секция параметров публикации */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold text-gray-700 mb-2">
          ⚙️ Настройки публикации
        </legend>

        <TextInputBlock
          label="Target URL"
          icon={<FaLink />}
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="Введите URL"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isAutoPost && (
            <TextInputBlock
              label="Интервал автопубликации"
              icon={<FaClock />}
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="CRON выражение"
              // disabled={!isAutoPost}
            />
          )}

          <ToggleInput
            label="Promoted only"
            icon={<FaCheckCircle />}
            checked={isPromoted}
            onChange={() => setIsPromoted(!isPromoted)}
          />
        </div>
      </fieldset>

      {/* Кнопка отправки */}
      <div className="pt-4">
        {!isAutoPost && (
          <PostPreview
            text={generatedText}
            image={generatedImage}
            hashtags={generatedHashtags}
            targetUrl={targetUrl}
            isPromoted={isPromoted}
          />
        )}

        <FullAiGenerationBtn
          disabled={
            loading ||
            (!isAutoPost && !postValidation.isValid) ||
            (!isAutoPost && !generatedText)
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
