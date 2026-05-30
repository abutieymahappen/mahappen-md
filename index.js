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

    // YOUR COMMANDS HERE

  })
}
     // OWNER
  if (text === ".owner") {

    await sock.sendMessage(from, {
      image: {
        url: "https://files.catbox.moe/i8oidw.jpg"
      },
  caption: `╭━━〔 👤 𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 〕━━⬣
    
𝐍𝐀𝐌𝐄: 𝗔𝗯𝘂𝘁𝗶𝗲𝘆𝗠𝗮𝗵𝗮𝗽𝗽𝗲𝗻
𝐑𝐎𝐋𝐄: 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥
𝐒𝐓𝐀𝐓𝐔𝐒: 𝗢𝗡𝗟𝗜𝗡𝗘
𝐒𝐘𝐒𝐓𝐄𝐌: 𝗔𝗖𝗧𝗜𝗩𝗘
𝐑𝐀𝐌/𝐂𝐏𝐔: 8𝗚𝗕

 "𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄•𝙈𝘿☘️"

╰━━━━━━━━━━━━━━⬣`
    })
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
  let message = "📢 TAGGING ALL MEMBERS😌"

  for (let p of participants) {

    members.push(p.id)

    message += `➤ @${p.id.split("@")[0]}\n`
  }

  await sock.sendMessage(from, {
    text: message,
    mentions: members
  })
  }

    
// UNBAN
if (text.startsWith(".unban")) {

  const mentioned =
    msg.message.extendedTextMessage
    ?.contextInfo?.mentionedJid?.[0]

  if (!mentioned) {
    return await sock.sendMessage(from, {
      text: "Tag someone to unban."
    })
  }

  global.bannedUsers =
    global.bannedUsers.filter(
      user => user !== mentioned
    )

  await sock.sendMessage(from, {
    text: "User unbanned from bot 🍀."
  })

  return
}
  
// BAN
if (text.startsWith(".ban")) {

  const mentioned =
    msg.message.extendedTextMessage
    ?.contextInfo?.mentionedJid?.[0]

  if (!mentioned) {

    return await sock.sendMessage(from, {
      text: " Tag someone to ban."
    })
  }

global.bannedUsers = global.bannedUsers || []

if (
  !global.bannedUsers.includes(mentioned)
) {
  global.bannedUsers.push(mentioned)
}

await sock.sendMessage(from, {
  text: "🚫 User banned from bot."
})

return
}
    //hidetag
if (text.startsWith(".hidetag")) {

  if (!from.endsWith("@g.us")) return

  const metadata =
    await sock.groupMetadata(from)

  const participants =
    metadata.participants.map(p => p.id)

  const hideText =
    text.replace(".hidetag", "").trim()

  await sock.sendMessage(from, {
    text: hideText || "👀 Hidetag Message",
    mentions: participants
  })
}

  //kick
  if (text.startsWith(".kick")) {

  if (!from.endsWith("@g.us")) return

  const mentioned =
    msg.message.extendedTextMessage
    ?.contextInfo?.mentionedJid?.[0]

  if (!mentioned) {
    return await sock.sendMessage(from, {
      text: " Tag someone."
    })
  }

  await sock.groupParticipantsUpdate(
    from,
    [mentioned],
    "remove"
  )

  await sock.sendMessage(from, {
    text: " User kicked."
  })
  }
  
  // TIME
  if (text === ".time") {
    const time = new Date().toLocaleTimeString()

    await sock.sendMessage(from, {
      text: `🕒 Time: ${time}`
    })
}
    
//ping
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
    
//Alive
  if (text === ".alive") {
    await sock.sendMessage(from, {
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
})


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
