import express from "express"
import makeWASocket, {
useMultiFileAuthState,
fetchLatestBaileysVersion,
DisconnectReason
} from "@whiskeysockets/baileys"

import Pino from "pino"
import fs from "fs"

if (!fs.existsSync("./store")) {
  fs.mkdirSync("./store")
}

//BANNED USERS
global.bannedUsers = global.bannedUsers || []

const app = express()
const PORT = process.env.PORT || 3000

const bots = {}

const OWNER = "27687085163@s.whatsapp.net"

app.get("/", (req, res) => {
res.send("Bot running ✅")
})

app.listen(PORT, () => {
console.log("Server running on", PORT)
})

/* =========================
   PAIR ROUTE (FIXED)
========================= */
app.get("/pair/:number", async (req, res) => {

const number = req.params.number

try {

// FORCE CLEAN SESSION
const sessionPath = `session/${number}`

if (fs.existsSync(sessionPath)) {
fs.rmSync(sessionPath, { recursive: true, force: true })
}

console.log("🚀 Pair request:", number)

await startBot(number)

res.send(`
<h2>BADBOY-MD</h2>
<p>Pairing started for:</p>
<b>${number}</b>
<p>Check Termux for code</p>
`)

} catch (err) {
console.log(err)
res.status(500).send(err.message)
}

})

const store = {}
/* =========================
   START BOT (FIXED)
========================= */
async function startBot(number) {

if (bots[number]) {
console.log("♻️ Restarting existing bot:", number)
bots[number].end()
delete bots[number]
}

const { state, saveCreds } =
await useMultiFileAuthState(`session/${number}`)

const { version } =
await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger: Pino({ level: "silent" }),
auth: state,
browser: ["Ubuntu", "Chrome", "20.0.04"]
})

bots[number] = sock

sock.ev.on("creds.update", saveCreds)

//COMMANDS
sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0]
  if (!msg.message) return

  const id = msg.key.id
  const from = msg.key.remoteJid

  let type = Object.keys(msg.message)[0]

  store[id] = {
    from,
    type,
    sender: msg.key.participant || from,
    text:
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""
  }

  // 📸 IMAGE
  if (msg.message.imageMessage) {
    const buffer = await sock.downloadMediaMessage(msg)

    fs.writeFileSync(`./store/${id}.jpg`, buffer)

    store[id].file = `${id}.jpg`
  }

  // 🎥 VIDEO
  if (msg.message.videoMessage) {
    const buffer = await sock.downloadMediaMessage(msg)

    fs.writeFileSync(`./store/${id}.mp4`, buffer)

    store[id].file = `${id}.mp4`
  }

  // 🎤 AUDIO / VOICE
  if (msg.message.audioMessage) {
    const buffer = await sock.downloadMediaMessage(msg)

    fs.writeFileSync(`./store/${id}.mp3`, buffer)

    store[id].file = `${id}.mp3`
  }
})
   //RESTORE
   sock.ev.on("messages.update", async (updates) => {
  for (const u of updates) {

    if (u.update.message === null) {

      const id = u.key.id
      const data = store[id]

      if (!data) return

      const chat = u.key.remoteJid

      // TEXT
      if (!data.file) {
        return await sock.sendMessage(chat, {
          text:
`👻 *DELETED MESSAGE*

👤 ${data.sender}
💬 ${data.text}`
        })
      }

      // MEDIA
      const filePath = `./store/${data.file}`

      if (data.file.endsWith(".jpg")) {
        await sock.sendMessage(chat, {
          image: fs.readFileSync(filePath),
          caption: `👻 Deleted Image\n👤 ${data.sender}`
        })
      }

      if (data.file.endsWith(".mp4")) {
        await sock.sendMessage(chat, {
          video: fs.readFileSync(filePath),
          caption: `👻 Deleted Video\n👤 ${data.sender}`
        })
      }

      if (data.file.endsWith(".mp3")) {
        await sock.sendMessage(chat, {
          audio: fs.readFileSync(filePath),
          mimetype: "audio/mp4"
        })
      }
    }
  }
})
   //hidetag
if (text.startsWith(".hidetag")) {

  if (!from.endsWith("@g.us")) return

  const metadata =
    await sock.groupMetadata(from)

  const participants =
    metadata.participants.map(p => p.id)

  const hideText =
    text.replace(".hidetag", "").trim()

  await sock.sendMessage(from, {
    text: hideText || "👀 Hidetag Message",
    mentions: participants
  })
}

   //ALIVE
   
  if (text === ".alive") {
    await sock.sendMessage(from, {
      text: "𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝗠𝗗  𝙄𝙎 𝘼𝙇𝙄𝙑𝙀 🥳"
    })
  }

   //ANTI LINK
   if (text.includes("chat.whatsapp.com")) {
  if (!from.endsWith("@g.us")) return

  await sock.sendMessage(from, {
    text: "🚫 Links not allowed!"
  })

  await sock.sendMessage(from, {
    delete: msg.key
  })

  return
   }
   //BOT INFO
   if (text === ".info") {
  await sock.sendMessage(from, {
    text: `🤖 Bot is running
📡 Status: Online
⚡ Speed: Stable
☘️ AKATSUKI-MD`
  })

  return
   }
   
   //kick
  if (text.startsWith(".kick")) {

  if (!from.endsWith("@g.us")) return

  const mentioned =
    msg.message.extendedTextMessage
    ?.contextInfo?.mentionedJid?.[0]

  if (!mentioned) {
    return await sock.sendMessage(from, {
      text: " Tag someone."
    })
  }

  await sock.groupParticipantsUpdate(
    from,
    [mentioned],
    "remove"
  )

  await sock.sendMessage(from, {
    text: " User kicked."
  })
  }
