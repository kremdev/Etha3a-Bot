import { Events } from "discord.js";

export default {
    name: Events.InteractionCreate,
    once: false,

    async execute(interaction, client) {
        if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (!command?.autocomplete) return;

            try {
                await command.autocomplete(interaction, client);
            } catch (error) {
                console.error(error);
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Error!", ephemeral: true });
        }
    },
};
