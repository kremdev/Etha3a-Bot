/*
 * Etha3a-Bot – Quran & Azkar Bot
 * Copyright (c) 2026 RlxChap2 and kremdev
 * MIT License
 */

import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import 'dotenv/config';

const client = new Client({
    intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
    partials: Object.values(Partials) as Partials[],
});

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.login(process.env.TOKEN!);
