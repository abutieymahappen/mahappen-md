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
      text: "🏓 Pong!"
    })
  }

  if (text === ".alive") {
    await sock.sendMessage(from, {
      text: "𝙈𝘼𝙃𝘼𝙋𝙋𝙀𝙉 𝙈𝘿 𝙄𝙎 𝘼𝙇𝙄𝙑𝙀 🥳"
    })
  }

  if (text === ".menu") {
    await sock.sendMessage(from, {
      image: {
        url: "https://files.catbox.moe/caxt5m.png"
      },
      caption: `╭──〔 *『𝗕𝗔𝗗𝗕𝗢𝗬-𝗠𝗗 𝗩1』* 〕──⬣
│
├ ⚡ .ping
├ 👤 .owner
├ 🧾 .menu
├ 🕒 .time
├ 🔥 .alive
│
╰────────────────⬣`
    })
  }
})


  sock.ev.on("connection.update", (update) => {
  const { connection, lastDisconnect } = update

  console.log("STATUS:", connection)

  if (connection === "open") {
    console.log("✅ WhatsApp Connected:", number)
  }

  if (connection === "close") {
    const code = lastDisconnect?.error?.output?.statusCode

    const shouldReconnect = code !== 401

    console.log("❌ Disconnected:", code)

    if (shouldReconnect) {
      console.log("🔄 Reconnecting...")
      startBot(number)
    } else {
      console.log("🧹 Logged out - delete session")
    }
  }
})
  /* =========================
     MENU COMMAND
  ========================= */
  
      
  /* =========================
     PAIRING CODE
  ========================= */
  if (!state?.creds?.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(number)
        console.log("🔥 PAIR CODE:", code)
      } catch (err) {
        console.log("PAIR ERROR:", err)
      }
    }, 3000)
  }
      }
