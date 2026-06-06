import express from "express"
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  downloadContentFromMessage
} from "@whiskeysockets/baileys"

import Pino from "pino"
import fs from "fs"



//BANNED USERS
global.bannedUsers = global.bannedUsers || []
const CHANNEL = "https://whatsapp.com/channel/0029Vb7pS7WFi8xW1FwMAX1p"
const app = express()
const PORT = process.env.PORT || 8080
const startTime = Date.now()
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

const code = await startBot(number)

//await sock.sendMessage(from, {
 // text: `🔑 Pair Code: ${code}`
//})
   
res.send(`
<h2>🤖 AKATSUKII-MD</h2>

<pre>

╔════════════════════════════╗
║        BOT UI PANEL        ║
╠════════════════════════════╣
║ 📱 Number: ${number}       ║
║                            ║
║ ⏳ Status: Generating...   ║
║                            ║
║ ⚡ Please wait...          ║
╠════════════════════════════╣
║ AKATSUKII-MD BOT SYSTEM    ║
║ © 2026 ABUTIEY MAHAPPEN    ║
╚════════════════════════════╝

</pre>
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

console.log("🔄 Requesting pairing code for:", number)

const sock = makeWASocket({
  version,
  logger: Pino({ level: "silent" }),
  auth: state,
  browser: ["Ubuntu", "Chrome", "20.0.04"]
})

bots[number] = sock

sock.ev.on("creds.update", saveCreds)

/* =========================
   PAIRING CODE
========================= */
if (!state.creds.registered) {

  try {

    const code = await sock.requestPairingCode(number)

    console.log(`
╔════════════════════════════╗
║     AKATSUKII-MD PAIR      ║
╠════════════════════════════╣
║ ${number}
║ ${code}
╚════════════════════════════╝
`)

    return code

  } catch (err) {

    console.log("❌ PAIR ERROR:", err)
    return null

  }

   }
//COMMANDS
sock.ev.on("messages.upsert", async ({ messages }) => {

  const msg = messages[0]
  if (!msg.message) return

  const from = msg.key.remoteJid

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    ""

   //VV
   const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function viewonceCommand(sock, chatId, message) {
    // Extract quoted imageMessage or videoMessage from your structure
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedImage = quoted?.imageMessage;
    const quotedVideo = quoted?.videoMessage;

    if (quotedImage && quotedImage.viewOnce) {
        // Download and send the image
        const stream = await downloadContentFromMessage(quotedImage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(chatId, { image: buffer, fileName: 'media.jpg', caption: quotedImage.caption || '' }, { quoted: message });
    } else if (quotedVideo && quotedVideo.viewOnce) {
        // Download and send the video
        const stream = await downloadContentFromMessage(quotedVideo, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(chatId, { video: buffer, fileName: 'media.mp4', caption: quotedVideo.caption || '' }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { text: '❌ Please reply to a view-once image or video.' }, { quoted: message });
    }
}

module.exports = viewonceCommand;
   
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
    text: hideText || "👀 𝙃𝙄𝘿𝙀𝙏𝘼𝙂 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 』",
    mentions: participants
  })
}
   
//PAIR
if (text.startsWith(".pair ")) {

  const target = text.split(" ")[1]

  if (!target) {
    return await sock.sendMessage(from, {
      text: "📱 Usage:\n.pair 276xxxxxxxxx"
    })
  }

  await sock.sendMessage(from, {
    text: `⏳ Generating pair code for ${target}...`
  })

  try {

    const code = await startBot(target)

    if (!code) {
      return await sock.sendMessage(from, {
        text: "❌ Failed to generate pair code."
      })
    }

    await sock.sendMessage(from, {
      text: `╔════════════════════╗
║ AKATSUKII-MD PAIR ║
╠════════════════════╣
║ 📱 ${target}
║ 🔑 ${code}
╚════════════════════╝`
    })

  } catch (err) {

    await sock.sendMessage(from, {
      text: `❌ Error:\n${err.message}`
    })

  }

   }
   //ALIVE
   
  if (text === ".alive") {
    await sock.sendMessage(from, {
      text: "𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝗠𝗗  𝙄𝙎 𝘼𝙇𝙄𝙑𝙀 🥳"
    })
  }

   //Channel
   if (text === ".channel") {
  return sock.sendMessage(from, {
    text: `📢 *『 𝙊𝙁𝙁𝙄𝘾𝙄𝘼𝙇 𝘾𝙃𝘼𝙉𝙉𝙀𝙇 』*

${CHANNEL}

☘️『 𝙁𝙊𝙇𝙇𝙊𝙒 𝙁𝙊𝙍 𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝙈𝘿 𝙐𝙋𝘿𝘼𝙏𝙀𝙎 』`
  })
   }
   
   //ANTI LINK
   if (text.includes("chat.whatsapp.com")) {
  if (!from.endsWith("@g.us")) return

  await sock.sendMessage(from, {
    text: "🚫 Links not allowed!"
  })

  await sock.sendMessage(from, {
    delete: msg.key
  })

  return
   }
   //BOT INFO
   if (text === ".info") {
  await sock.sendMessage(from, {
    text: `『 🤖 𝘽𝙤𝙩 𝙞𝙨 𝙧𝙪𝙣𝙣𝙞𝙣𝙜 』
『 📡 𝙎𝙩𝙖𝙩𝙪𝙨: 𝙊𝙣𝙡𝙞𝙣𝙚 』
『 ⚡ 𝙎𝙥𝙚𝙚𝙙: 𝙎𝙩𝙖𝙗𝙡𝙚 』
『 ☘️ 𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝙈𝘿 』`
})

  return
   }

   //RUN TIME
   if (text === ".run") {

const runtime = Math.floor((Date.now() - startTime) / 1000)

const hours = Math.floor(runtime / 3600)
const minutes = Math.floor((runtime % 3600) / 60)
const seconds = runtime % 60

await sock.sendMessage(from, {
text: `🤖『 𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝙈𝘿 𝙍𝙐𝙉𝙏𝙄𝙈𝙀 』

⏳ ${hours}h ${minutes}m ${seconds}s`
})

return
   }

   //LOCK GROUP 
   if (text === ".lock") {

if (!from.endsWith("@g.us")) return

await sock.groupSettingUpdate(
from,
"announcement"
)

await sock.sendMessage(from, {
text: "☘️『 𝙂𝙍𝙊𝙐𝙋 𝙇𝙊𝘾𝙆𝙀𝘿 𝘽𝙔 𝘼𝘿𝙈𝙄𝙉 』☘️."
})

return
   }

   //UNLOCK GROUP
   if (text === ".unlock") {

if (!from.endsWith("@g.us")) return

await sock.groupSettingUpdate(
from,
"not_announcement"
)

await sock.sendMessage(from, {
text: "『 𝙂𝙍𝙊𝙐𝙋 𝙐𝙉𝙇𝙊𝘾𝙆𝙀𝘿 𝘽𝙔 𝘼𝘿𝙈𝙄𝙉 』🟢."
})

return
   }
   
   //kick
  if (text.startsWith(".kick")) {

  if (!from.endsWith("@g.us")) return

  const mentioned =
    msg.message.extendedTextMessage
    ?.contextInfo?.mentionedJid?.[0]

  if (!mentioned) {
    return await sock.sendMessage(from, {
      text: " 『 𝙏𝘼𝙂 𝙎𝙊𝙈𝙀𝙊𝙉𝙀 』."
    })
  }

  await sock.groupParticipantsUpdate(
    from,
    [mentioned],
    "remove"
  )

  await sock.sendMessage(from, {
    text: "『 𝙐𝙎𝙀𝙍 𝙆𝙄𝘾𝙆𝙀𝘿 』."
  })
  }
//ANTI-SPAM
if (
  text.length > 500
) {

  await sock.sendMessage(from, {
    text:
" 『 𝙎𝙋𝘼𝙈 𝘿𝙀𝙏𝙀𝘾𝙏𝙀𝘿 • 𝙋𝙇𝙀𝘼𝙎𝙀 𝙎𝙏𝙊𝙋 』❗."
  })

  return
}

   //PROMOTE 
   if (text.startsWith(".promote")) {

if (!from.endsWith("@g.us")) return

const user =
msg.message.extendedTextMessage
?.contextInfo?.mentionedJid?.[0]

if (!user) return

await sock.groupParticipantsUpdate(
from,
[user],
"promote"
)

await sock.sendMessage(from, {
text: "👑 『 𝙐𝙎𝙀𝙍 𝙋𝙍𝙊𝙈𝙊𝙏𝙀𝘿 𝘽𝙔 𝘼𝘿𝙈𝙄𝙉 』."
})

return
   }

   //DEMOTE
   if (text.startsWith(".demote")) {

if (!from.endsWith("@g.us")) return

const user =
msg.message.extendedTextMessage
?.contextInfo?.mentionedJid?.[0]

if (!user) return

await sock.groupParticipantsUpdate(
from,
[user],
"demote"
)

await sock.sendMessage(from, {
text: "『 𝘼𝘿𝙈𝙄𝙉 𝙍𝙀𝙈𝙊𝙑𝙀𝘿 』🗑️."
})

return
   }
   
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
    image: {
      url: "https://files.catbox.moe/i8oidw.jpg"
    },
    caption: `╭━━〔 👤 𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 〕━━⬣
    
𝐍𝐀𝐌𝐄: 𝗔𝗯𝘂𝘁𝗶𝗲𝘆𝗠𝗮𝗵𝗮𝗽𝗽𝗲𝗻
𝐑𝐎𝐋𝐄:  𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥
𝐒𝐓𝐀𝐓𝐔𝐒: 𝗢𝗡𝗟𝗜𝗡𝗘
𝐒𝐘𝐒𝐓𝐄𝐌: 𝗔𝗖𝗧𝗜𝗩𝗘
𝐑𝐀𝐌/𝐂𝐏𝐔 : 8𝗚𝗕

 "𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝗠𝗗"
╰━━━━━━━━━━━━━━⬣`
  })

  return
}


   //UNBAN
if(text.startsWith(".unban")) {

  const mentioned =
    msg.message.extendedTextMessage
    ?.contextInfo?.mentionedJid?.[0]

  if (!mentioned) {

    return await sock.sendMessage(from, {
      text: " 『 𝙏𝘼𝙂 𝙎𝙊𝙈𝙀𝙊𝙉𝙀 𝙏𝙊 𝙐𝙉𝘽𝘼𝙉 ♻️."
    })
  }

  global.bannedUsers =
    global.bannedUsers.filter(
      user => user !== mentioned
    )

  await sock.sendMessage(from, {
    text: "『 𝙐𝙎𝙀𝙍 𝙐𝙉𝘽𝘼𝙉𝙉𝙀𝘿 𝙁𝙍𝙊𝙈 𝘽𝙊𝙏 』🍀."
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
      text: "『 𝙏𝘼𝙂 𝙎𝙊𝙈𝙀𝙊𝙉𝙀 𝙏𝙊 𝘽𝘼𝙉 』🚫."
    })
  }

  if (
    !global.bannedUsers.includes(mentioned)
  ) {

    global.bannedUsers.push(mentioned)
  }

  await sock.sendMessage(from, {
    text: "『 𝙐𝙎𝙀𝙍 𝙐𝙉𝘽𝘼𝙉𝙉𝙀𝘿 𝙁𝙍𝙊𝙈 𝘽𝙊𝙏 』."
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
      text: "『 𝙂𝙍𝙊𝙐𝙋𝙎 𝙊𝙉𝙇𝙔 』❕."
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
      caption: `╭──〔 *『𝘼𝙆𝘼𝙏𝙎𝙐𝙆𝙄-𝗠𝗗 𝗩1』* 〕──⬣
│
├ 🥷 𝗢𝗪𝗡𝗘𝗥: 『𝐀𝐁𝐔𝐓𝐈𝐄𝐘 𝐌𝐀𝐇𝐀𝐏𝐏𝐄𝐍』
├ 𝗦𝗧𝗔𝗧𝗨𝗦: 𝖮𝖭𝖫𝖨𝖭𝖤
├ 𝗣𝗥𝗘𝗙𝗜𝗫: .
│
╭──〔 ☘️𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎☘️ 〕──⬣
│
├ 『 .ping 』
├ 『 .owner 』
├ 『 .menu 』
├ 『 .time 』
├ 『 .alive 』
├ 『 .clear 』
├ 『 .ban 』
├ 『 .unban 』
├ 『 .kick 』
├ 『 .tagall 』
├ 『 .hidetag 』
├ 『 .info 』
├ 『 .channel 』
├ 『 .run 』
├ 『 .lock 』
├ 『 .unlock 』
├ 『 .promote 』
├ 『 .demote 』
├ 『 .tts 』𝐍𝐄𝐖
├ 『 .restart 』𝐂𝐎𝐌𝐈𝐍𝐆 𝐒𝐎𝐎𝐍
├ 『 .shutdown 』𝐂𝐎𝐌𝐈𝐍𝐆 𝐒𝐎𝐎𝐍
|
|•𝙈𝙊𝙍𝙀 𝙁𝙀𝘼𝙏𝙐𝙍𝙀𝙎 𝘾𝙊𝙈𝙄𝙉𝙂 𝙎𝙊𝙊𝙉 • 𝙎𝙏𝘼𝙔 𝙏𝙐𝙉𝙀𝘿⚡
╰────────────────⬣`
    })

    return
  }
   })

/* =========================
   CONNECTION FIXED
========================= */
sock.ev.on("connection.update", async (update) => {

  const { connection, lastDisconnect } = update

  if (connection === "open") {
    console.log("✅ WhatsApp Connected:", number)
  }

  if (connection === "close") {

    console.log("❗ Disconnected")

    const shouldReconnect =
      lastDisconnect?.error?.output?.statusCode !==
      DisconnectReason.loggedOut

    if (shouldReconnect && state.creds.registered) {

      console.log("🔄 Reconnecting...")

      setTimeout(() => {
        startBot(number)
      }, 3000)

    }

  }

})
/* =========================
   PAIRING CODE
========================= */
if (!state.creds.registered) {

  try {

    const code = await sock.requestPairingCode(number)

    console.log("PAIR:", code)

    return code

  } catch (err) {

    console.log("❌ PAIR ERROR:", err)
    return null

  }

}

} // closes startBot()

startBot("27687085163")
