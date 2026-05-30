import makeWASocket, {
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"

import Pino from "pino"
import express from "express"

const app = express()
const bots = {}

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
res.send("Bot running ✅")
})

app.listen(PORT, () => {
console.log(`Server running on ${PORT}`)
})

async function startBot(number) {

const { state, saveCreds } =
await useMultiFileAuthState(`session/${number || "default"}`)

const { version } =
await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger: Pino({ level: "silent" }),
auth: state,
browser: ["Ubuntu", "Chrome", "20.0.04"]
})

sock.ev.on("creds.update", saveCreds)

const store = {}
global.bannedUsers = global.bannedUsers || []
global.cooldowns = global.cooldowns || {}
// Anti Delete
sock.ev.on("messages.update", async (updates) => {

for (const update of updates) {

if (update.update.message === null) {

const key = update.key

// GET SAVED MESSAGE
const deletedMsg = store[key.id]

if (!deletedMsg) return

const owner = "27687085163@s.whatsapp.net"

const message =
deletedMsg.message.conversation ||
deletedMsg.message.extendedTextMessage?.text ||
"[Media Message]"

await sock.sendMessage(owner, {
text: `🚨 Deleted Message Detected

👤 User: ${key.participant || key.remoteJid}

📝 Message:
${message}`
})
}
}
})