//ANTI-SPAM
if (
  text.length > 500
) {

  await sock.sendMessage(from, {
    text:
"⚠️ Spam detected."
  })

  return
}
   
//PING
   if (text === ".ping") {

  const start = Date.now()

  await sock.sendMessage(from, { text: " Pinging..." })

  const latency = Date.now() - start

  await sock.sendMessage(from, {
    text: `*PONG!*
Latency: ${latency}ms`
  })

  return
}

   //!owner command
if (text === ".owner") {
  await sock.sendMessage(from, {
    image: {
      url: "https://files.catbox.moe/i8oidw.jpg"
    },
    caption: `╭━━〔 👤 𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 〕━━⬣
    
𝐍𝐀𝐌𝐄: 𝗔𝗯𝘂𝘁𝗶𝗲𝘆𝗠𝗮𝗵𝗮𝗽𝗽𝗲𝗻
𝐑𝐎𝐋𝐄:  𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥
𝐒𝐓𝐀𝐓𝐔𝐒: 𝗢𝗡𝗟𝗜𝗡𝗘
𝐒𝐘𝐒𝐓𝐄𝐌: 𝗔𝗖𝗧𝗜𝗩𝗘
𝐑𝐀𝐌/𝐂𝐏𝐔 : 8𝗚𝗕

 "𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝗠𝗗"
╰━━━━━━━━━━━━━━⬣`
  })

  return
}


   //UNBAN
if(text.startsWith(".unban")) {

  const mentioned =
    msg.message.extendedTextMessage
    ?.contextInfo?.mentionedJid?.[0]

  if (!mentioned) {

    return await sock.sendMessage(from, {
      text: " Tag someone to unban."
    })
  }

  global.bannedUsers =
    global.bannedUsers.filter(
      user => user !== mentioned
    )

  await sock.sendMessage(from, {
    text: " User unbanned from bot🍀."
  })

  return
           }
  
// BAN
if (text.startsWith(".ban")) {

  const mentioned =
    msg.message.extendedTextMessage
    ?.contextInfo?.mentionedJid?.[0]

  if (!mentioned) {

    return await sock.sendMessage(from, {
      text: " Tag someone to ban."
    })
  }

  if (
    !global.bannedUsers.includes(mentioned)
  ) {

    global.bannedUsers.push(mentioned)
  }

  await sock.sendMessage(from, {
    text: "🚫 User banned from bot."
  })

  return
     }

   //Time
if (text === ".time") {
const time = new Date().toLocaleTimeString()

await sock.sendMessage(from, {
text: `🕒 Time: ${time}`
})

return
}

   //tagall
  if (text === ".tagall") {

  if (!from.endsWith("@g.us")) {
    return await sock.sendMessage(from, {
      text: "❌ Group only."
    })
  }

  const metadata =
    await sock.groupMetadata(from)

  const participants =
    metadata.participants

  let members = []
  let message = "📢 TAGGING ALL MEMBERS\n\n"

  for (let p of participants) {

    members.push(p.id)

    message += `➤ @${p.id.split("@")[0]}\n`
  }

  await sock.sendMessage(from, {
    text: message,
    mentions: members
  })
      }
     
   //MENU
  if (text === ".menu") {
    await sock.sendMessage(from, {
      image: {
        url: "https://files.catbox.moe/dg9pcn.png"
      },
      caption: `╭──〔 *『𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝗠𝗗 𝗩1』* 〕──⬣
│
├ 🥷 𝗢𝗪𝗡𝗘𝗥: 『𝐀𝐁𝐔𝐓𝐈𝐄𝐘 𝐌𝐀𝐇𝐀𝐏𝐏𝐄𝐍』
├ 𝗦𝗧𝗔𝗧𝗨𝗦: 𝖮𝖭𝖫𝖨𝖭𝖤
├ 𝗣𝗥𝗘𝗙𝗜𝗫: .
│
╭──〔 ☘️𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎☘️ 〕──⬣
│
├ ⚡ .ping
├ 👤 .owner
├ 🧾 .menu
├ 🕒 .time
├ 🔥 .alive
├ 🗑️ .clear
├ 🚫 .ban
├ ♻️ .unban
├ 💣 .kick
├ 📢 .tagall
├ 👻 .hidetag
|-❓ .info
|•MORW COMMANDS WILL BE ADDED STAY TUNED 
╰────────────────⬣`
    })

    return
  }
   })

/* =========================
   CONNECTION FIXED
========================= */
sock.ev.on("connection.update", (update) => {

const { connection, lastDisconnect } = update

if (connection === "open") {
console.log("✅ WhatsApp Connected:", number)
}

if (connection === "close") {

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

console.log("❌ Disconnected")

if (shouldReconnect) {
console.log("🔄 Reconnecting...")
startBot(number)
}
}
})

/* =========================
   PAIRING CODE (FIXED CORE)
========================= */
if (!state.creds.registered) {

setTimeout(async () => {
try {

const code = await sock.requestPairingCode(number)

console.log("🔥 PAIRING CODE:", code)

} catch (err) {
console.log("PAIR ERROR:", err.message)
}

}, 3000)

}

  }
