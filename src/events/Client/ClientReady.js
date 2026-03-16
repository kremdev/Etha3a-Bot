// Import Client class and Events enum from discord.js
const { Client, Events } = require('discord.js');

module.exports = {
    // Execute this event only once when the bot becomes ready
    once: true,

    // Event name for when the client is fully ready
    name: Events.ClientReady,

    /**
     * Executes when the bot is ready
     * @param {Client} client - The Discord client instance
     */
    async execute(client) {
        // Display a table in the console with basic bot statistics
        console.table({
            Name: client.user.username, // Bot username
            ID: client.user.id, // Bot unique ID
            Tag: client.user.tag, // Bot tag (username#discriminator)
            Servers: client.guilds.cache.size, // Number of servers the bot is in
            Users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0), // Total members across all servers
            Channels: client.channels.cache.size, // Total channels cached by the bot
            Commands: client.commands.size, // Number of registered commands
        });
    },
};
