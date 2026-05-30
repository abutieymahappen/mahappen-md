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

const OWNER = "27687085163@s.whatsapp.net"

app.get("/", (req, res) => {
res.send("Bot running ✅")
})

app.listen(PORT, () => {
console.log("Server running on", PORT)
})

/* =========================
   PAIR ROUTE (FIXED)
========================= */
app.get("/pair/:number", async (req, res) => {

const number = req.params.number

try {

// FORCE CLEAN SESSION
const sessionPath = `session/${number}`

if (fs.existsSync(sessionPath)) {
fs.rmSync(sessionPath, { recursive: true, force: true })
}

console.log("🚀 Pair request:", number)

await startBot(number)

res.send(`
<h2>BADBOY-MD</h2>
<p>Pairing started for:</p>
<b>${number}</b>
<p>Check Termux for code</p>
`)

} catch (err) {
console.log(err)
res.status(500).send(err.message)
}

})

/* =========================
   START BOT (FIXED)
========================= */
async function startBot(number) {

if (bots[number]) {
console.log("♻️ Restarting existing bot:", number)
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

//COMMANDS
sock.ev.on("messages.upsert", async ({ messages }) => {

  const msg = messages[0]
  if (!msg.message) return

  const from = msg.key.remoteJid

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    ""
   
//PING
   if (text === ".ping") {

  const start = Date.now()

  await sock.sendMessage(from, { text: " Pinging..." })

  const latency = Date.now() - start

  await sock.sendMessage(from, {
    text: `*PONG!*
Latency: ${latency}ms`
  })

  return
}

   //!owner command
if (text === ".owner") {
  await sock.sendMessage(from, {
    video: {
      url: "https://files.catbox.moe/radehm.mp4"
    },
    gifPlayback: true,
    caption: `╭━━〔 👤 𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 〕━━⬣
    
𝐍𝐀𝐌𝐄: 𝗔𝗯𝘂𝘁𝗶𝗲𝘆𝗠𝗮𝗵𝗮𝗽𝗽𝗲𝗻
𝐑𝐎𝐋𝐄:  𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥
𝐒𝐓𝐀𝐓𝐔𝐒: 𝗢𝗡𝗟𝗜𝗡𝗘
𝐒𝐘𝐒𝐓𝐄𝐌: 𝗔𝗖𝗧𝗜𝗩𝗘
𝐑𝐀𝐌/𝐂𝐏𝐔 : 8𝗚𝗕

 "AKATSUKI-MD"

╰━━━━━━━━━━━━━━⬣`
  })

  return
}
   //Time
if (text === ".time") {
const time = new Date().toLocaleTimeString()

await sock.sendMessage(from, {
text: `🕒 Time: ${time}`
})

return
}

   //tagall
  if (text === ".tagall") {

  if (!from.endsWith("@g.us")) {
    return await sock.sendMessage(from, {
      text: "❌ Group only."
    })
  }

  const metadata =
    await sock.groupMetadata(from)

  const participants =
    metadata.participants

  let members = []
  let message = "📢 TAGGING ALL MEMBERS\n\n"

  for (let p of participants) {

    members.push(p.id)

    message += `➤ @${p.id.split("@")[0]}\n`
  }

  await sock.sendMessage(from, {
    text: message,
    mentions: members
  })
      }
     
   //MENU
  if (text === ".menu") {
    await sock.sendMessage(from, {
      image: {
        url: "https://files.catbox.moe/dg9pcn.png"
      },
      caption: `╭──〔 *『𝗕𝗔𝗗𝗕𝗢𝗬-𝗠𝗗 𝗩1』* 〕──⬣
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
├ 👀 .vv
├ 🚫 .ban
├ ♻️ .unban
├ 💣 .kick
├ 📢 .tagall
├ 👻 .hidetag
│
╰────────────────⬣`
    })

    return
  }
   })

/* =========================
   CONNECTION FIXED
========================= */
sock.ev.on("connection.update", (update) => {

const { connection, lastDisconnect } = update

if (connection === "open") {
console.log("✅ WhatsApp Connected:", number)
}

if (connection === "close") {

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

console.log("❌ Disconnected")

if (shouldReconnect) {
console.log("🔄 Reconnecting...")
startBot(number)
}
}
})

/* =========================
   PAIRING CODE (FIXED CORE)
========================= */
if (!state.creds.registered) {

setTimeout(async () => {
try {

const code = await sock.requestPairingCode(number)

console.log("🔥 PAIRING CODE:", code)

} catch (err) {
console.log("PAIR ERROR:", err.message)
}

}, 3000)

}

  }
