import express from "express"
import cors from "cors"

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  downloadContentFromMessage
} from "@whiskeysockets/baileys"

import Pino from "pino"
import fs from "fs"

const app = express()

app.use(cors())

const PORT = process.env.PORT || 8080

app.get("/", (req, res) => {
  res.send("AKATSUKII-MD ONLINE ✅")
})

app.listen(PORT, () => {
  console.log("Server running on", PORT)
})

async function startBot(number) {

const { state, saveCreds } =
await useMultiFileAuthState("./session")

const { version } =
await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger: Pino({ level: "silent" }),
auth: state,
browser: ["AKATSUKII-MD", "Chrome", "1.0.0"]
})

sock.ev.on("creds.update", saveCreds)

if (!state.creds.registered) {

await new Promise(resolve =>
  setTimeout(resolve, 5000)
)

const code =
  await sock.requestPairingCode(number)

return code

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

return sock
        }
