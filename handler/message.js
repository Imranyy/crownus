
const {
    WASocket,
    proto,
    getContentType,
    downloadContentFromMessage
} = require('@adiwajshing/baileys')
global.axios = require('axios')
    .default
const gis = require("g-i-s");
const {
    PassThrough
} = require('stream')
const yts = require("yt-search")
const {
    exec
} = require("child_process")
const moment = require('moment-timezone')
const Genius = require("genius-lyrics")
const Client = new Genius.Client();
const marika = require("@shineiichijo/marika")
const characterClient = new marika.Character();
const ffmpeg = require('fluent-ffmpeg')
const canvacord = require('canvacord')
const {
    uploadByBuffer,
    uploadByUrl
} = require('telegraph-uploader')
const FormData = require('form-data')
const chalk = require('chalk')
const fs = require('fs')
const {
    writeFile
} = require("fs/promises");
const ms = require("parse-ms");
const wiki = require('wikipedia');
const heartbeats = require('heartbeats');
const sortArray = require('sort-array')
const ytdl = require('ytdl-core')
const TD = require('better-tord');
const name = process.env.NAME || "Crownus"
let mods = process.env.MODS;
if (!mods) {
    mods = "254754423664@s.whatsapp.net";
}
const ownerNumber = mods.split(",");
const {
    Sticker,
    StickerTypes
} = require('wa-sticker-formatter')
const error = 'https://i.imgur.com/TMdJIaW.jpeg'
const {
    Database
} = require('quickmongo');
global.db = new Database(process.env.MONGODB);
var heart = heartbeats.createHeart(5000);

const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

db.on("ready", () => {
    console.log("Connected to the database🍃");
});

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)]
}

