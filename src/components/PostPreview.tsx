
type Props = {
  text: string;
  image?: string;
  hashtags: string;
  targetUrl: string;
  isPromoted: boolean;
};

import { validatePostLength } from "../utils/validatePostLength"; // путь зависит от структуры

export default function PostPreview({
  text,
  image,
  hashtags,
  targetUrl,
  isPromoted,
}: Props) {
  const validation = validatePostLength({
    content: text,
    hashtags,
    targetUrl,
  });

  return (
    <div className="border border-gray-300 p-4 rounded-xl shadow-sm bg-gray-50 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">👁️‍🗨️ Превью поста</h3>

      {isPromoted && (
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
          Продвигаемый пост
        </span>
      )}

      {text && <p className="text-gray-700 whitespace-pre-line">{text}</p>}

      {image && (
        <img
          src={image}
          alt="Preview"
          className="max-h-64 rounded-lg object-contain border"
        />
      )}

      {hashtags && (
        <div className="text-sm text-gray-600">
          <strong>Хэштеги:</strong>{" "}
          <span className="text-indigo-600">{hashtags}</span>
        </div>
      )}

      {targetUrl && (
        <div className="text-sm text-gray-600">
          <strong>Ссылка:</strong>{" "}
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {targetUrl}
          </a>
        </div>
      )}

      {!validation.isValid && (
        <div className="text-sm text-red-600 font-medium">
          ⚠️ {validation.error}
        </div>
      )}

      {validation.isValid && (
        <div className="text-sm text-gray-500">
          Длина поста: {validation.totalLength}/279 символов
        </div>
      )}
    </div>
  );
}
