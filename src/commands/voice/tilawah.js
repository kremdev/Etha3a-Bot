import {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
} from "discord.js";
import {
    searchReciter,
    searchSurah,
    getTilawah,
} from "../../funcs/api/reciters.js";

export default {
    data: new SlashCommandBuilder()
        .setName("tilawah")
        .setDescription("Start reciting a Surah or Aya")
        .addStringOption((option) =>
            option
                .setName("reciter")
                .setDescription("Type and select a reciter")
                .setRequired(true)
                .setAutocomplete(true),
        )
        .addStringOption((option) =>
            option
                .setName("surah")
                .setDescription("Type and select surah name")
                .setRequired(true)
                .setAutocomplete(true),
        ),

    async execute(interaction, client) {
        await interaction.deferReply();
        try {
            const reciterName = interaction.options.getString("reciter");
            const surahName = interaction.options.getString("surah");

            const audio = await getTilawah(reciterName, surahName);

            if (!audio) {
                return interaction.editReply({
                    content: "❌ No audio found for this reciter and surah.",
                });
            }

            await interaction.editReply({
                content: `**${reciterName}** - **${surahName}**\nlink:${audio}`,
            });
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: "❌ An error occurred." });
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const value = focusedOption.value?.trim() || "";

        try {
            if (focusedOption.name === "reciter") {
                const reciters = await searchReciter(value);
                await interaction.respond(
                    reciters
                        .slice(0, 25)
                        .map((r) => ({ name: r.name, value: r.name })),
                );
            }

            if (focusedOption.name === "surah") {
                const surahs = await searchSurah(value);
                await interaction.respond(
                    surahs
                        .slice(0, 25)
                        .map((s) => ({ name: s.name, value: s.name })),
                );
            }
        } catch (e) {
            console.error(e);
            await interaction.respond([]);
        }
    },
};
