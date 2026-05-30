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
