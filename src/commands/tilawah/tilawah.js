import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
} from "discord.js";
import {
    searchReciter,
    searchSurah,
    getTilawah,
} from "../../utils/api/reciters.js";
import { GuildPlayer } from "../../utils/class/GuildPlayer.js";

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

            const channel = interaction.member?.voice?.channel;
            if (!channel) {
                return interaction.editReply({
                    content: "❌ You must be in a voice channel.",
                });
            }

            const data = await getTilawah(reciterName, surahName);
            if (!data) {
                return interaction.editReply({
                    content: "❌ No audio found for this reciter and surah.",
                });
            }

            const {
                audio,
                reciter,
                surah: { name, number, makkia },
            } = data;

            const guildPlayer = new GuildPlayer();
            await guildPlayer.play({
                userID: interaction.user.id,
                guild: interaction.guild,
                channel,
                audio,
            });

            const container = new ContainerBuilder()
                .setAccentColor(0x57f287)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# تلاوة قرآنية "),
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(SeparatorSpacingSize.Large),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `> 👤 **القارئ**\n> ${reciter}\n\n> 📖 **السورة**\n> ${name}\nرقم السورة: ${number}\n النزول: ${makkia}`,
                    ),
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(SeparatorSpacingSize.Large),
                )
                .addActionRowComponents((actionRow) =>
                    actionRow.setComponents(
                        new ButtonBuilder()
                            .setCustomId("tilawah_pause")
                            .setLabel("إيقاف")
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("tilawah_resume")
                            .setLabel("إكمال")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId("tilawah_stop")
                            .setLabel("إنهاء")
                            .setStyle(ButtonStyle.Danger),
                    ),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        "🤲 اللهم اجعل القرآن ربيع قلوبنا",
                    ),
                );

            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
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
