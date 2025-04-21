export function validatePostLength({
  content,
  hashtags,
  targetUrl,
}: {
  content: string;
  hashtags?: string;
  targetUrl?: string;
}): { isValid: boolean; totalLength: number; error?: string } {
  const pieces = [
    content?.trim(),
    hashtags?.trim(),
    targetUrl ? `Check it out: ${targetUrl}` : null,
  ].filter(Boolean);

  const finalText = pieces.join("\n");
  const totalLength = finalText.length;

  if (totalLength > 279) {
    return {
      isValid: false,
      totalLength,
      error: `Общий текст превышает лимит: ${totalLength}/279 символов`,
    };
  }

  return {
    isValid: true,
    totalLength,
  };
}
