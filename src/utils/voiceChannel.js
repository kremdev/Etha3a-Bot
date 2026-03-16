import {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
    getVoiceConnection,
} from "@discordjs/voice";

/**
 * @param {import("discord.js").Guild} guild
 * @param {import("discord.js").VoiceChannel} channel
 */
export async function joinChannel(guild, channel) {
    const existing = getVoiceConnection(guild.id);
    if (existing) return existing;

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}
