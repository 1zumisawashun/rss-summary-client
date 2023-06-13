export const getChatGptMessage = (content: string) => {
  const apiKey = process.env.CHAT_GPT_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const messages = [
    {
      role: "user",
      content: content,
    },
  ];

  const headers = {
    Authorization: "Bearer " + apiKey,
    "Content-type": "application/json",
  };

  const payload = {
    model: "gpt-3.5-turbo",
    max_tokens: 1024,
    temperature: 0.9,
    messages: messages,
  };

  const response = UrlFetchApp.fetch(apiUrl, {
    muteHttpExceptions: true,
    headers: headers,
    method: "post",
    payload: JSON.stringify(payload),
  });

  const parsedResponse = JSON.parse(response.getContentText());

  return parsedResponse.choices[0].message.content;
};
