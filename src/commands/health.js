import {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("health")
        .setDescription("Check the health status of the API server"),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            const data = await fetch("http://localhost:3000/health");
            const { status, code } = await data.json();
            await interaction.reply(`Status: **${status}**\nCode: **${code}**`);
        } catch (e) {
            console.error(e);
            await interaction.reply(`Error`);
        }
    },
};
