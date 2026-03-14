import { REST, Routes, Collection, Events } from "discord.js";
import { readdirSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import Table from "cli-table3";
import "dotenv/config";

const getFiles = (dir) =>
    readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        return statSync(full).isDirectory()
            ? getFiles(full)
            : full.endsWith(".js")
              ? [full]
              : [];
    });

export default async (client) => {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    const commands = [];
    client.commands = new Collection();

    const table = new Table({
        head: ["Command", "Status"],
        colWidths: [30, 20],
    });

    const files = getFiles(join(process.cwd(), "src/commands"));

    const results = await Promise.all(
        files.map(async (filePath) => {
            const mod = await import(pathToFileURL(filePath).href);
            const command = mod.default;

            if (command?.data?.name) {
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
                return [`/${command.data.name}`, "🟢 Working"];
            } else {
                return [filePath, "🔴 Missing data"];
            }
        }),
    );

    results.forEach((row) => table.push(row));
    console.log(table.toString());

    client.once(Events.ClientReady, async (c) => {
        try {
            console.log(
                `Started refreshing ${commands.length} application (/) commands.`,
            );
            const data = await rest.put(
                Routes.applicationCommands(c.user.id, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(
                `Successfully reloaded ${data.length} application (/) commands.`,
            );
        } catch (error) {
            console.error(error);
        }
    });
};
