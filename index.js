//Crownus👽
const {
    default: WASocket,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState
} = require('@adiwajshing/baileys')
const Pino = require('pino')
const {
    sessionName
} = require('./config.json')
const {
    Boom
} = require('@hapi/boom')
const qrcode = require("qrcode");
const store = require('./store');
const {
    schedule
} = require('node-cron');
const {
    existsSync,
    watchFile
} = require('fs')
const express = require("express");
const path = require('path')
let messageHandler = require('./handler/message')
require('./handler/message')
existsSync('./store/baileys_store.json') && store.readFromFile('./store/baileys_store.json')
setInterval(() => {
    store.writeToFile('./store/baileys_store.json')
}, 10000)

watchFile('./handler/message.js', () => {
    const dir = path.resolve('./handler/message.js')
    if (dir in require.cache) {
        delete require.cache[dir]
        messageHandler = require('./handler/message')
        console.log(`reloaded message.js`)
    }
})

const PORT = process.env.PORT || 8080
const app = express();
let QR_GENERATE = "invalid";
const connect = async () => {
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(path.resolve(`${sessionName}-session`), Pino({
        level: 'silent'
    }))
    let {
        version,
        isLatest
    } = await fetchLatestBaileysVersion()
    
    console.log(`Using: ${version}, newer: ${isLatest}`)
    const sock = WASocket({
        printQRInTerminal: true,
        auth: state,
        logger: Pino({
            level: 'silent'
        }),
        version,
    })
    store.bind(sock.ev)
    
    sock.ev.on('chats.set', () => {
        console.log('got chats', store.chats.all()
            .length)
    })
    
    sock.ev.on('contacts.set', () => {
        console.log('got contacts', Object.values(store.contacts)
            .length)
    })
    
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', async (up) => {
        const {
            lastDisconnect,
            connection,
            qr
        } = up
        if (connection) {
            console.log('Connection Status: ', connection)
        }
        if (qr) {
            QR_GENERATE = qr;
        }
        if (connection === 'open') {
            await db.connect();
            
            sock.ev.on('group-participants.update', async (client) => {
                try {
                    const Ievent = await db.get("event") || []
                    let metadata = await sock.groupMetadata(client.id)
                    let participants = client.participants
                    let members = client.participants[0]
                    
                    for (let num of participants) {
                        // Get Profile Picture Group
                        try {
                            ppgroup = await sock.profilePictureUrl(client.id, 'image')
                        } catch {
                            ppgroup = 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fwww.sciencealert.com%2Fimages%2F2022%2F10%2FFriendlyAlienToys-642x260.jpg&imgrefurl=https%3A%2F%2Fwww.sciencealert.com%2Fdiscovering-even-friendly-aliens-could-have-some-real-risks-for-humanity&tbnid=MTUIqFBcRrAucM&vet=12ahUKEwjT4LT57YT7AhUngc4BHRN9DW0QMygbegUIARDPAQ..i&docid=z-fy6rxQMLCw7M&w=642&h=260&q=alien&ved=2ahUKEwjT4LT57YT7AhUngc4BHRN9DW0QMygbegUIARDPAQ'
                        }
                        if (client.action == 'add' && Ievent.includes(client.id)) {
                            let Itext = ` Hi @${num.split('@')[0]}, I'm Crownus👽 
welcome to ~> ${metadata.subject}
`
                            sock.sendMessage(client.id, {
                                image: {
                                    url: ppgroup
                                },
                                contextInfo: {
                                    mentionedJid: [num]
                                },
                                caption: Itext
                            })
                        }
                        if (client.action == 'remove' && Ievent.includes(client.id)) {
                            let gif = 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fwww.sciencealert.com%2Fimages%2F2022%2F10%2FFriendlyAlienToys-642x260.jpg&imgrefurl=https%3A%2F%2Fwww.sciencealert.com%2Fdiscovering-even-friendly-aliens-could-have-some-real-risks-for-humanity&tbnid=MTUIqFBcRrAucM&vet=12ahUKEwjT4LT57YT7AhUngc4BHRN9DW0QMygbegUIARDPAQ..i&docid=z-fy6rxQMLCw7M&w=642&h=260&q=alien&ved=2ahUKEwjT4LT57YT7AhUngc4BHRN9DW0QMygbegUIARDPAQ'
                            let desc = `Bye @${num.split('@')[0]}\n@${num.split('@')[0]} has left from ~>${metadata.subject}`
                            sock.sendMessage(client.id, {
                                video: {
                                    url: gif
                                },
                                contextInfo: {
                                    mentionedJid: [num]
                                },
                                gifPlayback: true,
                                caption: desc
                            })
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
            })
            
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect.error)
                .output.statusCode
            if (reason === DisconnectReason.badSession) {
                console.log(`Bad Session File, Please Delete ${sessionName}-session and Scan Again`)
                sock.logout()
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log('Connection closed, reconnecting....')
                connect()
            } else if (reason === DisconnectReason.connectionLost) {
                console.log('Connection Lost from Server, reconnecting...')
                connect()
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log('Connection Replaced, Another New Session Opened, Please Close Current Session First')
                sock.logout()
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(`Device Logged Out, Please Delete ${sessionName}-session and Scan Again.`)
                sock.logout()
            } else if (reason === DisconnectReason.restartRequired) {
                console.log('Restart Required, Restarting...')
                connect()
            } else if (reason === DisconnectReason.timedOut) {
                console.log('Connection TimedOut, Reconnecting...')
                connect()
            } else {
                sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`)
            }
        }
    })
    
    // messages.upsert
    sock.ev.on('messages.upsert', ({
        messages,
        type
    }) => {
        if (type !== 'notify') return
        messageHandler(sock, messages[0])
    })
}
connect()

app.use(async (req, res) => {
    res.setHeader("content-type", "image/png");
    res.end(await qrcode.toBuffer(QR_GENERATE));
});

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
setInterval(async function () {
    appName = process.env.APPNAME
    await axios.get(`http://${appName}.herokuapp.com`);
}, 3 * 60 * 1000);
