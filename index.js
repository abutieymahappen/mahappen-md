import express from "express"
import makeWASocket, {
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"

import Pino from "pino"

const app = express()
const PORT = process.env.PORT || 3000

const bots = {}

const OWNER = "27687085163@s.whatsapp.net"

app.get("/", (req, res) => {
res.send("Bot running ✅")
})

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
console.log("Server running on", PORT)
})

/* ---------------- PAIR ROUTE ---------------- */
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

/* ---------------- BOT CORE ---------------- */
async function startBot(number) {

if (bots[number]) {
console.log("Bot already running for", number)
return
}

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

bots[number] = sock

sock.ev.on("creds.update", saveCreds)

/* ---------------- STORE ---------------- */
const store = {}
global.bannedUsers = global.bannedUsers || []
global.cooldowns = global.cooldowns || []

/* ---------------- CONNECTION ---------------- */
sock.ev.on("connection.update", (update) => {

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

/* ---------------- MESSAGES ---------------- */
sock.ev.on("messages.upsert", async ({ messages }) => {

const msg = messages[0]
if (!msg.message) return

store[msg.key.id] = msg

const from = msg.key.remoteJid

const text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text ||
""

const sender =
(msg.key.participant || msg.key.remoteJid)
.replace(/:\d+@/, "@")

/* ---------------- COOLDOWN ---------------- */
const now = Date.now()

if (global.cooldowns[sender] && now - global.cooldowns[sender] < 3000) return
global.cooldowns[sender] = now

/* ---------------- BAN CHECK ---------------- */
if (global.bannedUsers.includes(sender)) {
return sock.sendMessage(from, { text: "🚫 You are banned." })
}

/* ---------------- OWNER ONLY ---------------- */
const ownerCommands = [".tagall", ".kick", ".hidetag"]

if (ownerCommands.includes(text.split(" ")[0]) && sender !== OWNER) {
return sock.sendMessage(from, { text: "❌ Owner only command." })
}

/* ---------------- COMMANDS ---------------- */

if (text === ".ping") {
return sock.sendMessage(from, { text: "🏓 Pong!" })
}

if (text === ".alive") {
return sock.sendMessage(from, { text: "🤖 Bot is alive!" })
}

if (text === ".time") {
return sock.sendMessage(from, {
text: "🕒 " + new Date().toLocaleTimeString()
})
}

if (text === ".menu") {
return sock.sendMessage(from, {
text: `
📌 MENU

.ping
.alive
.time
.ban
.unban
.tagall
.hidetag
.kick
`
})
}

/* ---------------- BAN ---------------- */
if (text.startsWith(".ban")) {
const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
if (!user) return sock.sendMessage(from, { text: "Tag user" })

global.bannedUsers.push(user)
return sock.sendMessage(from, { text: "🚫 User banned" })
}

/* ---------------- UNBAN ---------------- */
if (text.startsWith(".unban")) {
const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
global.bannedUsers = global.bannedUsers.filter(u => u !== user)
return sock.sendMessage(from, { text: "✅ Unbanned" })
}

/* ---------------- TAGALL ---------------- */
if (text === ".tagall") {

if (!from.endsWith("@g.us")) return

const meta = await sock.groupMetadata(from)

const users = meta.participants.map(p => p.id)

let txt = "📢 TAG ALL\n\n"
users.forEach(u => txt += "@" + u.split("@")[0] + "\n")

return sock.sendMessage(from, {
text: txt,
mentions: users
})
}

/* ---------------- HIDETAG ---------------- */
if (text.startsWith(".hidetag")) {

if (!from.endsWith("@g.us")) return

const meta = await sock.groupMetadata(from)
const users = meta.participants.map(p => p.id)

const msgText = text.replace(".hidetag", "").trim()

return sock.sendMessage(from, {
text: msgText || "👀 Hidden message",
mentions: users
})
}

/* ---------------- KICK ---------------- */
if (text.startsWith(".kick")) {

if (!from.endsWith("@g.us")) return

const user =
msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

if (!user) return sock.sendMessage(from, { text: "Tag user" })

await sock.groupParticipantsUpdate(from, [user], "remove")

return sock.sendMessage(from, { text: "👢 Kicked" })
}

/* ---------------- FAKE HACK (SAFE FUN CMD) ---------------- */
if (text.startsWith(".hack")) {

const num = text.replace(".hack", "").trim()

if (!num) return sock.sendMessage(from, { text: "Enter number" })

sock.sendMessage(from, { text: "💻 Starting hack simulation..." })

setTimeout(() => sock.sendMessage(from, { text: "🔍 scanning..." }), 2000)

setTimeout(() => sock.sendMessage(from, { text: "📡 processing..." }), 4000)

setTimeout(() =>
sock.sendMessage(from, {
text: `☠️ Simulation complete for ${num}`
}), 6000)

return
}

})

}
