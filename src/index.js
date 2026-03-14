import { Client, GatewayIntentBits, Partials } from "discord.js";
import { readdirSync } from "node:fs";
import "dotenv/config";

const client = new Client({
    intents: [Object.keys(GatewayIntentBits)],
    partials: [Object.keys(Partials)],
});

readdirSync("./handlers").forEach(async (file) => {
    const module = await import(`../handlers/${file}`);
    module.default(client);
});

client.login(process.env.TOKEN);
