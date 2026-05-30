import express from "express"
import makeWASocket, {
useMultiFileAuthState,
fetchLatestBaileysVersion,
DisconnectReason
} from "@whiskeysockets/baileys"

import Pino from "pino"
import fs from "fs"

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

  const from = msg.key.remoteJid

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    ""
//ALIVE
   

if (text === ".alive") {
await sock.sendMessage(from, {
text: "𝙈𝘼𝙃𝘼𝙋𝙋𝙀𝙉 𝙈𝘿 𝙄𝙎 𝘼𝙇𝙄𝙑𝙀 & 𝙍𝙐𝙉𝙉𝙄𝙉𝙂🥳."
})

return
}
   

// Save session
sock.ev.on("creds.update", saveCreds)

// MESSAGE STORE
const store = {}
  //BANNED USERS
  global.bannedUsers =
global.bannedUsers || []

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
   
   //MENU
  if (text === ".menu") {
    await sock.sendMessage(from, {
      image: {
        url: "https://files.catbox.moe/dg9pcn.png"
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

    return
  }

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
            }
