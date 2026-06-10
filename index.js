import express from "express"
import makeWASocket, {
useMultiFileAuthState,
fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"
import Pino from "pino"

const app = express()
const PORT = process.env.PORT || 10000

app.get("/", (req, res) => {
res.send("AKATSUKII-MD ONLINE ✅")
})

app.listen(PORT, () => {
console.log("Server running on ${PORT}")
})

async function startBot() {

const { state, saveCreds } =
await useMultiFileAuthState("./session")

const { version } =
await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
auth: state,
logger: Pino({ level: "silent" }),
browser: ["AKATSUKII-MD", "Chrome", "1.0.0"]
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async ({ connection }) => {

if (connection === "open") {
  console.log("✅ WhatsApp Connected")
}

})

if (!state.creds.registered) {

const code =
  await sock.requestPairingCode("27687085163")

console.log(`

========================
PAIR CODE
${code}

`)
}

sock.ev.on("messages.upsert", async ({ messages }) => {

const msg = messages[0]
if (!msg.message) return

const from = msg.key.remoteJid

const text =
  msg.message.conversation ||
  msg.message.extendedTextMessage?.text ||
  ""

if (text === ".ping") {
  await sock.sendMessage(from, {
    text: "🏓 PONG"
  })
}

if (text === ".alive") {
  await sock.sendMessage(from, {
    text: "🤖 AKATSUKII-MD ONLINE"
  })
}

})

}

startBot()
