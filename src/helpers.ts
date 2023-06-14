import { Message } from "./types";

export const sendToSlack = (
  channelId?: string,
  thread_ts?: string,
  message?: any
) => {
  const url = process.env.SLACK_INCOMING_WEBHOOK;

  if (!url) return;

  const payload = JSON.stringify({
    token: process.env.BOT_USER_OAUTH_TOKEN,
    channel: channelId,
    text: JSON.stringify(message),
    thread_ts: thread_ts,
  });

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: payload,
  });
};

// ChatGPTに食わせるurlもしくはテキストを取得する
export const messageFormatter = (message: Message) => {
  const elements = message.blocks[0].elements[0].elements;
  const url = elements.find((elm) => elm.type === "link")?.url || undefined;
  return url || message.text;
};

export const getConversationsReplies = (channelId: string, ts: string) => {
  /**
   * 初めはreactions.getでリアクション（スタンプ）したメッセージを取得していたが
   * まるっと情報を取得するならconversations.historyの方が期待値に近いので採用。
   * しかしconversations.historyがアップデートに伴いconversations.repliesを使う必要があった。
   */
  const payload = {
    token: process.env.BOT_USER_OAUTH_TOKEN,
    channel: channelId,
    ts: ts,
    limit: 1,
    inclusive: true,
  };

  const response = UrlFetchApp.fetch(
    "https://slack.com/api/conversations.replies",
    {
      method: "post",
      contentType: "application/x-www-form-urlencoded",
      payload: payload,
    }
  );

  const conversationsHistory = JSON.parse(response as any);
  return conversationsHistory.messages[0];
};

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
