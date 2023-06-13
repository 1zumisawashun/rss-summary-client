export const sendToSlack = (
  params: any,
  channelId: string,
  thread_ts: string,
  message?: any
) => {
  const url = process.env.SLACK_INCOMING_WEBHOOK;
  const event = params.event;
  const user = event.user;

  if (!url) return;

  const text = message ? JSON.stringify(message) : JSON.stringify(event);

  const payload = JSON.stringify({
    token: process.env.BOT_USER_OAUTH_TOKEN,
    channel: channelId,
    text: `<@${user}> メンションありがとうモス！\n要約するモス！\n\n${text}`,
    thread_ts: thread_ts,
  });

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: payload,
  });
};

const createSummary = (params: any) => {
  const apiKey = process.env.CHAT_GPT_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const text = params.event.text;

  const messages = [
    {
      role: "user",
      content: `${text}の中にあるリンク先の内容を要約してください。リンク先の内容が外国語の場合は日本語で要約してください。３行くらいでまとめてください。`,
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

const getConversationsHistory = (
  params: any,
  channelId: string,
  ts: string
) => {
  const messageOptions = {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      token: process.env.BOT_USER_OAUTH_TOKEN,
      channel: channelId,
      ts: ts,
      // limit: 1,
      // inclusive: true,
    },
  };

  // NOTE:https://api.slack.com/methods/conversations.history
  const response = UrlFetchApp.fetch(
    "https://slack.com/api/conversations.replies",
    messageOptions as any
  );

  const res = JSON.parse(response as any);

  return res;
};

const getReactions = (params: any, channelId: string, thread_ts: string) => {
  const messageOptions = {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      token: process.env.BOT_USER_OAUTH_TOKEN,
      channel: channelId,
      timestamp: thread_ts,
    },
  };

  // NOTE:https://api.slack.com/methods/reactions.get
  const response = UrlFetchApp.fetch(
    "https://slack.com/api/reactions.get",
    messageOptions as any
  );

  const json = JSON.parse(response as any);

  return json.message;
};

const main = (e: any) => {
  const params = JSON.parse(e.postData.getDataAsString());

  // NOTE:SlackのEvent SubscriptionのRequest Verification用
  if (params.type === "url_verification") {
    return ContentService.createTextOutput(params.challenge);
  }

  const event = params.event;
  const subtype = event.subtype;
  const type = params.event.type;

  // NOTE:Slack Botによるメンションを無視する
  if (subtype) return;

  // NOTE:Slackの3秒ルールで発生するリトライをキャッシュする
  const cache = CacheService.getScriptCache();
  if (cache.get(params.event_id) == "done") return;
  cache.put(params.event_id, "done", 600);

  if (type === "reaction_added") {
    const channelId = event.item.channel;
    const thread_ts = event.item.ts;

    // const reactions = getReactions(params, channelId, thread_ts);
    // sendToSlack(params, channelId, thread_ts, reactions);
    // NOTE: reactions.reactions
    const conversationsHistory = getConversationsHistory(
      params,
      channelId,
      thread_ts
    );
    // NOTE:「要約して」スタンプだけに反応させる
    // NOTE:スタンプを押下したメッセージの内容を取得する
    sendToSlack(params, channelId, thread_ts, conversationsHistory);
  }

  if (type === "message") {
    const channelId = event.channel;
    const thread_ts = event.thread_ts || event.ts;
    // NOTE:RSSの内容だけに反応させる
    sendToSlack(params, channelId, thread_ts);
  }

  return;
};

(global as any).doPost = main;

const parent = {
  client_msg_id: "7a858965-4934-4706-bde8-8b70f5902955",
  type: "message",
  text: "やあ",
  user: "U03TBJX2B9T",
  ts: "1686545101.321049",
  blocks: [
    {
      type: "rich_text",
      block_id: "uxGEQ",
      elements: [
        {
          type: "rich_text_section",
          elements: [{ type: "text", text: "やあ" }],
        },
      ],
    },
  ],
  team: "TS803A9GD",
  thread_ts: "1686544903.584189",
  parent_user_id: "U03TBJX2B9T",
  channel: "C058UTLCD9U",
  event_ts: "1686545101.321049",
  channel_type: "channel",
};

const res = {
  ok: true,
  messages: [
    {
      client_msg_id: "7a858965-4934-4706-bde8-8b70f5902955",
      type: "message",
      text: "やあ",
      user: "U03TBJX2B9T",
      ts: "1686545101.321049",
      blocks: [
        {
          type: "rich_text",
          block_id: "uxGEQ",
          elements: [
            {
              type: "rich_text_section",
              elements: [{ type: "text", text: "やあ" }],
            },
          ],
        },
      ],
      team: "TS803A9GD",
      thread_ts: "1686544903.584189",
      parent_user_id: "U03TBJX2B9T",
      reactions: [{ name: "raised_hands", users: ["U03TBJX2B9T"], count: 1 }], //ここに入る
    },
  ],
  has_more: false,
};
