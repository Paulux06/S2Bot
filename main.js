const discord = require("discord.js");
const fs = require("fs");
const TOKEN = fs.readFileSync("./token.txt", "utf-8");
var agenda = require("./agenda");
var role = require("./role");
var bot = new discord.Client();

bot.on("ready", () => {
    console.log("bot ready");
    agenda.init();
});

bot.on("message", (message) => {
    if (message.author.id != bot.user.id) {
        if (message.content.startsWith("/r ") && message.member.roles.cache.find(role => role.name.toLowerCase() == 'admin' || role.name.toLowerCase() == 'archiviste')) {
                message.delete();
                return;
        }
        if(message.content.startsWith("!")) {
            var msg = message.content.split(" ");
            var command = msg.splice(0, 1).join(" "); command = command.substr(1, command.length-1);
            var param = msg.splice(0, 1).join(" ");
            var args = msg.join(" ");

            switch (command) {
                case "agenda":
                    agenda.process(bot, message, param, args);
                    break;
                case "role":
                    role.process(bot, message, param, args);
                    break;
                default:
                    break;
            }
        }
    }
});
bot.login(TOKEN);
