const discord = require("discord.js");
const fs = require("fs");

/**
 * Executes role command on given message
 * @param {discord.Message} message command message
 * @param {String} param command parameter
 * @param {String} args command arguments
 * @param {discord.Client} bot command bot
 */
function process(bot, message, param, args) {
    args = args.split("|")
    switch (param) {
        case "add":
            addRole(message, args, bot);
            break;
        case "remove":
            removeRole(message, args, bot);
            break;
        case "list":
            listRoles(message, args, bot);
            break;
        case "help":
            fs.readFile("./role_help.txt", "utf-8", (err, data) => {
                if (!err)
                    message.channel.send(data);
                else
                    message.channel.send("Oh, quelque chose s'est pas bien passé ...\n```"+err+"```");
            })
            break;
        default:
            message.channel.send("Le paramètre ` "+param+" ` n'est pas reconnu. Fais `!role help` pour afficher l'aide");
            break;
    }
};

/**
 * Adds a new role to message author
 * @param {discord.Message} message 
 * @param {String[]} args 
 * @param {discord.Client} bot 
 */
function addRole(message, args, bot) {
    if (!verifyRoleChannel(message)) return;
    if (args.length < 1) {
        message.channel.send("Tu dois indiquer le nom du role ! Fais `!role help` pour afficher l'aide.");
        return;
    }
    var member_roles = [];
    message.member.roles.cache.forEach(r => member_roles.push(r.name));
    var already_as = false;
    var nom_role = args.join(" ").trim();
    for (let i = 0; i < member_roles.length; i++) {
        already_as = already_as || member_roles[i] == nom_role;
    }
    if (already_as) {
        message.channel.send("Tu as déjà le role ` "+nom_role+" `, inutile de le demander deux fois !");
        return;
    }
    var availables = fs.readFileSync("./roles_list.txt", "utf-8");
    availables = availables.split("\n");
    var possible = false;
    for (let i = 0; i < availables.length; i++) {
        const el = availables[i];
        possible = possible || nom_role == el.trim();
    }
    if (!possible) {
        var roles_list = "";
        for (let i = 0; i < availables.length; i++) {
            const el = availables[i];
            roles_list += "- "+el+"\n";
        }
        message.channel.send("Désolé, mais tu ne peux pas avoir le role ` "+nom_role+" `, les roles disponibles sont:\n```\n"+roles_list+"```");
        return;
    }
    message.member.roles.add(message.member.guild.roles.cache.find(r => {return r.name.trim().toLowerCase() === nom_role})).catch( reason => {
        message.channel.send("Oula, ça c'est pas bien passé !\n```\n"+reason+"```");
    });
    message.channel.send("Niquel, maintenant tu fais parti de la team ` "+nom_role+" ` !");
}

/**
 * print out all the available roles
 * @param {discord.Message} message 
 * @param {String[]} args 
 * @param {discord.Client} bot 
 */
function listRoles(message, args, bot) {
    if (!verifyRoleChannel(message)) return;
    var availables = fs.readFileSync("./roles_list.txt", "utf-8");
    message.channel.send("Voila la liste des roles disponibles:\n```\n"+availables+"```");
    return;
}

/**
 * Adds a new role to message author
 * @param {discord.Message} message 
 * @param {String[]} args 
 * @param {discord.Client} bot 
 */
function removeRole(message, args, bot) {
    if (!verifyRoleChannel(message)) return;
    if (args.length < 1) {
        message.channel.send("Tu dois indiquer le nom du role ! Fais `!role help` pour afficher l'aide.");
        return;
    }
    var member_roles = [];
    message.member.roles.cache.forEach(r => member_roles.push(r.name));
    var already_as = false;
    var nom_role = args.join(" ").trim();
    for (let i = 0; i < member_roles.length; i++) {
        already_as = already_as || member_roles[i].trim().toLowerCase() == nom_role;
    }
    if (!already_as) {
        message.channel.send("Tu n'as pas encore le role ` "+nom_role+" `, inutile de te l'enlever !");
        return;
    }
    message.member.roles.remove(message.member.guild.roles.cache.find(r => {return r.name.trim().toLowerCase() === nom_role})).catch( reason => {
        message.channel.send("Oula, ça c'est pas bien passé !\n```\n"+reason+"```");
    });
    message.channel.send("C'est bon, tu n'as plus le role ` "+nom_role+" ` !");
}

/**
 * Verify if the message is in the right channel
 * @param {discord.Message} message 
 */
function verifyRoleChannel(message) {
    var isRightChannel = message.channel.id === "797445796470718494";
    if (!isRightChannel)
        message.channel.send("Ne demande pas ça ici, t'es fou ! Va plutôt dans <#797445796470718494> :sweat_smile:")
    return isRightChannel;
}

module.exports = {process: process};