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
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update

    console.log("STATUS:", connection)

    if (connection === "open") {
      console.log("✅ SOCKET READY")

      await sock.sendMessage("27687085163@s.whatsapp.net", {
        text: `⚡ 𝗔𝗞𝗔𝗧𝗦𝗨𝗞𝗜-𝗠𝗗 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 COMPLETE`
      })
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

  /* ================= MESSAGES ================= */
  sock.ev.on("messages.upsert", async ({ messages }) => {

    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

          text: "𝙈𝘼𝙃𝘼𝙋𝙋𝙀𝙉 𝙈𝘿 𝙄𝙎 𝘼𝙇𝙄𝙑𝙀 🥳"
    })
  }

  
// .menu command
if (text === ".menu") {
await sock.sendMessage(from, {
image: {
url: "https://files.catbox.moe/dg9pcn.png"
},
caption: `╭──〔 *『𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝗠𝗗 𝗩1』* 〕──⬣
│
├ 🥷 𝗢𝗪𝗡𝗘𝗥: 『𝐀𝐁𝐔𝐓𝐈𝐄𝐘 𝐌𝐀𝐇𝐀𝐏𝐏𝐄𝐍』
├ 𝗦𝗧𝗔𝗧𝗨𝗦: 𝖮𝖭𝖫𝖨𝖭𝖤
├ 𝗣𝗥𝗘𝗙𝗜𝗫: .
│
╭──〔 ☘️𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎☘️ 〕──⬣
│
├ ⚡ .ping
├ 👤 .owner
├ 🧾 .menu
├ 🕒 .time
├ 🔥 .alive
├ 🚫 .ban
├ ♻️ .unban
├ 💣 .kick
├ 📢 .tagall
├ 👻 .hidetag
│
╰────────────────⬣`
})
}


  sock.ev.on("connection.update", async (update) => {
  const { connection } = update

  console.log("STATUS:", connection)

  if (connection === "open") {
    console.log("✅ SOCKET READY")

    // NOW it's safe
    await sock.sendMessage("27687085163@s.whatsapp.net", {
      text: `⚡ 𝗔𝗞𝗔𝗧𝗦𝗨𝗞𝗜-𝗠𝗗 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 COMPLETE

🤖 System Online
🔐 Secure Session Active`
    })
  }
})
//Sp@ce
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
}
  /* =========================
     MENU COMMAND
  ========================= */
  
      
  /* =========================
     PAIRING CODE
  ========================= */
sock.ev.on("connection.update", (update) => {
  const { connection, lastDisconnect } = update

  console.log("STATUS:", connection)

  if (connection === "close") {
    const shouldReconnect =
      lastDisconnect?.error?.output?.statusCode !== 401

    console.log("❌ Disconnected")

    if (shouldReconnect) {
      console.log("🔄 Reconnecting...")
      startBot(number)
    } else {
      console.log("🧹 Logged out - delete session")
    }
  }

  if (connection === "open") {
    console.log("✅ WhatsApp Connected:", number)
  }
})
  })
}
     
