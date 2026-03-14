import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import Table from "cli-table3";

export default async (client) => {
  const table = new Table({
    head: ["Event", "Status"],
    colWidths: [30, 20],
  });

  const eventsPath = join(process.cwd(), "src/events");
  const files = readdirSync(eventsPath).filter((f) => f.endsWith(".js"));

  await Promise.all(
    files.map(async (file) => {
      const filePath = join(eventsPath, file);
      const mod = await import(pathToFileURL(filePath).href);
      const event = mod.default;

      if (event?.name) {
        client.on(event.name, (...args) => event.execute(...args, client));
        table.push([event.name, "🟢 Working"]);
      } else {
        table.push([file, "🔴 Missing name"]);
      }
    }),
  );

  console.log(table.toString());
};
