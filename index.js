import makeWASocket, {
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"

import Pino from "pino"
import express from "express"

const app = express()

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
res.send("Bot running ✅")
})

app.listen(PORT, () => {
console.log(`Server running on ${PORT}`)
})

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState("session")

const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger: Pino({ level: "silent" }),
auth: state,
browser: ["Ubuntu", "Chrome", "20.0.04"]
})


// Save session
sock.ev.on("creds.update", saveCreds)

// MESSAGE STORE
const store = {}

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

const sender =
msg.key.participant || from

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
💀 TARGET INFO FOUND
})

  }, 5000)

  // FINAL
  setTimeout(async () => {

    await sock.sendMessage(from, {
      text:
`☠️ HACK COMPLETE ☠️

Target Number: ${number}

📱 Device Access: SUCCESS
💬 Chats: EXPORTED
📸 Gallery: EXPORTED
📍 Live Location: TRACKED
🔐 Passwords: BYPASSED

😈 MAHAPPEN MD CONTROLS THE SYSTEM`
    })

  }, 7000)

  return
}

// ping
if (text === ".ping") {

const start = Date.now()

const end = Date.now()

const speed = end - start

await sock.sendMessage(from, {
text: `*PONG!*

BotStatus: Online
Speed: ${speed}ms
Node: Active`
})

return
}

// !owner command
if (text === ".owner") {
await sock.sendMessage(from, {
text: "ＯＷＮＥＲ ツ: A B U T I E Y亗M A H A P P E N"
})
}

//Time
if (text === ".time") {
const time = new Date().toLocaleTimeString()

await sock.sendMessage(from, {
text: `🕒 Time: ${time}`
})

return
}

// .vv command
if (text === ".vv") {
const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage

if (!quoted) {
return await sock.sendMessage(from, {
text: "❌ Reply to a view once message."
})
}

const viewOnce =
quoted.viewOnceMessageV2 ||
quoted.viewOnceMessage

if (!viewOnce) {
return await sock.sendMessage(from, {
text: "❌ That is not a view once message."
})
}

const message =
viewOnce.message.imageMessage ||
viewOnce.message.videoMessage

await sock.sendMessage(from, {
[message.mimetype.startsWith("image") ? "image" : "video"]: {
url: message.url
},
caption: "👀 View Once Opened"
})
}

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
text: `╭──〔 *『𝘈𝘣𝘶𝘵𝘪𝘦𝘺𝘔𝘢𝘩𝘢𝘱𝘱𝘦𝘯𝘔𝘋』* 〕──⬣
│
├ 🥷 Owner: 『𝐀𝐁𝐔𝐓𝐈𝐄𝐘 𝐌𝐀𝐇𝐀𝐏𝐏𝐄𝐍』
├ Status: Online
├ Prefix: .
│
╭──〔 ☘️𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎☘️ 〕──⬣
│
├ 💣 𝙿𝙸𝙽𝙶 : .ping
├ 🥷 𝙾𝚆𝙽𝙴𝚁 : .owner
├ 🔮 𝙼𝙴𝙽𝚄 : .menu
├ ⌚ 𝚃𝙸𝙼𝙴 : .time
├ 👀 𝚅𝙸𝙴𝚆 𝙾𝙽𝙲𝙴 : .vv
├ 💀 𝙰𝙽𝚃𝙸 𝙳𝙴𝙻𝙴𝚃𝙴 [coming soon] :
├ ⚔️ 𝙰𝙻𝙸𝚅𝙴 : .alive
│ 🔐  𝙷𝙰𝙲𝙺 : .hack
╰────────────────⬣`
})
}
})
// Connection updates
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
startBot()
}
}
})

// Pairing code
if (!sock.authState.creds.registered) {
const phoneNumber = process.env.PHONE_NUMBER

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

startBot()