// MESSAGES
sock.ev.on("messages.upsert", async ({ messages }) => {

const msg = messages[0]

if (!msg.message) return

// SAVE MESSAGE
store[msg.key.id] = msg

const from = msg.key.remoteJid

const text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text ||
""

// OWNER NUMBER
const ownerNumber =
"27687085163@s.whatsapp.net"

// COOLDOWN SYSTEM
global.cooldowns =
global.cooldowns || {}

const sender = (
  msg.key.fromMe
    ? ownerNumber
    : (
        msg.key.participant ||
        msg.participant ||
        msg.key.remoteJid
      )
).replace(/:\d+@/, "@")

console.log("FROM ME =", msg.key.fromMe)
console.log("SENDER =", sender)
console.log("OWNER =", ownerNumber)
  
const now = Date.now()

if (
  global.cooldowns[sender] &&
  now - global.cooldowns[sender] < 3000
) {

  return
}

global.cooldowns[sender] = now

// OWNER ONLY COMMANDS
const ownerCommands = [
  ".tagall",
  ".kick",
  ".hidetag",
  ".promote",
  ".demote",
]

if (
  ownerCommands.includes(text.split(" ")[0]) &&
  sender !== ownerNumber
) {

  await sock.sendMessage(from, {
    text: "❌ Owner only command."
  })

  return
}
  
//CHECK BANNED USERS
if (
  global.bannedUsers.includes(sender)
) {

  await sock.sendMessage(from, {
    text: "🚫 You are banned from using the bot."
  })

  return
}
  
  //ANTIBAN 
if (
  from.endsWith("@g.us") &&
  text.includes("https://chat.whatsapp.com/")
) {

  await sock.sendMessage(from, {
    text: "🚫 WhatsApp links are not allowed."
  })

  return
}
  

// ANTI-SPAM
if (
  text.length > 500
) {

  await sock.sendMessage(from, {
    text:
"⚠️ Spam detected."
  })

  return
}

// .hack
if (text.startsWith(".hack")) {

  const number =
    text.replace(".hack", "").trim()

  if (!number) {

    await sock.sendMessage(from, {
      text: "🥷 Enter a phone number."
    })

    return
  }

  // START
  await sock.sendMessage(from, {
    text:
`💻 Initializing hack on ${number}...`
  })

  // STEP 1
  setTimeout(async () => {

    await sock.sendMessage(from, {
      text:
`🤖 Connecting to WhatsApp servers...`
    })

  }, 1000)

  // STEP 2
  setTimeout(async () => {

    await sock.sendMessage(from, {
      text:
`📱 Searching device linked to ${number}...`
    })

  }, 2000)

  // STEP 3
  setTimeout(async () => {

    await sock.sendMessage(from, {
      text:
`🔍 Extracting account information...`
    })

  }, 3000)

  // STEP 4
  setTimeout(async () => {

    await sock.sendMessage(from, {
      text:
`🔓 Bypassing encryption firewall...`
    })

  }, 4000)

  // STEP 5
  setTimeout(async () => {

    await sock.sendMessage(from, {
  text: `⚡ Initiating Hack...
█ 10%
██ 30%
████ 50%
██████ 80%
██████████ 100%
💀 TARGET INFO FOUND`
})

  }, 5000)

  // FINAL
  setTimeout(async () => {

    await sock.sendMessage(from, {
      text:
`☠️ HACK COMPLETE ☠️

Target Number: ${number}

 Device Access: SUCCESS
 Chats: EXPORTED
 Gallery: EXPORTED
 Live Location: TRACKED
 Passwords: BYPASSED

 MAHAPPEN MD CONTROLS THE SYSTEM`
    })

  }, 7000)

  return
}

// ping
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
// !owner command
if (text === ".owner") {

  await sock.sendMessage(from, {
    video: {
      url: "https://files.catbox.moe/radehm.mp4"
    },
    gifPlayback: true,
    caption: `╭━━〔 👤 𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 〕━━⬣
    
𝐍𝐀𝐌𝐄: 𝗔𝗯𝘂𝘁𝗶𝗲𝘆𝗠𝗮𝗵𝗮𝗽𝗽𝗲𝗻
𝐑𝐎𝐋𝐄:  𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥
𝐒𝐓𝐀𝐓𝐔𝐒: 𝗢𝗡𝗟𝗜𝗡𝗘
𝐒𝐘𝐒𝐓𝐄𝐌: 𝗔𝗖𝗧𝗜𝗩𝗘
𝐑𝐀𝐌/𝐂𝐏𝐔 : 8𝗚𝗕

💬 "Building bots & automation"

╰━━━━━━━━━━━━━━⬣`
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

  // UNBAN
if (text.startsWith(".unban")) {

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
  
  // hidetag
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
  
// .vv command

if (text === ".antidelete") {
await sock.sendMessage(from, {
text: "🛡️ Anti-delete activated."
})

return
}

if (text === ".alive") {
await sock.sendMessage(from, {
text: "𝙈𝘼𝙃𝘼𝙋𝙋𝙀𝙉 𝙈𝘿 𝙄𝙎 𝘼𝙇𝙄𝙑𝙀 & 𝙍𝙐𝙉𝙉𝙄𝙉𝙂🥳."
})

return
}
  
// .menu command
if (text === ".menu") {
await sock.sendMessage(from, {
image: {
url: "https://files.catbox.moe/caxt5m.png"
},
caption: `╭──〔 *『𝗕𝗔𝗗𝗕𝗢𝗬-𝗠𝗗 𝗩1』* 〕──⬣
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
├ 👀 .vv
├ 🚫 .ban
├ ♻️ .unban
├ 💣 .kick
├ 📢 .tagall
├ 👻 .hidetag
│
╰────────────────⬣`
})
}
})

  
// Connection updates
sock.ev.on("connection.update", async (update) => {
sock.ev.on("connection.update", async (update) => {

const { connection, lastDisconnect } = update

if (connection === "open") {
console.log("✅ WhatsApp Connected")
}

if (connection === "close") {

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

console.log("❌ Connection closed")

if (shouldReconnect) {
console.log("🔄 Reconnecting...")
startBot(number)
}
}

})

// Pairing code
if (!sock.authState.creds.registered && number) {
const phoneNumber = number

console.log("Using Number:", phoneNumber)

setTimeout(async () => {
try {
const code = await sock.requestPairingCode(phoneNumber)
console.log("PAIR CODE:", code)
} catch (err) {
console.log(err)
}
}, 3000)
}
}

  app.get("/pair/:number", async (req, res) => {

const number = req.params.number

try {

await startBot(number)

res.send(`
<h2>BADBOY-MD</h2>
<p>Pairing started for:</p>
<b>${number}</b>
`)

} catch (err) {
res.send(err.message)
}

})
if (shouldReconnect) {
    startBot(number)
}
