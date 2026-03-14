import { Client, GatewayIntentBits, Partials } from "discord.js";
import { readdirSync } from "node:fs";
import "dotenv/config";
import { getTilawah, searchReciter } from "./funcs/api/reciters.js";

const client = new Client({
    intents: [Object.keys(GatewayIntentBits)],
    partials: [Object.keys(Partials)],
});

readdirSync("./handlers").forEach(async (file) => {
    const module = await import(`../handlers/${file}`);
    module.default(client);
});

client.on("ready", async () => {
    const d = await getTilawah("المنشاوي", "الكوثر");
    console.log(d);
});
/**
 * {
  id: 112,
  name: 'محمد صديق المنشاوي',
  date: '2025-08-30T21:47:54.000000Z',
  moshaf: [
    {
      id: 114,
      name: 'المصحف المعلم - المصحف المعلم',
      server: 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mo-lim/'
    },
    {
      id: 113,
      name: 'المصحف المجود - المصحف المجود',
      server: 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/'
    },
    {
      id: 112,
      name: 'حفص عن عاصم - مرتل',
      server: 'https://server10.mp3quran.net/minsh/'
    }
  ],
  apiName: 'mp3quran.net'
}
 */
client.login(process.env.TOKEN);
