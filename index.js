import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"

import Pino from "pino"
import express from "express"

const app = express()

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("Bot running ✅")
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session")

  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: Pino({ level: "silent" }),
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  })

  // Save session
  sock.ev.on("creds.update", saveCreds)

  // Messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0]

  if (!msg.message) return

  const from = msg.key.remoteJid

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text

  // !ping command
  if (text === "!ping") {
    await sock.sendMessage(from, {
      text: "𝘗𝘰𝘯𝘨! 𝘚𝘦𝘳𝘷𝘦𝘳 𝘚𝘵𝘢𝘵𝘶𝘴: 𝘈𝘓𝘐𝘝𝘌 🥷!."
    })
  }

    // Auto reply
if (!text.startsWith("!")) {
  await sock.sendMessage(from, {
    text: " 么𝙰𝙱𝚄𝚃𝙸𝙴𝚈 𝙼𝙰𝙷𝙰𝙿𝙿𝙴𝙽么 『 𝙞𝙨 𝙤𝙛𝙛𝙡𝙞𝙣𝙚 𝙧𝙮𝙩 𝙣𝙤𝙬』
💬 𝙇𝙚𝙖𝙫𝙚 𝙖 𝙢𝙚𝙨𝙨𝙖𝙜𝙚, 𝙄’𝙡𝙡 𝙗𝙚 𝙗𝙖𝙘𝙠 𝙨𝙤𝙤𝙣 🔥."
  })
}

  // !owner command
  if (text === "!owner") {
    await sock.sendMessage(from, {
      text: "🥷ＯＷＮＥＲ ツ: A B U T I E Y亗M A H A P P E N𓃶"
    })
  }
})

// !menu command
if (text === "!menu") {
  await sock.sendMessage(from, {
    text: `╭──〔  *『𝘈𝘣𝘶𝘵𝘪𝘦𝘺𝘔𝘢𝘩𝘢𝘱𝘱𝘦𝘯𝘔𝘋』* 〕──⬣
│
├ 👑 Owner: 『𝘈𝘣𝘶𝘵𝘪𝘦𝘺𝘔𝘢𝘩𝘢𝘱𝘱𝘦𝘯』
├ ⚡ Status: Online
├ 🚀 Prefix: !
│
├──〔 📜 COMMANDS 〕
│
├ 🏓 !ping
├ 👑 !owner
├ 📋 !menu
│
╰────────────────⬣`
  })
    }

  // Connection updates
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log("✅ WhatsApp Connected")
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log("❌ Connection closed")

      if (shouldReconnect) {
        startBot()
      }
    }
  })

  // Pairing code
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER

    console.log("Using Number:", phoneNumber)

    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber)
        console.log("PAIR CODE:", code)
      } catch (err) {
        console.log(err)
      }
    }, 3000)
  }
}

startBot()
