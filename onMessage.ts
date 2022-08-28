import { v2 } from "@google-cloud/translate";

import { getStats, hasUserOptedOut, saveToDb } from "./helpers";

const translate = new v2.Translate({
  key: process.env.gcloud,
});

export const onMessage = async (msg, bot) => {
  const userId = msg.from.id;
  const optOut = hasUserOptedOut(userId);
  if (optOut) return;

  const chatId = msg.chat.id;
  const message = msg.text;
  switch (message) {
    case (message.match(/^!optout/) || {}).input:
      saveToDb(
        {
          userId,
          reason: message.replace("!optout", ""),
        },
        "optouts"
      );
      bot.sendMessage(
        chatId,
        "Hey, the spyware is now disabled from your account."
      );
      break;
    case (message.match(/^!stats/) || {}).input:
      const amount = message.split(" ");
      const stats = getStats(chatId, amount[1]);
      bot.sendMessage(chatId, stats);
      break;
    case (message.match(/^hey hackerman/) || {}).input:
      bot.sendMessage(chatId, "Hey! :)");
    default:
      break;
  }

  let [detection] = await translate.detect(message);

  if (
    detection.language &&
    (detection.language === "fi" ||
      detection.language === "pl" ||
      detection.language === "hu")
  ) {
    const [translation] = await translate.translate(
      message,
      detection.language === "fi" ? "pl" : "fi"
    );
    console.log(detection.language, translation);
    bot.sendMessage(chatId, translation);
  }

  saveToDb(
    {
      chatId,
      username: msg.chat.username,
      message,
      language: detection.language ? detection.language : undefined,
    },
    "translations"
  );
};
