const { Events, ChatInputCommandInteraction, Client } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    /**
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async execute(interaction, client) {
        // Detect DM usage
        if (!interaction.guild) {
            console.warn(`⚠️ Command used in DM by ${interaction.user.tag} (${interaction.user.id})`);
            if (interaction.isChatInputCommand()) {
                return interaction.reply({
                    content: `⚠️ Sorry, you can't use this command in private messages (DM).`,
                    ephemeral: true,
                });
            }
            return;
        }

        // Check if the interaction is a chat input command (slash command)
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.warn(`⚠️ Command not found: ${interaction.commandName}`);
                return interaction.reply({
                    content: `⚠️ No command matching \`${interaction.commandName}\` was found.`,
                    ephemeral: true,
                });
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`❌ Error executing command: ${interaction.commandName}`, error);
                await interaction.reply({
                    content: `⚠️ An error occurred while executing the command \`${interaction.commandName}\`. Please try again later.`,
                    ephemeral: true,
                });
            }
        } else if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (command) {
                try {
                    await command.autocomplete(interaction, client);
                } catch (error) {
                    console.error(`❌ Error executing autocomplete: ${interaction.commandName}`, error);
                }
            }
        }
    },
};
