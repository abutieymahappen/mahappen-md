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

app.get("/pair/:number", async (req, res) => {

try {

const code = await startBot(req.params.number)

res.json({
  success: true,
  code
})

} catch (err) {

res.json({
  success: false,
  error: err.message
})

}

})

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
app.get("/pair/:number", async (req, res) => {
  try {

    const code = await startBot(req.params.number)

    res.json({
      success: true,
      code
    })

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    })

  }
})
