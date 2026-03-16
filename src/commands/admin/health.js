// Import required classes and builders from discord.js
const {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags,
} = require('discord.js');

module.exports = {
    // Define the slash command with name 'health' and description
    data: new SlashCommandBuilder().setName('health').setDescription('Full system health report'),

    /**
     * Executes when the /health command is invoked
     * @param {ChatInputCommandInteraction} interaction - The interaction object for the command
     * @param {Client} client - The Discord client instance
     */
    async execute(interaction, client) {
        // Start timer for total execution measurement
        const start = Date.now();

        /* BOT METRICS */
        const wsPing = client.ws.ping; // WebSocket ping
        const botLatency = Date.now() - interaction.createdTimestamp; // Time from command to bot response

        const uptime = process.uptime(); // Bot process uptime in seconds
        const memory = process.memoryUsage(); // Memory usage info

        const memUsed = (memory.heapUsed / 1024 / 1024).toFixed(2); // Convert bytes to MB
        const memTotal = (memory.heapTotal / 1024 / 1024).toFixed(2); // Convert bytes to MB

        /* API HEALTH */
        let apiStatus = 'DOWN';
        let apiCode = 'N/A';
        let apiLatency = 'N/A';

        try {
            // Measure response time for API health check
            const apiStart = Date.now();
            const res = await fetch('http://localhost:3000/health'); // Placeholder endpoint
            const json = await res.json();

            apiLatency = Date.now() - apiStart; // API response time
            apiStatus = json.status ?? 'OK'; // Default status if missing
            apiCode = json.code ?? res.status; // Use HTTP status if code missing
        } catch {} // Fail silently if API call fails

        const totalExec = Date.now() - start; // Total command execution time

        // Build a structured message container with multiple sections
        const container = new ContainerBuilder()
            // Header section
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# System Health Report\nLive metrics and status overview of the bot infrastructure.'),
            )
            .addSeparatorComponents(new SeparatorBuilder())

            // Bot metrics section
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### Bot Metrics\n**Status:** ONLINE\n**WS Ping:** \`${wsPing}ms\`\n**Command Latency:** \`${botLatency}ms\`\n**Uptime:** <t:${Math.floor(Date.now() / 1000 - uptime)}:R>`,
                ),
            )
            .addSeparatorComponents(new SeparatorBuilder())

            // Memory usage section
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### Memory Usage\n**Heap Used:** \`${memUsed} MB\`\n**Heap Total:** \`${memTotal} MB\``),
            )
            .addSeparatorComponents(new SeparatorBuilder())

            // API health section
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### API Health\n**Status:** ${apiStatus === 'OK' ? 'OK' : apiStatus}\n**Code:** \`${apiCode}\`\n**Latency:** \`${apiLatency}ms\``,
                ),
            )
            .addSeparatorComponents(new SeparatorBuilder())

            // Environment and execution time section
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### Environment\n**Node:** \`${process.version}\`\n**Platform:** \`${process.platform}\`\n**Arch:** \`${process.arch}\`\n\n**Execution Time:** \`${totalExec}ms\``,
                ),
            );

        // Send the container as a reply to the command interaction
        await interaction.reply({
            components: [container], // Attach the built container
            flags: MessageFlags.IsComponentsV2, // Enable component rendering
        });
    },
};
