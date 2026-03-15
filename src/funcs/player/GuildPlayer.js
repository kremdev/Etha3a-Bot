import {
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    entersState,
} from "@discordjs/voice";
import { joinChannel } from "../voiceChannel.js";

export class GuildPlayer {
    constructor() {
        this.player = null;
        this.connection = null;
    }

    async play({ guild, channel, audio }) {
        this.connection = await joinChannel(guild, channel);

        this.player = createAudioPlayer();
        const resource = createAudioResource(audio);

        this.connection.subscribe(this.player);
        this.player.play(resource);

        await entersState(this.player, AudioPlayerStatus.Playing, 10_000);

        players.set(guild.id, this);

        return this.player;
    }

    pause() {
        this.player?.pause();
    }

    resume() {
        this.player?.unpause();
    }

    stop() {
        this.player?.stop();
        players.delete(this.connection?.joinConfig?.guildId);
    }

    isPlaying() {
        return this.player?.state?.status === AudioPlayerStatus.Playing;
    }
}

export const players = new Map();
