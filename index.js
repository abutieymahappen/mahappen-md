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
  res.send("MAHAPPEN-MD PAIR API ONLINE ✅")
})

app.get("/pair", async (req, res) => {
  try {
    const number = "27687085163"

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
      console.log(update)
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
