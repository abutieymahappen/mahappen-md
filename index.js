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
const store = new Map()

global.bannedUsers = global.bannedUsers || []

// STORE FOLDER
if (!fs.existsSync("./store")) {
  fs.mkdirSync("./store")
}

/* =========================
   SERVER
========================= */
app.get("/", (req, res) => {
  res.send("Bot running ✅")
})

app.listen(PORT, () => {
  console.log("Server running on", PORT)
})

/* =========================
   PAIR ROUTE
========================= */
app.get("/pair/:number", async (req, res) => {
  const number = req.params.number

  try {
    const sessionPath = `session/${number}`

    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true })
    }

    await startBot(number)

    res.send(`
      <h2>AKATSUKI-MD</h2>
      <p>Pairing started for:</p>
      <b>${number}</b>
    `)

  } catch (err) {
    res.status(500).send(err.message)
  }
})

/* =========================
   START BOT
========================= */
async function startBot(number) {

  if (bots[number]) {
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
     MESSAGE HANDLER
  ========================= */
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const id = msg.key.id
    const from = msg.key.remoteJid

    if (global.bannedUsers.includes(from)) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    // SAVE MESSAGE SAFELY
    store.set(id, {
      from,
      sender: msg.key.participant || from,
      text,
      file: null
    })

    const data = store.get(id)

    /* =========================
       MEDIA SAVE
    ========================= */

    if (msg.message.imageMessage) {
      const buffer = await sock.downloadMediaMessage(msg)
      if (!buffer) return

      fs.writeFileSync(`./store/${id}.jpg`, buffer)

      if (data) data.file = `${id}.jpg`
    }

    if (msg.message.videoMessage) {
      const buffer = await sock.downloadMediaMessage(msg)
      if (!buffer) return

      fs.writeFileSync(`./store/${id}.mp4`, buffer)

      if (data) data.file = `${id}.mp4`
    }

    if (msg.message.audioMessage) {
      const buffer = await sock.downloadMediaMessage(msg)
      if (!buffer) return

      fs.writeFileSync(`./store/${id}.mp3`, buffer)

      if (data) data.file = `${id}.mp3`
    }

    /* =========================
       COMMANDS
    ========================= */

    if (text === ".ping") {
      const start = Date.now()
      await sock.sendMessage(from, { text: "Pinging..." })
      const latency = Date.now() - start

      return sock.sendMessage(from, {
        text: `PONG! ${latency}ms`
      })
    }

    if (text === ".alive") {
      return sock.sendMessage(from, {
        text: "AKATSUKI-MD IS ALIVE 🥳"
      })
    }

    if (text === ".menu") {
      return sock.sendMessage(from, {
        text: "Menu working ✅"
      })
    }

    /* =========================
       BAN
    ========================= */
    if (text.startsWith(".ban")) {
      const mentioned =
        msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

      if (!mentioned) return

      if (!global.bannedUsers.includes(mentioned)) {
        global.bannedUsers.push(mentioned)
      }

      return sock.sendMessage(from, {
        text: "User banned 🚫"
      })
    }

    /* =========================
       UNBAN
    ========================= */
    if (text.startsWith(".unban")) {
      const mentioned =
        msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

      if (!mentioned) return

      global.bannedUsers =
        global.bannedUsers.filter(u => u !== mentioned)

      return sock.sendMessage(from, {
        text: "User unbanned ✅"
      })
    }
  })

  /* =========================
     ANTI DELETE
  ========================= */
  sock.ev.on("messages.update", async (updates) => {
    for (const u of updates) {

      if (u.update.message === null) {

        const id = u.key.id
        const data = store.get(id)

        if (!data) continue

        const chat = u.key.remoteJid

        // TEXT DELETE
        if (!data.file) {
          return sock.sendMessage(chat, {
            text:
`👻 DELETED MESSAGE

👤 ${data.sender}
💬 ${data.text}`
          })
        }

        const filePath = `./store/${data.file}`

        // IMAGE
        if (data.file.endsWith(".jpg")) {
          return sock.sendMessage(chat, {
            image: fs.readFileSync(filePath),
            caption: `👻 Deleted Image\n👤 ${data.sender}`
          })
        }

        // VIDEO
        if (data.file.endsWith(".mp4")) {
          return sock.sendMessage(chat, {
            video: fs.readFileSync(filePath),
            caption: `👻 Deleted Video\n👤 ${data.sender}`
          })
        }

        // AUDIO
        if (data.file.endsWith(".mp3")) {
          return sock.sendMessage(chat, {
            audio: fs.readFileSync(filePath),
            mimetype: "audio/mp4"
          })
        }
      }
    }
  })

  /* =========================
     CONNECTION
  ========================= */
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log("Connected:", number)
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      if (shouldReconnect) {
        startBot(number)
      }
    }
  })
  }
