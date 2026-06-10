import express from "express"
import cors from "cors"
import fs from "fs"
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from "@whiskeysockets/baileys"
import Pino from "pino"

const app = express()
const PORT = process.env.PORT || 10000

app.use(cors())

app.get("/", (_, res) => {
  res.send("AKATSUKII-MD ONLINE ✅")
})

app.get("/pair", async (_, res) => {
  try {

    const number = "27687085163"

    if (fs.existsSync("./session")) {
      fs.rmSync("./session", {
        recursive: true,
        force: true
      })
    }

    const { state, saveCreds } =
      await useMultiFileAuthState("./session")

    const { version } =
      await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      version,
      auth: state,
      logger: Pino({ level: "silent" }),
      browser: ["Chrome", "Linux", "120"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update

      console.log("Connection:", connection)

      if (connection === "close") {
        console.log(
          lastDisconnect?.error || "Disconnected"
        )
      }
    })

    await new Promise(r => setTimeout(r, 3000))

    const code =
      await sock.requestPairingCode(number)

    return res.json({
      success: true,
      code
    })

  } catch (err) {
    console.error(err)

    return res.json({
      success: false,
      error: err.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})
