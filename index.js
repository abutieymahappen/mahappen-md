import express from "express"
import cors from "cors"
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

    // Allow only your number
    if (number !== "27687085163") {
      return res.json({
        success: false,
        error: "This number is not allowed"
      })
    }

    const { state, saveCreds } =
      await useMultiFileAuthState("./session")

    const { version } =
      await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      version,
      auth: state,
      logger: Pino({ level: "info" }),
      browser: ["Ubuntu", "Chrome", "120.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update

      console.log("Connection:", connection)

      if (connection === "open") {
        console.log("✅ WhatsApp linked successfully")
      }

      if (connection === "close") {
        console.log("❌ Connection closed")
        console.log(lastDisconnect)
      }
    })

    const code = await sock.requestPairingCode(number)

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
