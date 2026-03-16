// Import necessary classes from discord.js
const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require('discord.js');

module.exports = {
    // Define the slash command with name 'ping' and description
    data: new SlashCommandBuilder().setName('ping').setDescription('Displays bot ping and API response'),

    /**
     * Executes when the /ping command is used
     * @param {ChatInputCommandInteraction} interaction - The command interaction object
     * @param {Client} client - The Discord client instance
     */
    async execute(interaction, client) {
        try {
            // Send an initial reply to measure latency
            const sent = await interaction.reply({
                content: 'Pinging...', // Temporary message
                fetchReply: true, // Fetch the message object to calculate ping
            });

            // Calculate bot latency (time between interaction and bot reply)
            const ping = sent.createdTimestamp - interaction.createdTimestamp;

            // Get Discord API WebSocket ping
            const apiResponse = Math.round(client.ws.ping);

            // Edit the initial reply to show both latencies
            await interaction.editReply(`Bot Ping: ${ping}ms\nAPI Ping: ${apiResponse}ms`);
        } catch (err) {
            // Log any errors that occur during execution
            console.error(err);
        }
    },
};
