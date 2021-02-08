//poll et pas paul mdr        jme deteste
const discord = require("discord.js");
const fs = require("fs");
const channelSondageID = '808397499311849482'
let embedPoll

const agree = "✅";
const disagree = "❌";

function process(bot, message, param, args) {
    const channel = bot.channels.cache.get(channelSondageID);
    let admin = "773887474497880074";
    let goat = "801086479983575042";
    let test = "808400559907274822";
    if (message.member.roles.cache.has(test)) {
        switch (param) {
            case "create":
                embedPoll = new discord.MessageEmbed()
                    .setTitle('😲 Nouveau Sondage 😲')
                    .addField('Question : ', args, true)
                    .setDescription("@everyone sondage")
                    .setColor('YELLOW')
                    .setAuthor(message.author.username,message.author.avatarURL())
                message.react('😄');
                channel.send({
                    embed: embedPoll
                }).then(embedMessage => {
                    embedMessage.react("✅");
                    embedMessage.react("❌");
                });
                setTimeout(() => {
                    message.delete();
                }, 500);
                break;
            case "help":
                embedPoll = new discord.MessageEmbed()
                    .setTitle('🤖 help 🤖')
                    .setDescription("utilisation : !poll <param> <question>\n paramètres disponibles : \nhelp\n create\n auteur : Antonin 🤖")
                    .setColor('DARK_VIVID_PINK')
                message.react('😄');
                message.channel.send(embedPoll);
                setTimeout(() => {
                    message.delete();
                }, 500);
                break;
            case "edit":
                message.channel.messages.fetch({
                        around: args,
                        limit: 1
                    })
                    .then(msg => {
                        const fetchedMsg = msg.first();
                        var author;
                        var txt;
                        fetchedMsg.embeds.forEach((embed) => {
                            author=embed.author;
                            txt=embed.fields;
                            });
                            const reactions = fetchedMsg.reactions.cache;
                            console.log(reactions)
                            const agreeCount = reactions.get(agree).count-1;
                            const disagreeCount = reactions.get(disagree).count-1;
                            const exampleEmbed = new discord.MessageEmbed()
                            .setColor('#32a832')
                            .setTitle('Résultat : '+agreeCount+" "+agree+"  "+disagreeCount+" "+disagree)
                            .setAuthor(author.name, author.iconURL)
                            .addFields({
                                name: txt[0].name,
                                value: txt[0].value
                            })
                            .setTimestamp()
                        fetchedMsg.edit(exampleEmbed);
                    });
                    setTimeout(() => {
                        message.delete();
                    }, 500);
                break;
            default:
                message.channel.send("donne des arguments aussi ¯\\_(ツ)_/¯");

        }
    } else {
        message.channel.send("ET C'EST LE BAN POUR " + message.author.username)
    }
};

module.exports = {
    process: process
};