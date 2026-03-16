// Load environment variables from a .env file
require('dotenv/config');

// Import necessary classes and enums from discord.js
const { Client, GatewayIntentBits, Partials } = require('discord.js');

// Import custom utility functions for handling events and errors
const { handler, isError } = require('./utils/helpers.js');

// Create a new Discord client instance
// - intents: specifies which events the bot will receive
// - partials: allows the bot to receive incomplete data for certain structures
const client = new Client({
    intents: [Object.keys(GatewayIntentBits)], // Subscribe to all available gateway intents
    partials: [Object.keys(Partials)], // Enable all available partial structures
});

// Log in the bot using the token stored in environment variables
client.login(process.env.TOKEN);

// Attach the event handler logic from helpers.js
handler(client);

// Set up error handling for the client
isError(client);
