import express from "express"
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"

import Pino from "pino"
import fs from "fs"

const app = express()
const PORT = 3000

app.listen(PORT, () => {
  console.log("Server running on", PORT)
})

/* =========================
   PAIR ROUTE
========================= */
app.get("/pair/:number", async (req, res) => {
  const number = req.params.number

  console.log("PAIR REQUEST:", number)

  try {
    if (fs.existsSync(`session/${number}`)) {
      fs.rmSync(`session/${number}`, { recursive: true, force: true })
    }

    await startBot(number)

    res.send(`Pairing started for ${number}`)
  } catch (err) {
    console.log("ERROR:", err)
    res.status(500).send("Failed")
  }
})

/* =========================
   BOT START
========================= */
async function startBot(number) {

  const { state, saveCreds } =
    await useMultiFileAuthState(`session/${number}`)

  const { version } =
    await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: Pino({ level: "silent" }),
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  /* ================= CONNECTION ================= */
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    console.log("STATUS:", connection)

    if (connection === "open") {
      console.log("✅ AKATSUKI-MD ONLINE")
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = code !== 401

      console.log("❌ Disconnected:", code)

      if (shouldReconnect) {
        console.log("🔄 Reconnecting...")
        startBot(number)
      } else {
        console.log("🧹 Session removed")
      }
    }
  })

  /* ================= MESSAGES ================= */
  sock.ev.on("messages.upsert", async ({ messages }) => {

    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    /* ================= COMMANDS ================= */

    if (text === ".menu") {
      await sock.sendMessage(from, {
        image: {
          url: "https://files.catbox.moe/caxt5m.png"
        },
        caption: `🥷 AKATSUKI-MD MENU

⚡ .ping
👤 .owner
🧾 .menu
🕒 .time
🔥 .alive`
      })
    }

    if (text === ".alive") {
      await sock.sendMessage(from, {
        text: "🥷 AKATSUKI-MD IS ALIVE ⚡"
      })
    }

    if (text === ".ping") {
      const start = Date.now()
      await sock.sendMessage(from, { text: "Pinging..." })
      const end = Date.now()

      await sock.sendMessage(from, {
        text: `PONG ⚡ ${end - start}ms`
      })
    }
  })
      }
