const discord = require("discord.js");
const fs = require("fs");
const MILLI_TO_HOURS = 3600000;
var taskList = {message: {msgID: null, channelID: null, guildID: null},list: []};

/**
 * Executes agenda command on given message
 * @param {discord.Message} message command message
 * @param {String} param command parameter
 * @param {String} args command arguments
 * @param {discord.Client} bot command bot
 */
function process(bot, message, param, args) {
    args = args.split("|")
    switch (param) {
        case "add":
            addTask(message, args, bot);
            break;
        case "remove":
            removeTask(message, args, bot);
            break;
        case "show":
            updateView(message, bot);
            break;
        case "clear":
            taskList.list = [];
            save();
            updateView(message, bot);
            break;
        case "help":
            fs.readFile("./agenda_help.txt", "utf-8", (err, data) => {
                if (!err)
                    message.channel.send(data)
                    .then( msg => {setTimeout(()=>{msg.delete().catch(reason => {console.log(reason)});}, 20000)} );
                else
                    message.channel.send("Oh, quelque chose s'est pas bien passé ...\n```"+err+"```")
                    .then( msg => {setTimeout(()=>{msg.delete().catch(reason => {console.log(reason)});}, 2000)} );
            })
            break;
        default:
            message.channel.send("Le paramètre ` "+param+" ` n'est pas reconnu. Fais `!agenda help` pour afficher l'aide.")
            .then( msg => {setTimeout(()=>{msg.delete().catch(reason => {console.log(reason)});}, 2000)} );
            break;
    }
    setTimeout(() => {
        message.delete();
    }, 500);
};

/** Saves the agenda */
function save() {
    fs.writeFileSync("./agenda.json", JSON.stringify(taskList));
}
/** Loads the agenda */
function load() {
    var data = "";
    try {
        data = fs.readFileSync("./agenda.json", "utf-8");
    } catch (e) {
        console.log(e)
    }
    if (data != "") taskList = JSON.parse(data);
}

/**
 * Adds a new task to agenda
 * @param {discord.Message} message 
 * @param {String[]} args 
 * @param {discord.Client} bot 
 */
function addTask(message, args, bot) {
    if (args.length < 3) {
        message.channel.send("Il faut me passer 3 arguments `date`, `matière`, `description` ! Fais `!agenda help` pour afficher l'aide.")
        .then( msg => {setTimeout(()=>{msg.delete().catch(reason => {console.log(reason);});}, 2000);});
        return false;
    }
    var date = args[0].trim();
    var matiere = args[1].trim();
    var desc = args[2].trim();

    //check for date format
    if (date.charAt(2) != "/" || date.length != 5) {/*
        //try to get [demain]
        if (date.toLowerCase() == "demain") {
            var d = new Date();
            d.setDate(new Date().getDay()+1);
            var st = d.toISOString().substr(5, 5);
            date = st.charAt(3)+st.charAt(4)+"/"+st.charAt(0)+st.charAt(1);
        }
        else {*/
            message.channel.send("Oh ... t'es sûr que la date est correcte ?")
            .then( msg => {setTimeout(()=>{msg.delete().catch(reason => {console.log(reason);});}, 2000);} );
            return false;
        //}
    }
    //create date object
    var date = {
        day: parseInt(date.substring(0, 2)),
        month: parseInt(date.substring(3, 5))
    }

    //check for matiere
    if (matiere == "") matiere = "Aucune matière";
    //check for description
    if (desc == "") desc = "Aucune description";

    //create and add new task to agenda
    var task = {date: date, matiere: matiere, description: desc};
    taskList.list.push(task);
    save();
    updateView(message, bot);
    return true;
}

/**
 * Remove task from agenda at index
 * @param {discord.Message} message //
 * @param {String[]} args 
 * @param {discord.Client} bot 
 */
function removeTask(message, args, bot) {
    if (args.length < 1) {
        message.channel.send("Il faut me donner un argument `index` ! Fais `!agenda help` pour afficher l'aide")
        .then( msg => {setTimeout(()=>{msg.delete().catch(reason => {console.log(reason)});}, 2000)} );
        return false;
    }
    var index = parseInt(args[0].trim());
    if (isNaN(index)) {
        message.channel.send("Oh ... c'est pas un nombre ça.")
        .then( msg => {setTimeout(()=>{msg.delete().catch(reason => {console.log(reason)});}, 2000)} );
        return false;
    }
    if (index < 0 || index > taskList.list.length-1) {
        message.channel.send("Si tu me donnes un index qui existe, c'est mieux !")
        .then( msg => {setTimeout(()=>{msg.delete().catch(reason => {console.log(reason)});}, 2000)} );
        return false;
    }
    try {
        taskList.list.splice(index, 1);
    } catch (e) {
        message.channel.send("Oh, il y a eu une erreur:\n```"+e+"```")
        .then( msg => {setTimeout(()=>{msg.delete().catch(reason => {console.log(reason)});}, 2000)} );
    }
    save();
    updateView(message, bot);
    return true;
}

/**
 * Setup all variables for Agenda
 */
function initAgenda() {
    load();
    return true;
}

/**
 * Update agenda preview on discord
 * @param {discord.Message} message 
 * @param {discord.Client} bot 
 */
function updateView(message, bot) {
    load();
    var dateList = [];
    var matList = [];
    var descList = [];
    var cur_date = Math.round(new Date().getTime() / MILLI_TO_HOURS);
    var cur_year = new Date().getFullYear();
    for (let i = 0; i < taskList.list.length; i++) {
        const el = taskList.list[i];
        //check if date is valid
        var taskDate = Math.round(new Date( el.date.month+"/"+el.date.day+"/"+cur_year )
                       .getTime() / MILLI_TO_HOURS);
        /*if (cur_date-48 > taskDate) {
            taskList.list.splice(i, 1);
            save();
            continue;
        }*/

        dateList.push(el.date.day.toString()+"/"+el.date.month.toString());
        matList.push(el.matiere);
        descList.push(el.description);
    }
    if (dateList.length < 1)
        dateList = ["\u200b"];
    if (matList.length < 1)
        matList = ["\u200b"]; 
    if (descList.length < 1)
        descList = ["\u200b"];
    if (taskList.message.msgID != null) {
        var server = bot.guilds.cache.get(taskList.message.guildID);
        var channel = server.channels.cache.get(taskList.message.channelID);
        var msg = channel.messages.cache.find(m => {return m.author.id == bot.user.id});
        if (msg != undefined) msg.delete();
    }
    const embed = new discord.MessageEmbed()
    .setColor('#FCBA03')
    .setTitle('Agenda S1B')
    .setThumbnail('https://www.flaticon.com/svg/static/icons/svg/2196/2196561.svg')
    .addFields(
        {name: 'Date', value: dateList, inline: true},
        {name: 'Matière', value: matList, inline: true},
        {name: 'Description', value: descList, inline: true}
    )
    .setFooter('Fais `!agenda help` pour modifier l\'agenda.');
    message.channel.send(embed).then( (m)=>{
        setTimeout(() => {
            taskList.message.msgID = m.channel.lastMessageID;
            taskList.message.channelID = m.channel.id;
            taskList.message.guildID = m.guild.id;
        }, 250);}
    );
}

module.exports = {process: process, load: load, save: save, init: initAgenda, show: updateView};