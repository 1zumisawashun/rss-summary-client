import { createSummary } from "./helpers";

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

  // const text = message ? JSON.stringify(message) : JSON.stringify(event);
  const randomText = createSummary(
    params,
    "10文字くらいの適当な言葉を喋ってください。"
  );

  // <@${user}>

  const text = JSON.stringify(message) || randomText;

  const payload = JSON.stringify({
    token: process.env.BOT_USER_OAUTH_TOKEN,
    channel: channelId,
    text: text,
    thread_ts: thread_ts,
  });

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: payload,
  });
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
      limit: 1,
      inclusive: true,
    },
  };

  /**
   * 初めはreactions.getでスタンプしたメッセージを取得していたが
   * まるっと情報を取得するならconversations.historyの方が期待値に近いので採用している
   * けどhistoryがアップデートに伴いrepliesを使う必要があるのでrepliesに落ち着いた
   */
  const response = UrlFetchApp.fetch(
    "https://slack.com/api/conversations.replies",
    messageOptions as any
  );

  const res = JSON.parse(response as any);

  return res;
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

    const conversationsHistory = getConversationsHistory(
      params,
      channelId,
      thread_ts
    );
    // NOTE:「要約して」スタンプだけに反応させる

    // NOTE:スタンプを押下したメッセージ（単体）の内容を取得する
    const message = conversationsHistory.messages[0];
    sendToSlack(params, channelId, thread_ts, message);
  }

  if (type === "message") {
    const channelId = event.channel;
    const thread_ts = event.thread_ts || event.ts;
    // NOTE:RSSの内容だけに反応させる
    sendToSlack(params, channelId, thread_ts);
  }

  if (type === "bot_message") {
    const channelId = event.channel;
    const thread_ts = event.thread_ts || event.ts;
    // NOTE:RSSの内容だけに反応させる
    sendToSlack(params, channelId, thread_ts, "ボットメッセージです！");
  }

  return;
};

(global as any).doPost = main;
