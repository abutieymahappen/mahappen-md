import express from "express"
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"

import Pino from "pino"
import cors from "cors"

app.use(cors())

const app = express()
const PORT = process.env.PORT || 3000

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
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  if (!state.creds.registered) {
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

app.get("/pair/:number", async (req, res) => {

  try {

    const code =
      await startBot(req.params.number)

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
