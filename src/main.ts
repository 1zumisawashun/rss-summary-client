export const sendToSlack = (
  params: any,
  channelId: string,
  thread_ts: string
) => {
  const url = process.env.SLACK_INCOMING_WEBHOOK;
  const event = params.event;
  const user = event.user;

  if (!url) return;

  const payload = JSON.stringify({
    token: process.env.BOT_USER_OAUTH_TOKEN,
    channel: channelId,
    text: `<@${user}> メンションありがとうモス！\n要約するモス！\n\n${JSON.stringify(
      params
    )}`,
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
    // NOTE:「要約して」スタンプだけに反応させる
    // NOTE:スタンプを押下したメッセージの内容を取得する
    sendToSlack(params, channelId, thread_ts);
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
