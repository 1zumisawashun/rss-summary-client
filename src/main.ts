import {
  getChatGptMessage,
  sendToSlack,
  getConversationsReplies,
  messageFormatter,
} from "./helpers";

const main = (e: any) => {
  const params = JSON.parse(e.postData.getDataAsString());

  // NOTE:SlackのEvent SubscriptionsのRequest Verification用
  if (params.type === "url_verification") {
    return ContentService.createTextOutput(params.challenge);
  }

  const event = params.event;
  const subtype = event.subtype;
  const type = event.type;

  // NOTE:Slack Botによるメンションを無視する（無限ループを回避する）
  if (subtype) return;

  // NOTE:Slackの3秒ルールで発生するリトライをキャッシュする
  const cache = CacheService.getScriptCache();
  if (cache.get(params.event_id) == "done") return;
  cache.put(params.event_id, "done", 600);

  // NOTE:以下からメインの処理

  if (["message"].includes(type)) {
    const channelId = event.channel;
    const thread_ts = event.thread_ts || event.ts;
    // NOTE:RSSの内容だけに反応させる
    sendToSlack(channelId, thread_ts, event);
  }

  if (["reaction_added"].includes(type)) {
    // NOTE:「要約して」スタンプだけに反応させる
    if (event.reaction !== "youyaku") return;

    const channelId = event.item.channel;
    const thread_ts = event.item.ts;

    // NOTE:スタンプを押下したメッセージ（単体）の内容を取得する
    const message = getConversationsReplies(channelId, thread_ts);
    const content = messageFormatter(message);
    const text = getChatGptMessage(`日本語で要約してください。${content}`);

    sendToSlack(channelId, thread_ts, text);
  }

  return;
};

(global as any).doPost = main;
