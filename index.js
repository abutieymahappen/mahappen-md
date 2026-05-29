import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"

import Pino from "pino"
import express from "express"

const app = express()

const PORT = process.env.PORT || 3000

// WEBSITE
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>

  <html>

  <head>

    <title>MAHAPPEN MD</title>

    <style>

      body{
        background:black;
        color:white;
        font-family:Arial;
        text-align:center;
        padding-top:100px;
      }

      .box{
        width:350px;
        margin:auto;
        border:1px solid #00ff66;
        border-radius:20px;
        padding:40px;
        box-shadow:0 0 20px #00ff66;
      }

      h1{
        color:#00ff66;
        text-shadow:0 0 20px #00ff66;
      }

      p{
        color:#ccc;
        margin-top:15px;
      }

      button{
        margin-top:25px;
        padding:15px 35px;
        border:none;
        border-radius:12px;
        background:#00ff66;
        color:black;
        font-weight:bold;
        cursor:pointer;
        font-size:16px;
      }

      button:hover{
        transform:scale(1.05);
      }

    </style>

  </head>

  <body>

    <div class="box">

      <h1>MAHAPPEN MD</h1>

      <p>WhatsApp Bot Online ✅</p>

      <p>Powered By Baileys</p>

      <button>ACTIVATE BOT</button>

    </div>

  </body>

  </html>
  `)
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})

async function startBot() {

  const { state, saveCreds } =
    await useMultiFileAuthState("session")

  const { version } =
    await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: Pino({ level: "silent" }),
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  })

  // Save session
  sock.ev.on("creds.update", saveCreds)

  // MESSAGE STORE
  const store = {}

  // Anti Delete
  sock.ev.on("messages.update", async (updates) => {

    for (const update of updates) {

      if (update.update.message === null) {

        const key = update.key

        const deletedMsg = store[key.id]

        if (!deletedMsg) return

        const owner =
          "27687085163@s.whatsapp.net"

        const message =
          deletedMsg.message.conversation ||
          deletedMsg.message.extendedTextMessage?.text ||
          "[Media Message]"

        await sock.sendMessage(owner, {
          text:
`🚨 Deleted Message Detected

👤 User: ${key.participant || key.remoteJid}

📝 Message:
${message}`
        })
      }
    }
  })

  // MESSAGES
  sock.ev.on("messages.upsert", async ({ messages }) => {

    const msg = messages[0]

    if (!msg.message) return

    // SAVE MESSAGE
    store[msg.key.id] = msg

    const from = msg.key.remoteJid

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    // .ping
    if (text === ".ping") {

      const start = Date.now()
      const end = Date.now()

      const speed = end - start

      await sock.sendMessage(from, {
        text:
`*PONG!*

BotStatus: Online
Speed: ${speed}ms
Node: Active`
      })

      return
    }

    // .owner
    if (text === ".owner") {

      await sock.sendMessage(from, {
        text:
"ＯＷＮＥＲ ツ: A B U T I E Y亗M A H A P P E N"
      })

      return
    }

    // .time
    if (text === ".time") {

      const time =
        new Date().toLocaleTimeString()

      await sock.sendMessage(from, {
        text: `🕒 Time: ${time}`
      })

      return
    }

    // .alive
    if (text === ".alive") {

      await sock.sendMessage(from, {
        text:
"𝙈𝘼𝙃𝘼𝙋𝙋𝙀𝙉 𝙈𝘿 𝙄𝙎 𝘼𝙇𝙄𝙑𝙀 & 𝙍𝙐𝙉𝙉𝙄𝙉𝙂🥳."
      })

      return
    }

    // .menu
    if (text === ".menu") {

      await sock.sendMessage(from, {
        text:
`╭──〔 *『𝘈𝘣𝘶𝘵𝘪𝘦𝘺𝘔𝘢𝘩𝘢𝘱𝘱𝘦𝘯𝘔𝘋』* 〕──⬣
│
├ 🥷 Owner: 『𝐀𝐁𝐔𝐓𝐈𝐄𝐘 𝐌𝐀𝐇𝐀𝐏𝐏𝐄𝐍』
├ Status: Online
├ Prefix: .
│
╭──〔 ☘️𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎☘️ 〕──⬣
│
├ 💣 𝙿𝙸𝙽𝙶 : .ping
├ 🥷 𝙾𝚆𝙽𝙴𝚁 : .owner
├ 🔮 𝙼𝙴𝙽𝚄 : .menu
├ ⌚ 𝚃𝙸𝙼𝙴 : .time
├ 💀 𝙰𝙽𝚃𝙸 𝙳𝙴𝙻𝙴𝚃𝙴 : .antidelete
├ ⚔️ 𝙰𝙻𝙸𝚅𝙴 : .alive
│
╰────────────────⬣`
      })

      return
    }

  })

  // Connection updates
  sock.ev.on("connection.update", async (update) => {

    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log("✅ WhatsApp Connected")
    }

    if (connection === "close") {

      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode
        !== DisconnectReason.loggedOut

      console.log("❌ Connection closed")

      if (shouldReconnect) {
        startBot()
      }
    }
  })

  // Pairing code
  if (!sock.authState.creds.registered) {

    const phoneNumber =
      process.env.PHONE_NUMBER

    console.log("Using Number:", phoneNumber)

    setTimeout(async () => {

      try {

        const code =
          await sock.requestPairingCode(phoneNumber)

        console.log("PAIR CODE:", code)

      } catch (err) {

        console.log(err)
      }

    }, 3000)
  }
}

startBot()
