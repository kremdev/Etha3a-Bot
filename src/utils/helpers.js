const { REST, Collection, ApplicationCommandType, Events, Routes } = require('discord.js');
const path = require('path');
const Table = require('cli-table3');
const { readdirSync } = require('node:fs');

const EventsTable = new Table({ head: ['Event', 'Status'], colWidths: [30, 20] });
const SlashTable = new Table({ head: ['Command', 'Status'], colWidths: [30, 20] });
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// =======-> Event Handler
/**
 * Loads and registers events from the events folder.
 * @param {Client} client - The Discord client instance.
 */
function EventsHandler(client) {
    const eventDir = path.join(__dirname, '../events');

    // Loop through all event files and register them
    readdirSync(eventDir).forEach((folder) => {
        const eventFiles = readdirSync(path.join(eventDir, folder)).filter((file) => file.endsWith('.js'));
        eventFiles.forEach((file) => {
            const event = require(path.join(eventDir, folder, file));

            if (event.name) {
                const eventHandler = (...args) => event.execute(...args, client);

                if (event.once) {
                    client.once(event.name, eventHandler); // Trigger only once
                } else {
                    client.on(event.name, eventHandler); // Trigger every time
                }

                EventsTable.push([event.name, '🟢 Working']);
            } else {
                EventsTable.push([file, '🔴 Not working']);
            }
        });
    });

    console.log(EventsTable.toString());
}

// =======-> Slash Command Handler
/**
 * Loads and registers slash commands from the commands folder.
 * @param {Client} client - The Discord client instance.
 */
async function SlashCommandEvent(client) {
    const commands = [];
    client.commands = new Collection();
    const commandsDir = path.join(__dirname, '../commands');

    // Loop through all command files and register them
    readdirSync(commandsDir).forEach((folder) => {
        const commandFiles = readdirSync(path.join(commandsDir, folder)).filter((file) => file.endsWith('.js'));
        commandFiles.forEach((file) => {
            const command = require(path.join(commandsDir, folder, file));

            if (command.name && command.description) {
                commands.push({
                    type: ApplicationCommandType.ChatInput,
                    name: command.name,
                    description: command.description,
                    options: command.options || [],
                });

                client.commands.set(command.name, command);
                SlashTable.push([`/${command.name}`, '🟢 Working']);
            } else if (command.data?.name && command.data?.description) {
                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
                SlashTable.push([`/${command.data.name}`, '🟢 Working']);
            } else {
                SlashTable.push([file, '🔴 Not Working']);
            }
        });
    });

    console.log(SlashTable.toString());

    // Once the client is ready, register slash commands
    client.once(Events.ClientReady, async (c) => {
        try {
            const data = await rest.put(Routes.applicationCommands(c.user.id), {
                body: commands,
            });
            console.log(`🟢 | Successfully refreshed ${commands.length} commands. ${data.length} commands reloaded.`);
        } catch (error) {
            console.error('🔴 | Error while refreshing slash commands:', error);
        }
    });
}

// =======-> Initialize the environment
module.exports = {
    /**
     * This function is responsible for initializing the environment and interacting with the `client` object.
     * It connects to the database, handles events, and processes Slash Commands.
     *
     * @param {Client} client - The client object representing the bot.
     */
    handler: async function (client) {
        try {
            // Handle events
            EventsHandler(client);

            // Handle Slash Commands
            SlashCommandEvent(client);
        } catch (error) {
            console.error('Error during initialization: ', error);
            process.exit(1); // Exit the process on failure
        }
    },

    /**
     * Handles all types of errors to ensure the stability of the application.
     */
    isError: function (client) {
        // Handle uncaught exceptions (errors thrown without a try-catch)
        process.on('uncaughtException', (error) => {
            console.error('Uncaught exception in the application: ', error);
            process.exit(1); // Exit the process on critical errors
        });

        // Handle uncaught exception monitor (similar to uncaughtException, but for asynchronous errors)
        process.on('uncaughtExceptionMonitor', (error) => {
            console.error('Uncaught exception monitor triggered: ', error);
        });

        // Handle rejections after they have been handled
        process.on('rejectionHandled', (error) => {
            console.error('Promise rejection handled after an exception: ', error);
        });

        // Handle worker errors (for child processes/workers)
        process.on('worker', (error) => {
            console.error('Worker process error: ', error);
        });

        // Handle SIGTERM (terminate signal, used in many production environments)
        process.on('SIGTERM', () => {
            console.log('Caught SIGTERM (terminate signal)');
            client.destroy(); // Gracefully shutdown the client
            process.exit(0); // Exit the process with success code
        });

        // Gracefully shutting down the bot when the process is terminated
        process.on('SIGINT', () => {
            console.log('🟢 | Gracefully shutting down...');
            client
                .destroy()
                .then(() => {
                    console.log('🟢 | Bot successfully disconnected.');
                    process.exit(0); // Exit the process successfully
                })
                .catch((error) => {
                    console.error('🔴 | Error while shutting down:', error);
                    process.exit(1); // Exit the process with an error code
                });
        });

        // For unhandled promise rejections globally for better debugging
        process.on('unhandledRejection', (error) => {
            console.error('🔴 | Unhandled Promise Rejection:', error);
        });
    },
};