module.exports = async (sock, msg) => {
    
    const time = moment()
        .tz('Africa/Nairobi')
        .format('HH:mm:ss')
        .split(":")
    if (msg.key && msg.key.remoteJid === 'status@broadcast') return
    if (!msg.message) return
    
    const type = getContentType(msg.message)
    const quotedType = getContentType(msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) || null
    
    
    const botId = sock.user.id.includes(':') ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : sock.user.id
    
    const from = msg.key.remoteJid
    const body = type == 'conversation' ? msg.message?.conversation : msg.message[type]?.caption || msg.message[type]?.text || ''
    const responseMessage = type == 'listResponseMessage' ? msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId || '' : type == 'buttonsResponseMessage' ? msg.message?.buttonsResponseMessage?.selectedButtonId || '' : ''
    const isGroup = from.endsWith('@g.us')
    
    var sender = isGroup ? msg.key.participant : msg.key.remoteJid
    sender = sender.includes(':') ? sender.split(':')[0] + '@s.whatsapp.net' : sender
    const senderName = msg.pushName
    const senderNumber = sender.split('@')[0]
    
    const groupMetadata = isGroup ? await sock.groupMetadata(from) : null
    const groupName = groupMetadata?.subject || ''
    const groupMembers = groupMetadata?.participants || []
    const groupAdmins = groupMembers.filter((v) => v.admin)
        .map((v) => v.id)
    
    const Crownus = 'https://wa.me/+254754423664';
    const isCmd = body;
    const isGroupAdmins = groupAdmins.includes(sender)
    const isBotGroupAdmins = groupMetadata && groupAdmins.includes(botId)
    const isOwner = ownerNumber.includes(sender)
    const checkInGroup = (m) => {
        let members = [];
        for (let ids of groupMetadata.participants) {
            members.push(ids.id);
        }
        return members.includes(m);
    };
    
    let command = isCmd ? body.slice(1)
        .trim()
        .split(' ')
        .shift()
        .toLowerCase() : ''
    let responseId = msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId || msg.message?.buttonsResponseMessage?.selectedButtonId || null
    let args = body.trim()
        .split(' ')
        .slice(1)
    let text = body.replace(command, '')
        .slice(1)
        .trim()
    const isUser = await db.get(sender) || undefined
    let mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    
    const isImage = type == 'imageMessage'
    const isVideo = type == 'videoMessage'
    const isAudio = type == 'audioMessage'
    const isSticker = type == 'stickerMessage'
    const isContact = type == 'contactMessage'
    const isLocation = type == 'locationMessage'
    
    const isQuoted = type == 'extendedTextMessage'
    const isQuotedImage = isQuoted && quotedType == 'imageMessage'
    const isQuotedVideo = isQuoted && quotedType == 'videoMessage'
    const isQuotedAudio = isQuoted && quotedType == 'audioMessage'
    const isQuotedSticker = isQuoted && quotedType == 'stickerMessage'
    const isQuotedContact = isQuoted && quotedType == 'contactMessage'
    const isQuotedLocation = isQuoted && quotedType == 'locationMessage'
    const antilink = await db.get("antilink") || []
    const nsfw = await db.get("nsfw") || []
    const banned = await db.get('banned') || []
    var mediaType = type
    var stream
    if (isQuotedImage || isQuotedVideo || isQuotedAudio || isQuotedSticker) {
        mediaType = quotedType
        msg.message[mediaType] = msg.message.extendedTextMessage.contextInfo.quotedMessage[mediaType]
        stream = await downloadContentFromMessage(msg.message[mediaType], mediaType.replace('Message', ''))
            .catch(console.error)
    }
    
    if (!isGroup && !isCmd) console.log(color(`[ ${time} ]`, 'white'), color('[ PRIVATE ]', 'aqua'), color(body.slice(0, 50), 'white'), 'from', color(senderNumber, 'yellow'))
    if (isGroup && !isCmd) console.log(color(`[ ${time} ]`, 'white'), color('[  GROUP  ]', 'aqua'), color(body.slice(0, 50), 'white'), 'from', color(senderNumber, 'yellow'), 'in', color(groupName, 'yellow'))
    if (!isGroup && isCmd) console.log(color(`[ ${time} ]`, 'white'), color('[ COMMAND ]', 'aqua'), color(body, 'white'), 'from', color(senderNumber, 'yellow'))
    if (isGroup && isCmd) console.log(color(`[ ${time} ]`, 'white'), color('[ COMMAND ]', 'aqua'), color(body, 'white'), 'from', color(senderNumber, 'yellow'), 'in', color(groupName, 'yellow'))
    
    const reply = async (text) => {
        return sock.sendMessage(from, {
            text: text
        }, {
            quoted: msg
        })
    }
    const bufferToUrl = async (buffer) => {
        const data = await uploadByBuffer(buffer)
        return data
    }
    ///try {
    if (antilink.includes(from) && !isBotGroupAdmins && !isGroupAdmins && body.includes("://chat.whatsapp.com/") && isGroup) {
        const linkThisGroup = `https://chat.whatsapp.com/${await sock.groupInviteCode(from)}`
        if (!body.includes(linkThisGroup)) {
            sock.groupParticipantsUpdate(from, [sender], 'remove')
            reply("Crownus👽\nRemoved successfully")
            return;
        }
    }
    if (body && banned.includes(`${sender}`)) {
        reply(`Crownus👽\nTry next time 👽`)
        return;
    }
    
    const sendFile = async function (jid, path, quoted, options = {}) {
        let mimetype = 'audio/mpeg' 
        let opt = {
            fileName: options.fileName || '',
            ...options
        }
        if (options.audio) opt['audio'] = Buffer.isBuffer(path) ? {
            buffer: path,
            mimetype
        } : {
            url: path,
            mimetype
        }
        if (options.document) opt['document'] = Buffer.isBuffer(path) ? {
            buffer: path,
            mimetype: options.mimetype
        } : {
            url: path,
            mimetype: options.mimetype
        }
        if (options.image) opt['image'] = Buffer.isBuffer(path) ? {
            buffer: path,
            mimetype: options.mimetype
        } : {
            url: path,
            mimetype: options.mimetype
        }
        await sock.sendMessage(jid, opt, {
                quoted
            })
            .then(() => {
                try {
                    let {
                        size
                    } = fs.statSync(path)
                    statistics('filesize', size)
                    if (options.unlink) {
                        console.log('unlink');
                        fs.unlinkSync(path)
                    }
                } catch (error) {
                    console.log(error);
                }
            })
    }
    if (command) {
        let xp = Math.floor(Math.random() * 10) + 1
        await db.add(`${sender}.Xp`, xp)
        const reactionMessage = {
            react: {
                text: `👽`,
                key: msg.key,
            },
        };
        await sock.sendMessage(from, reactionMessage);
    }
    switch (command) {
    case 'hi': {
        let xp = await db.get(`${sender}.Xp`)
        console.log(xp)
        reply(`Hey ${senderName}| Xp: ${xp}`)
    }
    break
    case "upload": {
        try {
            if (isImage || isQuotedImage) {
                let downloadFilePath;
                if (msg.message.imageMessage) {
                    downloadFilePath = msg.message.imageMessage;
                } else {
                    //tagged image
                    downloadFilePath =
                        msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
                }
                //for images
                const stream = await downloadContentFromMessage(downloadFilePath, "image");
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                image = await bufferToUrl(buffer)
                
            } else if (isVideo || isQuotedVideo) {
                //for videos
                let downloadFilePath;
                if (msg.message.videoMessage) {
                    downloadFilePath = msg.message.videoMessage;
                } else {
                    downloadFilePath =
                        msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;
                }
                const stream = await downloadContentFromMessage(downloadFilePath, "video");
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                image = await bufferToUrl(buffer)
            } else {
                reply("Crownus👽\nGive a media to convert into sticker👽");
                return;
            }
            reply(image.link)
        } catch (e) {
            reply(e.toString())
        }
    }
    break
    case "google": {
        if (!text) {
            reply('👽 Provide a search term!')
            return;
        }
        let {
            data
        } = await axios.get(`https://www.googleapis.com/customsearch/v1?q=${text}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`)
        if (data.items.length == 0) {
            reply("Unable to find any result 👽")
            return;
        }
        let tex = `GOOGLE SEARCH 👽\n🔍 Term ~> ${text}\n\n`;
        for (let i = 0; i < data.items.length; i++) {
            tex += `🪧 Title ~> ${data.items[i].title}\n🖥 Description ~> ${data.items[i].snippet}\n🌐 Link ~> ${data.items[i].link}\n\n`
        }
        reply(tex)
        return;
        
    }
    break
    case "githubsearch":
    case "github": {
        if (!text) {
            reply('👽 Provide a search term!')
            return;
        }
        let {
            data: repo
        } = await axios.get(`https://api.github.com/search/repositories?q=${text}`)
        if (repo.items.length == 0) {
            reply("Unable to find any result 👽")
            return;
        }
        let tex = `GITHUB SEARCH👽 \n🔍 Term ~> ${text}\n\n`;
        for (let i = 0; i < repo.items.length; i++) {
            tex += `🪧 Name ~> ${repo.items[i].name}\n👤 Watchers ~> ${repo.items[i].watchers_count}\n⭐️ Stars ~> ${repo.items[i].stargazers_count}\n📛 Forks ~> ${repo.items[i].forks_count}\n🖥 Description ~> ${repo.items[i].description}\n🌐 Link ~> ${repo.items[i].html_url}\n\n`
        }
        reply(tex)
        return;
        
    }
    break
    case "neko": {
        try {
            const {
                data
            } = await axios.get("https://nekos.life/api/v2/img/neko");
            await sock.sendMessage(from, {
                image: {
                    url: data.url
                },
                caption: "Your neko here."
            }, {
                quoted: msg
            });
        } catch (e) {
            await sock.sendMessage(from, {
                text: `Something bad happend\n${e.message}`
            }, {
                quoted: msg
            });
        }
        
    }
    break
    case "waifu": {
        try {
            const {
                data
            } = await axios.get("https://nekos.life/api/v2/img/waifu");
            await sock.sendMessage(from, {
                image: {
                    url: data.url
                },
                caption: "Your waifu here."
            }, {
                quoted: msg
            });
        } catch (e) {
            await sock.sendMessage(from, {
                text: `Crownus👽\nSomething bad happend\n${e.message}`
            }, {
                quoted: msg
            });
        }
        
    }
    break
    case "dare": {
        let dare = TD.get_dare();
        reply(dare);
    }
    break
    case "truth": {
        let truth = TD.get_truth();
        reply(truth);
    }
    break
    case "sc":
    case "sadcat": {
        if (!text) {
            reply('👽 Provide a the text!')
            return;
        }
        const response = await axios.get(`https://api.popcat.xyz/sadcat?text=${text}`, {
            responseType: 'arraybuffer'
        })
        const buffer = Buffer.from(response.data, "utf-8")
        try {
            await sock.sendMessage(from, {
                image: buffer,
                caption: "Crownus👽"
            }, {
                quoted: msg
            });
        } catch (e) {
            await sock.sendMessage(from, {
                text: `Crownus👽\nSomething is not right\n${e.message}`
            }, {
                quoted: msg
            });
        }
    }
    break
    case 'lyrics': {
        if (!text) {
            reply('👽 Provide a the search term!')
            return;
        }
        try {
            const search = await Client.songs.search(text);
            //if (!search.length == 0) {
            //reply(`No lyrics found for ${text}`);
            //return;
            //}
            const Song = search[0];
            const lyrics = await Song.lyrics();
            reply(lyrics);
        } catch (error) {
            reply(`No lyrics found for ${text}`);
            console.log(error);
        }
    }
    break
    case 'del':
    case 'delete': {
        if (!msg.message.extendedTextMessage) {
            reply("👽 Tag message to delete.");
            return;
        }
        
        //bot message, anyone can delete
        if (msg.message.extendedTextMessage.contextInfo.participant == botId) {
            const options = {
                remoteJid: botId,
                fromMe: true,
                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
            };
            await sock.sendMessage(from, {
                delete: options,
            });
            return;
        } else {
            reply("👽 Only bot message can be delete.");
        }
    }
    break
    case 'cry':
    case 'kiss':
    case 'bully':
    case 'hug':
    case 'lick':
    case 'cuddle':
    case 'pat':
    case 'smug':
    case 'highfive':
    case 'bonk':
    case 'yeet':
    case 'blush':
    case 'wave':
    case 'smile':
    case 'handhold':
    case 'nom':
    case 'bite':
    case 'glomp':
    case 'kill':
    case 'slap':
    case 'cringe':
    case 'kick':
    case 'wink':
    case 'happy':
    case 'poke':
    case 'punch':
    case 'dance': {
        const Reactions = {
            cry: 'Cried with',
            kiss: 'Kissed',
            punch: 'punched',
            bully: 'Bullied',
            hug: 'Hugged',
            lick: 'Licked',
            cuddle: 'Cuddled with',
            pat: 'Patted',
            smug: 'Smugged at',
            highfive: 'High-fived',
            bonk: 'Bonked',
            yeet: 'Yeeted',
            blush: 'Blushed at',
            wave: 'Waved at',
            smile: 'Smiled at',
            handhold: 'is Holding Hands with',
            nom: 'is Eating with',
            bite: 'Bit',
            glomp: 'Glomped',
            kill: 'Killed',
            slap: 'Slapped',
            cringe: 'Cringed at',
            kick: 'Kicked',
            wink: 'Winked at',
            happy: 'is Happy with',
            poke: 'Poked',
            dance: 'is Dancing with'
        }
        let {
            data: gi
        } = await axios.get(`https://g.tenor.com/v1/search?q=${command}&key=LIVDSRZULELA&limit=8`)
        arr = []
        arr.push(sender)
        try {
            user2 = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            user2 = sender
        }
        arr.push(user2)
        let rec = `@${sender.split("@")[0]} ${Reactions[command]} @${user2.split("@")[0]}`
        sock.sendMessage(from, {
            video: {
                url: gi.results?.[Math.floor(Math.random() * gi.results.length)]?.media[0]?.mp4?.url
            },
            caption: rec,
            gifPlayback: true,
            mentions: arr
        }, {
            quoted: msg
        })
        
    }
    break
    case 'sticker':
    case 's': {
        if (text) {
            anu = text.split('|')
            packName = anu[0] !== '' ? anu[0] : "Crownus👽"
            authorName = anu[1] !== '' ? anu[1] : "Crownus👽"
        } else {
            packName = "Crownus👽";
            authorName = "Crownus👽";
        }
        const getRandom = (ext) => {
            return `${Math.floor(Math.random() * 10000)}${ext}`;
        };
        const stickerFileName = getRandom(".webp");
        let stickerMake;
        //for image
        if (isImage || isQuotedImage) {
            let downloadFilePath;
            if (msg.message.imageMessage) {
                downloadFilePath = msg.message.imageMessage;
            } else {
                //tagged image
                downloadFilePath =
                    msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            }
            //for images
            const stream = await downloadContentFromMessage(downloadFilePath, "image");
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            stickerMake = new Sticker(buffer, {
                pack: packName,
                author: authorName,
                type: args.includes("--crop") || args.includes("--c") ?
                    StickerTypes.CROPPED : StickerTypes.FULL,
                quality: 100,
            });
        } else if (isVideo || isQuotedVideo) {
            //for videos
            let downloadFilePath;
            if (msg.message.videoMessage) {
                downloadFilePath = msg.message.videoMessage;
            } else {
                downloadFilePath =
                    msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;
            }
            const stream = await downloadContentFromMessage(downloadFilePath, "video");
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            stickerMake = new Sticker(buffer, {
                pack: packName, // The pack name
                author: authorName, // The author name
                type: args.includes("crop") || args.includes("c") ?
                    StickerTypes.CROPPED : StickerTypes.FULL,
                quality: 40,
            });
        } else {
            reply("👽 Give a media to convert into sticker!");
            return;
        }
        
        await stickerMake.toFile(stickerFileName);
        await sock.sendMessage(
            from, {
                sticker: fs.readFileSync(stickerFileName),
            }, {
                quoted: msg
            }
        );
        try {
            fs.unlinkSync(stickerFileName);
        } catch {
            console.log("error in deleting file.");
        }
    }
    break
    case 'image': {
        if (!isQuoted) {
            reply("👽 Give a sticker to convert into media!");
            return;
        }
        const getRandom = (ext) => {
            return `${Math.floor(Math.random() * 10000)}${ext}`;
        };
        if ((isSticker && !msg.message.stickerMessage.isAnimated) || isQuotedSticker) {
            let downloadFilePath;
            if (msg.message.stickerMessage) {
                downloadFilePath = msg.message.stickerMessage;
            } else {
                downloadFilePath =
                    msg.message.extendedTextMessage.contextInfo.quotedMessage
                    .stickerMessage;
            }
            const stream = await downloadContentFromMessage(downloadFilePath, "image");
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            const media = getRandom(".jpeg");
            await writeFile(media, buffer);
            
            sock.sendMessage(
                from, {
                    image: fs.readFileSync(media),
                }, {
                    mimetype: "image/png",
                    quoted: msg,
                }
            );
            
            fs.unlinkSync(media);
        } else {
            reply(
                "👽 There is some problem!\nTag a non-animated sticker with command to convert to Image!"
            );
        }
    }
    break
    case "imagesearch":
    case "img": {
        if (!text) {
            reply('👽 Provide a search term!')
            return;
        }
        try {
            if (!text) {
                let message = `👽 Query is not given! \nSend ${prefix}is query`;
                reply(message);
                return;
            }
            
            let name = text;
            
            gis(name, (error, results) => {
                if (error) {
                    console.log(error);
                    reply(error);
                } else {
                    let index = 0;
                    if (results.length >= 10) {
                        index = Math.floor(Math.random() * 10);
                    }
                    let img = results[index]["url"];
                    console.log(img);
                    
                    try {
                        sock.sendMessage(
                            from, {
                                image: {
                                    url: img
                                },
                                caption: "Crownus👽"
                            }, {
                                quoted: msg
                            }
                        );
                    } catch (err) {
                        console.log(err)
                        reply("👽 Error in search!");
                    }
                }
            });
        } catch (e) {
            await sock.sendMessage(from, {
                text: `Something bad happend\n${e.message}`
            }, {
                quoted: msg
            });
        }
    }
    break
    case 'steal':
    case 'take': {
        if (isQuotedSticker) {
            let downloadFilePath =
                msg.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage;
            const stream = await downloadContentFromMessage(
                downloadFilePath,
                "sticker"
            );
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            if (text) {
                anu = text.split('|')
                packName = anu[0] !== '' ? anu[0] : "Crownus👽"
                authorName = anu[1] !== '' ? anu[1] : "Crownus👽"
            } else {
                packName = "Crownus👽";
                authorName = "Crownus👽";
            }
            
            const sticker = new Sticker(buffer, {
                pack: packName,
                author: authorName,
                type: StickerTypes.DEFAULT,
                quality: 100,
            });
            await sock.sendMessage(from, await sticker.toMessage(), {
                quoted: msg
            });
            return;
        } else {
            reply("Crownus👽\n Tag a sticker!");
            return;
        }
    }
    break
    case 'ytsearch':
    case 'yts': {
        if (!text) {
            reply('Crownus👽\n Provide a search term!')
            return;
        }
        const term = text;
        const {
            videos
        } = await yts(term);
        if (!videos || videos.length <= 0) {
            reply(`Crownus👽\n Can't find a match : *${term}*!!`)
            return;
        }
        const length = videos.length < 10 ? videos.length : 10;
        let tex = `YOUTUBE SEARCH 👽\n🔍 Term ~> ${term}\n\n`;
        for (let i = 0; i < length; i++) {
            tex += `🌐 Link ~> ${videos[i].url}\n👤 Channel ~> ${videos[i].author.name}\n🖥 Title ~> ${videos[i].title}\n\n`;
        }
        reply(tex)
        return;
    }
    break
    case 'play': {
        if (!text) {
            reply('Crownus👽\n Provide a search term!')
            return;
        }
        try {
            const {
                videos
            } = await yts(text);
            if (!videos || videos.length <= 0) {
                reply(`Crownus👽\n Can't find a match : *${args[0]}*!!`)
                return;
            }
            let urlYt = videos[0].url
            let infoYt = await ytdl.getInfo(urlYt);
            //30 MIN
            if (infoYt.videoDetails.lengthSeconds >= 1800) {
                reply(`Crownus👽\n Audio is too big!`);
                return;
            }
            const getRandom = (ext) => {
                return `${Math.floor(Math.random() * 10000)}${ext}`;
            };
            let titleYt = infoYt.videoDetails.title;
            let randomName = getRandom(".mp3");
            const stream = ytdl(urlYt, {
                    filter: (info) => info.audioBitrate == 160 || info.audioBitrate == 128,
                })
                .pipe(fs.createWriteStream(`./${randomName}`));
            console.log("Audio downloading ->", urlYt);
            await new Promise((resolve, reject) => {
                stream.on("error", reject);
                stream.on("finish", resolve);
            });
            
            let stats = fs.statSync(`./${randomName}`);
            let fileSizeInBytes = stats.size;
            // Convert the file size to megabytes (optional)
            let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
            console.log("Audio downloaded ! Size: " + fileSizeInMegabytes);
            if (fileSizeInMegabytes <= 40) {
                //sendFile(from, fs.readFileSync(`./${randomName}`), msg, { audio: true, jpegThumbnail: (await getBuffer(dl.meta.image)).buffer, unlink: true })
                await sock.sendMessage(
                    from, {
                        document: fs.readFileSync(`./${randomName}`),
                        mimetype: "audio/mpeg",
                        fileName: titleYt + ".mp3",
                    }, {
                        quoted: msg
                    }
                );
            } else {
                reply(`Crownus👽\n File size bigger than 40mb.`);
            }
            fs.unlinkSync(`./${randomName}`);
        } catch (e) {
            reply(e.toString())
        }
    }
    break
    case "ship": {
        arr = []
        const percentage = Math.floor(Math.random() * 100)
        let sentence
        if (percentage < 25) {
            sentence = `\t\t\t\t\t*ShipCent : ${percentage}%* \n\t\tThere's still time to reconsider your choices`
        } else if (percentage < 50) {
            sentence = `\t\t\t\t\t*ShipCent : ${percentage}%* \n\t\t Good enough, I guess! 💫`
        } else if (percentage < 75) {
            sentence = `\t\t\t\t\t*ShipCent : ${percentage}%* \n\t\t\tStay together and you'll find a way ⭐️`
        } else if (percentage < 90) {
            sentence = `\t\t\t\t\t*ShipCent : ${percentage}%* \n\tAmazing! You two will be a good couple 💖 `
        } else {
            sentence = `\t\t\t\t\t*ShipCent : ${percentage}%* \n\tYou two are fated to be together 💙`
        }
        try {
            user2 = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            user2 = sender
        }
        arr.push(sender)
        arr.push(user2)
        let caption = `\t👽*Matchmaking...*👽 \n`
        caption += `\t\t---------------------------------\n`
        caption += `@${sender.split('@')[0]}  x  @${user2.split('@')[0]}\n`
        caption += `\t\t---------------------------------\n`
        caption += `${sentence}`
        await sock.sendMessage(from, {
            text: caption,
            mentions: arr
        }, {
            quoted: msg
        })
        
    }
    break
    
    case 'ytmp4':
    case 'ytvideo':
    case 'ytv':
        const getRandom = (ext) => {
            return `${Math.floor(Math.random() * 10000)}${ext}`;
        };
        if (args.length === 0) {
            reply(`Crownus👽\n URL is empty! \nSend ${prefix}ytv url`);
            return;
        }
        try {
            let urlYt = args[0];
            if (!urlYt.startsWith("http")) {
                reply(`Crownus👽\n Give youtube link!`);
                return;
            }
            let infoYt = await ytdl.getInfo(urlYt);
            //30 MIN
            if (infoYt.videoDetails.lengthSeconds >= 1800) {
                reply(`Crownus👽\n Video file too big!`);
                return;
            }
            let titleYt = infoYt.videoDetails.title;
            let randomName = getRandom(".mp4");
            
            const stream = ytdl(urlYt, {
                    filter: (info) => info.itag == 22 || info.itag == 18,
                })
                .pipe(fs.createWriteStream(`./${randomName}`));
            console.log("Video downloading ->", urlYt);
            await new Promise((resolve, reject) => {
                stream.on("error", reject);
                stream.on("finish", resolve);
            });
            
            let stats = fs.statSync(`./${randomName}`);
            let fileSizeInBytes = stats.size;
            // Convert the file size to megabytes (optional)
            let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
            console.log("Video downloaded ! Size: " + fileSizeInMegabytes);
            if (fileSizeInMegabytes <= 100) {
                sock.sendMessage(
                    from, {
                        video: fs.readFileSync(`./${randomName}`),
                        caption: `${titleYt}`,
                    }, {
                        quoted: msg
                    }
                );
            } else {
                reply(`Crownus👽\n File size bigger than 40mb.`);
            }
            
            fs.unlinkSync(`./${randomName}`);
        } catch (e) {
            reply(e.toString())
        }
        break
    case 'ytmp3':
    case 'ytaudio':
    case 'yta': {
        const getRandom = (ext) => {
            return `${Math.floor(Math.random() * 10000)}${ext}`;
        };
        if (args.length === 0) {
            reply(`Crownus👽\n URL is empty! \nSend ${prefix}yta url`);
            return;
        }
        try {
            let urlYt = args[0];
            if (!urlYt.startsWith("http")) {
                reply(`Crownus👽\n Give youtube link!`);
                return;
            }
            let infoYt = await ytdl.getInfo(urlYt);
            //30 MIN
            if (infoYt.videoDetails.lengthSeconds >= 1800) {
                reply(`Crownus👽\n Video too big!`);
                return;
            }
            let titleYt = infoYt.videoDetails.title;
            let randomName = getRandom(".mp3");
            const stream = ytdl(urlYt, {
                    filter: (info) => info.audioBitrate == 160 || info.audioBitrate == 128,
                })
                .pipe(fs.createWriteStream(`./${randomName}`));
            console.log("Audio downloading ->", urlYt);
            // reply("Downloading.. This may take upto 5 min!");
            await new Promise((resolve, reject) => {
                stream.on("error", reject);
                stream.on("finish", resolve);
            });
            
            let stats = fs.statSync(`./${randomName}`);
            let fileSizeInBytes = stats.size;
            // Convert the file size to megabytes (optional)
            let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
            console.log("Audio downloaded ! Size: " + fileSizeInMegabytes);
            if (fileSizeInMegabytes <= 40) {
                //sendFile(from, fs.readFileSync(`./${randomName}`), msg, { audio: true, jpegThumbnail: (await getBuffer(dl.meta.image)).buffer, unlink: true })
                await sock.sendMessage(
                    from, {
                        document: fs.readFileSync(`./${randomName}`),
                        mimetype: "audio/mpeg",
                        fileName: titleYt + ".mp3",
                    }, {
                        quoted: msg
                    }
                );
            } else {
                reply(`Crownus👽\n File size bigger than 40mb.`);
            }
            fs.unlinkSync(`./${randomName}`);
        } catch (e) {
            reply(e.toString())
        }
    }
    break
    case "remove": {
        if (!isGroupAdmins) return reply('Crownus👽\nIts an admin command')
        if (!isBotGroupAdmins) return reply('Crownus👽\nBot is not admin')
        try {
            user = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            reply("Crownus👽\nPlease tag the user")
            return;
        }
        await sock.groupParticipantsUpdate(
            from,
                [user],
            "remove"
        );
        return reply("Crownus👽\n Number removed from group!");
        
    }
    break
    case "antilink": {
        if (!text) return reply('Crownus👽\nPlease put the option name')
        if (!isGroupAdmins) return reply('Crownus👽\nIts an admin command')
        if (!isBotGroupAdmins) return reply('Crownus👽\nBot is not admin')
        switch (text) {
        case "on": {
            let its = await db.get('antilink') || []
            
            if (its.includes(from)) return reply("Crownus👽\nAlready registered")
            await db.push('antilink', from)
            return reply('Crownus👽\nAntilink has been register!')
        }
        break
        case "off": {
            let its = await db.get('antilink') || []
            if (!its.includes(from)) return reply('Already off')
            await db.pull('antilink', from)
            return reply("Crownus👽\nAntilink has been trurned off here")
        }
        break
        default:
            reply(`Crownus👽\nNo such option please choose between [ on / off ]`)
            return;
        }
    }
    break
    case "event": {
        if (!text) return reply('Crownus👽\nPlease put the option name')
        if (!isGroupAdmins) return reply('Crownus👽\nIts an admin command')
        switch (text) {
        case "on": {
            let its = await db.get('event') || []
            
            if (its.includes(from)) return reply("Crownus👽\nAlready registered")
            await db.push('event', from)
            return reply('Crownus👽\nEvent has been register!')
        }
        break
        case "off": {
            let its = await db.get('event') || []
            if (!its.includes(from)) return reply('Crownus👽\nAlrady off')
            await db.pull('event', from)
            return reply("Crownus👽\nEvent has been turned off here")
        }
        break
        default:
            reply(`Crownus👽\nNo such option please choose between [ on / off ]`)
            return;
        }
    }
    break
    case "ban": {
        if (!isOwner) {
            reply("Crownus👽\nFor Owner only !")
            return;
        }
        arr = []
        try {
            user = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            reply("Crownus👽\nPlease tag the user")
            return;
        }
        arr.push(user)
        let ban = await db.get('banned') || []
        
        if (ban.includes(user)) return reply("Crownus👽\nAlready banned")
        await db.push('banned', user)
        await sock.sendMessage(from, {
            text: `Crownus👽\nSuccesfully banned @${user.split("@")[0]}`,
            mentions: arr
        }, {
            quoted: msg
        })
    }
    break
    case "unban": {
        if (!isOwner) {
            reply("Crownus👽\nOwner only")
            return;
        }
        arr = []
        try {
            user = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            reply("Crownus👽\nPlease tag the user")
            return;
        }
        arr.push(user)
        let ban = await db.get('banned') || []
        
        if (!ban.includes(user)) return reply("Crownus👽\nNot banned")
        await db.pull('banned', user)
        await sock.sendMessage(from, {
            text: `Crownus👽\nSuccesfully unbanned @${user.split("@")[0]}`,
            mentions: arr
        }, {
            quoted: msg
        })
    }
    break
    case 'fact': {
        await axios
            .get(`https://nekos.life/api/v2/fact`)
            .then((response) => {
                // console.log(response);
                const tet = `📛Fact:~> ${response.data.fact}`
                reply(tet)
            })
            .catch((err) => {
                reply(`Crownus👽\n  An error occurred, \n Please report that command to \n Rongo University students developers club.`)
            })
    }
    break
    case 'advice': {
        await axios
            .get(`https://api.adviceslip.com/advice`)
            .then((response) => {
                // console.log(response);
                const tet = `Advice for you:~> ${response.data.slip.advice}`
                reply(tet)
            })
            .catch((err) => {
                reply(`🔍 Error: ${err}`)
            })
    }
    break
    case 'getgif':
    case 'gify': {
        if (!text) return reply("Crownus👽\n No query provided!")
        try {
            let {
                data: gi
            } = await axios.get(`https://g.tenor.com/v1/search?q=${text}&key=LIVDSRZULELA&limit=8`)
            sock.sendMessage(from, {
                video: {
                    url: gi.results?.[Math.floor(Math.random() * gi.results.length)]?.media[0]?.mp4?.url
                },
                caption: "Crownus👽\nHere you go",
                gifPlayback: true
            }, {
                quoted: msg
            })
        } catch (err) {
            reply("Couldn't find")
            console.log(err)
        }
        
    }
    
    break
    case "nsfw": {
        if (!text) return reply('Crownus👽\nPlease put the option name')
        if (!isGroupAdmins) return reply('Crownus👽\nIts an admin command')
        switch (text) {
        case "on": {
            let its = await db.get('nsfw') || []
            
            if (its.includes(from)) return reply("Crownus👽\nAlrady registered")
            await db.push('nsfw', from)
            return reply('Crownus👽\nNSFW has been register!')
        }
        break
        case "off": {
            let its = await db.get('nsfw') || []
            if (!its.includes(from)) return reply('Alrady off')
            await db.pull('nsfw', from)
            return reply("Crownus👽\nNSFW has been trurned off here")
        }
        break
        default:
            reply(`Crownus👽\nNo such option please choose between [ on / off ]`)
            return;
        }
    }
    break
    case 'wiki':
    case 'wikipedia': {
        try {
            if (!text) return reply(`Crownus👽\nProvide the term to search, e.g *Rongo university* `)
            const con = await wiki.summary(text);
            const tex = `Title:~> ${con.title}
                  
Desc:~> ${con.description}

Summary:~> ${con.extract}

URL:~> ${con.content_urls.mobile.page}
        `
            reply(tex)
        } catch (err) {
            console.log(err)
            return reply(`Crownus👽\n Your text isn't valid`)
        }
    }
    break
    case "ping": {
        console.log(groupAdmins)
        if (!text || !(text == "--admin")) {
            if (!isGroupAdmins) return reply('Its an admin command')
            let mention = []
            let result = `*${groupName}-Members pinged by ${senderName}*\n\n`
            for (let i = 0; i < groupMembers.length; i++) {
                let no = i + 1
                result += `➼ ${no}| @${groupMembers[i].id.split("@")[0]}\n`
                mention.push(groupMembers[i].id)
            }
            await sock.sendMessage(from, {
                text: result,
                mentions: mention
            }, {
                quoted: msg
            })
        } else if (text == "--admin") {
            let mention = []
            let result = `*${groupName}-Members pinged only admins by ${senderName}*\n\n`
            for (let i = 0; i < groupAdmins.length; i++) {
                let no = i + 1
                result += `➼ ${no}| @${groupAdmins[i].split("@")[0]}\n`
                mention.push(groupAdmins[i])
            }
            await sock.sendMessage(from, {
                text: result,
                mentions: mention
            }, {
                quoted: msg
            })
        }
    }
    break
    case "leaderboard":
    case "lb": {
        if ((groupMembers.length - 10) < 0) return reply("Crownus👽\nSorry leaderboard is not possible in less then 10 members group")
        let arr = []
        let mention = []
        for (let i = 0; i < groupMembers.length; i++) {
            let exp = await db.get(`${groupMembers[i].id}.Xp`) || 0
            let obj = {
                id: groupMembers[i].id,
                xp: exp
            }
            arr.push(obj)
        }
        console.log(arr)
        let res = sortArray(arr, {
            by: 'xp',
            order: 'desc'
        })
        let result = `LEADERBOARD👽\n🌐 Type ~> Experience\n\n`
        for (let i = 0; i < 10; i++) {
            mention.push(arr[i].id)
            let character = await db.get(`${arr[i].id}.marry`) || "None"
            let no = i + 1
            result += `👤 Person ~> @${arr[i].id.split("@")[0]}\n🪧 Place ~> ${no}\n🖥 Experience ~> ${arr[i].xp}\n\n`
        }
        //reply(result)
        await sock.sendMessage(from, {
            text: result,
            mentions: mention
        }, {
            quoted: msg
        })
        
    }
    break
    case "anime": {
        if (!text) return reply("Crownus👽\nPlease provite the anime name")
        const {
            data
        } = await axios.get(
                `https://api.jikan.moe/v4/anime?q=${text}`
            )
            .catch((err) => {
                return reply("Crownus👽\nCrownus👽\nUnable to find the anime")
            });
        results = ""
        for (let i = 0; i < data.data.length; i++) {
            results += `📗Name: ${data.data[i].title}\n📘Airing: ${data.data[i].title}\n↝More Info: ${prefix}aid ${data.data[i].mal_id}\n\n`
        }
        return sock.sendMessage(from, {
            image: {
                url: data.data[0].images.jpg.image_url
            },
            caption: results
        }, {
            quoted: msg
        })
    }
    break
    case "aid": {
        if (!args[0]) {
            reply("Crownus👽\nPlease provide the ID")
            return;
        }
        if (isNaN(args[0])) {
            reply("Crownus👽\nPlease provide the ID")
            return;
        }
        if (args[0].includes("-") || args[0].includes("+")) {
            reply("Crownus👽\nPlease provide the ID")
            return;
        }
        const {
            data
        } = await axios.get(
                `https://api.jikan.moe/v4/anime/${args[0]}/full`
            )
            .catch((err) => {
                return reply("Crownus👽\nUnable to find the anime")
            });
        let txt = `*${data.data.title}*

*Title En:* ${data.data.title_english}
*Title Jp:* ${data.data.title_japanese}
*Type:* ${data.data.type}
*Source:* ${data.data.source}
*Status:* ${data.data.status}
*Airing:* ${data.data.airing}
*Aired:* ${data.data.aired.from}
*Duration:* ${data.data.duration}
*Rating:* ${data.data.rating}
*Score:* ★${data.data.score}
*Rank:* ${data.data.rank}
*Popularity:* ${data.data.popularity}
*Members:* ${data.data.members}

*Synopsis:* ${data.data.synopsis}

🌐 *Link:* ${data.data.url}
`
        return sock.sendMessage(from, {
            image: {
                url: data.data.images.jpg.large_image_url
            },
            caption: txt
        }, {
            quoted: msg
        })
        
    }
    break
    case "character": {
        if (!text) return reply("Please provite the character name")
        const {
            data: chara
        } = await axios
            .get(`https://api.jikan.moe/v4/characters?q=${text}`)
            .catch((err) => {
                return reply(`Crownus👽\nCouldn't find any matching character.`);
            });
        
        let txt = "";
        for (let i = 0; i < chara.data.length; i++) {
            txt += `📗Name: ${chara.data[i].name}\n📘URL: ${chara.data[i].url}\n↝More Info: ${prefix}charid ${chara.data[i].mal_id}\n\n`;
        }
        return sock.sendMessage(from, {
            image: {
                url: chara.data[0].images.jpg.image_url
            },
            caption: txt
        }, {
            quoted: msg
        })
    }
    break
    case "charid": {
        if (!args[0]) {
            reply("Crownus👽\nPlease provide the ID")
            return;
        }
        if (isNaN(args[0])) {
            reply("Crownus👽\nPlease provide the ID")
            return;
        }
        if (args[0].includes("-") || args[0].includes("+")) {
            reply("Crownus👽\nPlease provide the ID")
            return;
        }
        const {
            data
        } = await axios
            .get(`https://api.jikan.moe/v4/characters/${args[0]}/full`)
            .catch((err) => {
                return reply(`Crownus👽\nCouldn't find any character id.`);
            });
        
        let txt = `*${data.data.name}*\n\n`;
        txt += `*Name:* ${data.data.name}\n`;
        txt += `*Kanji name:* ${data.data.name_kanji}\n`;
        txt += `*Nicknames:* ${data.data.nicknames.join(", ")}\n`;
        txt += `*Favorites:* ${data.data.favorites}\n\n`;
        txt += `*Description:* ${data.data.about}\n`
        txt += `🌐 *URL:* ${data.data.url}\n\n`;
        return sock.sendMessage(from, {
            image: {
                url: data.data.images.jpg.image_url
            },
            caption: txt
        }, {
            quoted: msg
        })
        
    }
    break
    case "haigusha": {
        try {
            let data = await characterClient.getRandomCharacter();
            
            let txt = `*${data.name}*\n\n`;
            txt += `*Name:* ${data.name}\n*Mal_ID:* ${data.mal_id}\n`;
            txt += `*Kanji name:* ${data.name_kanji}\n`;
            txt += `*Nicknames:* ${data.nicknames.join(", ")}\n`;
            txt += `*Favorites:* ${data.favorites}\n\n`;
            txt += `*Description:* ${data.about}\n`
            txt += `🌐 *URL:* ${data.url}\n\n`;
            return sock.sendMessage(from, {
                image: {
                    url: data.images.jpg.image_url
                },
                caption: txt
            }, {
                quoted: msg
            })
        } catch (e) {
            reply(e.toString())
        }
        
    }
    break
    case "open": {
        if (!isGroupAdmins) return reply('Crownus👽\nIts an admin command')
        if (!isBotGroupAdmins) return reply('Crownus👽\nBot is not admin')
        if (!groupMetadata) return reply('Crownus👽\nTry Again!')
        const {
            announce
        } = await sock.groupMetadata(from)
        if (!announce) return reply('Already opened!')
        await sock.groupSettingUpdate(from, 'not_announcement')
        reply("Crownus👽\nGroup opened")
    }
    break
    case "close": {
        if (!isGroupAdmins) return reply('Crownus👽\nIts an admin command')
        if (!isBotGroupAdmins) return reply('Crownus👽\nBot is not admin')
        if (!groupMetadata) return reply('Crownus👽\nTry Again!')
        const {
            announce
        } = await sock.groupMetadata(from)
        if (announce) return reply('Crownus👽\nAlready closed!')
        await sock.groupSettingUpdate(from, 'announcement')
        reply("Crownus👽\nGroup Closed")
    }
    break
    case 'flip': {
        const side = Math.floor(Math.random() * 2) + 1
        if (side == 1) {
            sock.sendMessage(from, {
                image: {
                    url: 'https://i.ibb.co/LJjkVK5/heads.png'
                },
                caption: "Heads"
            }, {
                quoted: msg
            })
        } else {
            sock.sendMessage(from, {
                image: {
                    url: 'https://i.ibb.co/wNnZ4QD/tails.png'
                },
                caption: "Tails"
            }, {
                quoted: msg
            })
        }
    }
    break
    case 'meme': {
        const response = await axios.get('https://meme-api.herokuapp.com/gimme/wholesomeanimemes')
        const {
            title,
            url
        } = response.data
        await sock.sendMessage(from, {
            image: {
                url: url
            },
            caption: title
        }, {
            quoted: msg
        })
    }
    break
    case "demote": {
        if (!isGroupAdmins) return reply('Crownus👽\nIts an admin command')
        if (!isBotGroupAdmins) return reply('Crownus👽\nBot is not admin')
        try {
            user = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            reply("Crownus👽\nPlease tag the user")
            return;
        }
        if (user === groupMetadata.owner || '') {
            return reply(`Crownus👽\nSkipped as they're the owner`)
            //return reply(`${tex}`)
        }
        if (!groupAdmins.includes(user)) {
            return reply(`Crownus👽\nSkipped as they're not admin`)
            //return reply(`${tex}`)
        }
        await sock.groupParticipantsUpdate(from, [user], 'demote')
    }
    break
    case "promote": {
        if (!isGroupAdmins) return reply('Crownus👽\nIts an admin command')
        if (!isBotGroupAdmins) return reply('Crownus👽\nBot is not admin')
        try {
            user = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            reply("Crownus👽\nPlease tag the user")
            return;
        }
        if (groupAdmins.includes(user)) {
            return reply(`Crownus👽\nSkipped as they're already admin`)
            //return reply(`${tex}`)
        }
        await sock.groupParticipantsUpdate(from, [user], 'promote')
    }
    break
    case "hornycard":
    case "hc": {
        try {
            user = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            user = sender
        }
        try {
            ppuser = await sock.profilePictureUrl(user, 'image')
        } catch {
            ppuser = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMxMUXFtd5GrFkxyrU-f5zA2IH8MZ-U-cFKg&usqp=CAU'
        }
        const response = await axios.get(ppuser, {
            responseType: 'arraybuffer'
        })
        const buffer = Buffer.from(response.data, "utf-8")
        let image = await bufferToUrl(buffer)
        let url = `https://some-random-api.ml/canvas/horny?avatar=${image.link}`
        try {
            await sock.sendMessage(from, {
                image: {
                    url: url
                },
                caption: "Your horny card here."
            }, {
                quoted: msg
            });
        } catch (e) {
            await sock.sendMessage(from, {
                text: `Crownus👽\nSomething bad happend\n${e.message}`
            }, {
                quoted: msg
            });
        }
    }
    break
    case 'pokemon': {
        if (!text) return reply("Crownus👽\n No query provided!")
        try {
            let {
                data: data
            } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${text}`)
            if (!data.name) return reply(`Crownus👽\n No such pokemon`)
            let yu = `*Name: ${data.name}*\n*Pokedex ID: ${data.id}*\n*Weight: ${data.weight}*\n*Height: ${data.height}*\n*Base Experience: ${data.base_experience}*\n*Abilities: ${data.abilities[0].ability.name}, ${data.abilities[1].ability.name}*\n*Type: ${data.types[0].type.name}*\n*HP: ${data.stats[0].base_stat}*\n*Attack: ${data.stats[1].base_stat}*\n*Defense: ${data.stats[2].base_stat}*\n*Special Attack: ${data.stats[3].base_stat}*\n*Special Defense:${data.stats[4].base_stat}*\n*Speed: ${data.stats[5].base_stat}*\n`
            sock.sendMessage(from, {
                image: {
                    url: data.sprites.front_default
                },
                caption: yu
            }, {
                quoted: msg
            })
        } catch (err) {
            reply("Crownus👽\nAn Error Occurred")
            console.log(err)
        }
    }
    break
    
    case "help": {
        try {
            reply(`Hi ${senderName}, I'm ${name}👽 
            🤖 *Command List* 🤖

ℹ️ *Mods*:-

~> \`\`\`ban, unban, bc\`\`\`\
\n\n🖥 *General*:-

~> \`\`\`hi, delete, leaderboard, lb\`\`\`\
\n\n👤 *User*:-

~> \`\`\`profile, rank, check\`\`\`\
\n\n📽 *Media*:-

~> \`\`\`ytsearch, play, ytaudio, lyrics, ytvideo\`\`\`\
\n\n⭐️ *Fun*:-

~> \`\`\`reaction, truth, sadcat, dare, advise, fact, check, ship, meme, flip, solemate, hornycard\`\`\`\
\n\n💮 *Weeb*:-

~> \`\`\`anime, aid, charid, neko, character, pokemon, haigusha, waifu\`\`\`\
\n\n🖇 *Utils*:-

~> \`\`\`githubsearch, github, google, upload, imagesearch, img, define, wikipedia, gify, sticker, image, subreddit, sr\`\`\`\
\n\n📛 *Moderation*:-

~> \`\`\`event, antilink, nsfw, remove, ping, open, close, promote, demote\`\`\`\
\n\n📗 *Note*~> Calls and spamming in bot’s 🤖 Dm will cause a ban so be aware
\nSupport us by following us on GitHub:
\nhttps://github.com/DSCRongo
`)
            return;
        } catch (e) {
            reply(e)
        }
        
    }
    break
    case "check": {
        reply(` Hi ${senderName}, I'm ${name}👽 

📛 *Check list*

awesomecheck
greatcheck
gaycheck
lesbiancheck
cutecheck
hornycheck
prettycheck
lovelycheck
uglycheck
beautifulcheck
handsomecheck
charactercheck

⁃ _Check the things in list in you_ 💮

Support us by following us on GitHub:

https://github.com/crownus`)
    }
    break
    case "reaction": {
        reply(` Hi ${senderName}, I'm ${name}👽 

📛 *Reaction List*

cry
kiss
bully
hug
lick
cuddle
pat
smug
highfive
bonk
yeet
blush
wave
smile
handhold
nom
bite
glomp
kill
slap
cringe
kick
wink
happy
poke
punch
dance

-  _Let's React_ 🔰

Support us by following us on GitHub:

https://github.com/crownus`)
    }
    break
    case 'define':
    case 'dictionary': {
        if (!text) return reply(`Crownus👽\nPlease provide me the search term.`)
        try {
            def = await axios.get(`http://api.urbandictionary.com/v0/define?term=${text}`)
            if (!def) return reply(`${text} isn't a valid text`)
            const defi = `
Word:~> ${text}

Definition:~> ${def.data.list[0].definition
    .replace(/\[/g, "")
    .replace(/\]/g, "")}

💭 Example:~> ${def.data.list[0].example
    .replace(/\[/g, "")
    .replace(/\]/g, "")}
               `
            reply(defi)
        } catch (err) {
            console.log(err.toString())
            return reply("Crownus👽\nSorry could not find the result!!!!!")
        }
    }
    break
    case "profile": {
        let exp = await db.get(`${sender}.Xp`)
        let role = "";
        if (exp < 500) {
            role = "🌸 Citizen";
        } else if (exp < 1000) {
            role = "🔎 Cleric";
        } else if (exp < 2000) {
            role = "🔮 Wizard";
        } else if (exp < 5000) {
            role = "♦️ Mage";
        } else if (exp < 10000) {
            role = "🎯 Noble";
        } else if (exp < 25000) {
            role = "✨ Elite";
        } else if (exp < 50000) {
            role = "🔶️ Ace";
        } else if (exp < 75000) {
            role = "🌀 Hero";
        } else if (exp < 100000) {
            role = "💎 Supreme";
        } else {
            role = "❄️ Mystic";
        }
        
        let level = "";
        if (exp < 500) {
            level = 1;
        } else if (exp < 1000) {
            level = 2;
        } else if (exp < 2000) {
            level = 3;
        } else if (exp < 5000) {
            level = 4;
        } else if (exp < 10000) {
            level = 5;
        } else if (exp < 25000) {
            level = 6;
        } else if (exp < 50000) {
            level = 7;
        } else if (exp < 75000) {
            level = 8;
        } else if (exp < 100000) {
            level = 9;
        } else {
            level = 10;
        }
        let required = "";
        if (exp < 500) {
            required = 500;
        } else if (exp < 1000) {
            required = 1000;
        } else if (exp < 2000) {
            required = 2000;
        } else if (exp < 5000) {
            required = 5000;
        } else if (exp < 10000) {
            required = 10000;
        } else if (exp < 25000) {
            required = 25000;
        } else if (exp < 50000) {
            required = 50000;
        } else if (exp < 75000) {
            required = 75000;
        } else if (exp < 100000) {
            required = 100000;
        } else {
            required = 0;
        }
        
        try {
            ppuser = await sock.profilePictureUrl(sender, 'image')
        } catch {
            ppuser = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMxMUXFtd5GrFkxyrU-f5zA2IH8MZ-U-cFKg&usqp=CAU'
        }
        let bio = ''
        try {
            bio = (await sock.fetchStatus(sender))
                .status
        } catch (error) {
            console.log(error)
            bio = 'None'
        }
        let ban = banned.includes(sender) || false
        let contant = `*User Profile* ✨️ \n\n❢ Name ❢: ${senderName}\n\n➽ Exp ➽: ${exp} / ${required}\n\n◔ Level ◔: ${level}\n\n♕ Role ♕: ${role}\n\n⎙ User Notice ⎙: ${bio}\n\n⊝ Clan ⊝: ${groupName}\n\n♛ Admin ♛: ${isGroupAdmins}\n\n⌀ Ban ⌀: ${ban}\n`
        return sock.sendMessage(from, {
            image: {
                url: ppuser
            },
            caption: contant
        }, {
            quoted: msg
        })
    }
    break
    case "rank": {
        let exp = await db.get(`${sender}.Xp`)
        let role = "";
        if (exp < 500) {
            role = "🌸 Citizen";
        } else if (exp < 1000) {
            role = "🔎 Cleric";
        } else if (exp < 2000) {
            role = "🔮 Wizard";
        } else if (exp < 5000) {
            role = "♦️ Mage";
        } else if (exp < 10000) {
            role = "🎯 Noble";
        } else if (exp < 25000) {
            role = "✨ Elite";
        } else if (exp < 50000) {
            role = "🔶️ Ace";
        } else if (exp < 75000) {
            role = "🌀 Hero";
        } else if (exp < 100000) {
            role = "💎 Supreme";
        } else {
            role = "❄️ Mystic";
        }
        
        let level = "";
        if (exp < 500) {
            level = 1;
        } else if (exp < 1000) {
            level = 2;
        } else if (exp < 2000) {
            level = 3;
        } else if (exp < 5000) {
            level = 4;
        } else if (exp < 10000) {
            level = 5;
        } else if (exp < 25000) {
            level = 6;
        } else if (exp < 50000) {
            level = 7;
        } else if (exp < 75000) {
            level = 8;
        } else if (exp < 100000) {
            level = 9;
        } else {
            level = 10;
        }
        let required = "";
        if (exp < 500) {
            required = 500;
        } else if (exp < 1000) {
            required = 1000;
        } else if (exp < 2000) {
            required = 2000;
        } else if (exp < 5000) {
            required = 5000;
        } else if (exp < 10000) {
            required = 10000;
        } else if (exp < 25000) {
            required = 25000;
        } else if (exp < 50000) {
            required = 50000;
        } else if (exp < 75000) {
            required = 75000;
        } else if (exp < 100000) {
            required = 100000;
        } else {
            required = 0;
        }
        let disec = sender.substring(3, 7)
        try {
            ppuser = await sock.profilePictureUrl(sender, 'image')
        } catch {
            ppuser = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMxMUXFtd5GrFkxyrU-f5zA2IH8MZ-U-cFKg&usqp=CAU'
        }
        let card = `Name : ${senderName}

⊷ User xp ⊷: ${exp} / ${required}

❈ Stage ❈: ${role}

✾ Level ✾ ${level}

Support us by following us on GitHub:

https://github.com/DSCRongo`
        const rank = new canvacord.Rank()
            .setAvatar(ppuser)
            .setLevel(level)
            .setLevelColor('#39FF14', '#39FF14')
            .setCurrentXP(exp)
            .setOverlay('#000000', 100, false)
            .setRequiredXP(required)
            .setProgressBar('#39FF14', 'COLOR')
            .setRank(0, role, false)
            .setBackground('COLOR', '#000000')
            .setUsername(senderName)
            .setDiscriminator(disec)
        rank.build()
            .then(async (data) => {
                sock.sendMessage(from, {
                    image: data,
                    caption: card
                }, {
                    quoted: msg
                })
            })
    }
    break
    
    case 'soulmate': {
        if (!isGroup) return replay("It's only can be executed in groups")
        let member = groupMembers.map(u => u.id)
        let me = sender
        let user2 = member[Math.floor(Math.random() * member.length)]
        let jawab = `👫 Soulmates
@${me.split('@')[0]} ❤️ @${user2.split('@')[0]}`
        let ments = [me, user2]
        await sock.sendMessage(from, {
            text: jawab,
            mentions: ments
        }, {
            quoted: msg
        })
    }
    break
    case 'awesomecheck':
    case 'greatcheck':
    case 'gaycheck':
    case 'cutecheck':
    case 'lesbiancheck':
    case 'hornycheck':
    case 'prettycheck':
    case 'lovelycheck':
    case 'uglycheck':
    case 'beautifulcheck':
    case 'handsomecheck': {
        arr = []
        try {
            user2 = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            user2 = sender
        }
        arr.push(user2)
        let per = Math.floor(Math.random() * 100) + 1
        let sentence = command.split("check")
        let cc = command.toUpperCase()
        await sock.sendMessage(from, {
            text: `*=======[${cc}]=======*\n\n @${user2.split('@')[0]} is ${per}% ${sentence[0]}`,
            mentions: arr
        }, {
            quoted: msg
        })
    }
    break
    case 'charactercheck': {
        arr = []
        try {
            user2 = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
        } catch {
            user2 = sender
        }
        arr.push(user2)
        const Mikutttt = ['Compassionate', 'Generous', 'Grumpy', 'Forgiving', 'Obedient', 'Good', 'Simp', 'Kind-Hearted', 'patient', 'UwU', 'top, anyway', 'Helpful']
        const taky = Mikutttt[Math.floor(Math.random() * Mikutttt.length)]
        let per = Math.floor(Math.random() * 100) + 1
        let cc = command.toUpperCase()
        await sock.sendMessage(from, {
            text: `*=======[${cc}]=======*\n\n @${user2.split('@')[0]} is ${per}% ${taky}`,
            mentions: arr
        }, {
            quoted: msg
        })
    }
    break
    //////////NSFW///////////////
    
    case "subreddit":
    case 'sr': {
        if (!text) {
            reply('Crownus👽\nProvide a search term!')
            return;
        }
        const sr = text
        try {
            const {
                data
            } = await axios.get(`https://meme-api.herokuapp.com/gimme/${sr}`);
            if (!nsfw.includes(from) && data.nsfw) return reply(`Crownus👽\nHentai is not registered on ${groupName}`)
            const xz = `Title : ${data.title} 

Postlink : ${data.postLink}     

Subreddit: ${data.subreddit}

Nsfw : ${data.nsfw}

Spoiler: ${data.spoiler}`
            
            await sock.sendMessage(from, {
                image: {
                    url: data.url
                },
                caption: xz
            }, {
                quoted: msg
            });
        } catch (err) {
            await reply('Crownus👽\nThere is no such subreddit, Baka!')
            console.log(err)
        }
    }
    break
    case 'bc': {
        if (!isOwner) {
            reply("Crownus👽\nOwner only!!!!")
            return;
        }
        if (!text) {
            reply("Crownus👽\n No query provided!")
            return;
        }
        let getGroups = await sock.groupFetchAllParticipating()
        let groups = Object.entries(getGroups)
            .slice(0)
            .map(entry => entry[1])
        let res = groups.map(v => v.id)
        reply(`Crownus👽\n Broadcasting in ${res.length} Group Chat, in ${res.length * 1.5} seconds`)
        for (let i of res) {
            let txt = `🔰</ *${name} Broadcast* >🔰\n\n🏮 Message:~> ${text}`
            await sock.sendMessage(i, {
                image: {
                    url: "https://i.pinimg.com/736x/3a/15/a3/3a15a349b478f236f026cb52ab7bc984.jpg"
                },
                caption: `${txt}`
            })
        }
        reply(`Crownus👽\nSuccessfuly Broadcasted in ${res.length} Groups`)
    }
    break
    default:
        if (body) {
            reply(`Crownus👽\n This is an unlisted command, read the commands in help \n To help add this command report to \n ${Crownus}👽.`)
        }
        break
    }
    
}
