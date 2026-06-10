import express from "express"
import cors from "cors"
import fs from "fs"
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"
import Pino from "pino"

const app = express()
const PORT = process.env.PORT || 10000

app.use(cors())

app.get("/", (req, res) => {
  res.send("AKATSUKII-MD PAIR API ONLINE ✅")
})

app.get("/pair/:number", async (req, res) => {
  try {
    const number = req.params.number.replace(/[^0-9]/g, "")

    console.log("Pair request for:", number)

    if (fs.existsSync("./session")) {
      fs.rmSync("./session", {
        recursive: true,
        force: true
      })
      console.log("Old session deleted")
    }

    const { state, saveCreds } =
      await useMultiFileAuthState("./session")

    const { version } =
      await fetchLatestBaileysVersion()

    console.log("Using WA version:", version)

    const sock = makeWASocket({
      version,
      auth: state,
      logger: Pino({ level: "info" }),
      browser: ["Ubuntu", "Chrome", "120.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
      console.log("CONNECTION UPDATE:", update)
    })

    const code = await sock.requestPairingCode(number)

    console.log("Pair code generated:", code)

    return res.json({
      success: true,
      code
    })

  } catch (err) {
    console.error("PAIR ERROR:", err)

    return res.json({
      success: false,
      error: err.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})
