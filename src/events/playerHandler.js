import { Events } from "discord.js";
import { players } from "../utils/class/GuildPlayer.js";

export default {
    name: Events.InteractionCreate,
    once: false,

    /**
     *
     * @param {import('discord.js').Interaction} interaction
     * @param {*} client
     * @returns
     */
    async execute(interaction, client) {
        if (interaction.isButton()) {
            await interaction.deferUpdate().catch(() => null);
            const guildPlayer = players.get(interaction.guildId);

            if (!guildPlayer) {
                return interaction.followUp({
                    content: "لا يوجد تلاوة قيد التشغيل ❌",
                    ephemeral: true,
                });
            }

            console.log(guildPlayer);
            switch (interaction.customId) {
                case "tilawah_pause":
                    guildPlayer.pause();
                    break;
                case "tilawah_resume":
                    guildPlayer.resume();
                    break;
                case "tilawah_stop":
                    guildPlayer.stop();
                    break;
            }

            await interaction.deferUpdate().catch(() => null);
            return;
        }
    },
};
