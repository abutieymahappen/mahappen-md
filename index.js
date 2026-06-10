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

    if (fs.existsSync("./session")) {
  fs.rmSync("./session", {
    recursive: true,
    force: true
  })
}

    const { version } =
      await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      version,
      auth: state,
      logger: Pino({ level: "silent" }),
      browser: ["Ubuntu", "Chrome", "120.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
      console.log("Connection:", update.connection)
    })

    
    await new Promise(resolve => setTimeout(resolve, 15000))

    const code = await sock.requestPairingCode(number)

    res.json({
      success: true,
      code
    })

  } catch (err) {
    console.log(err)

    res.json({
      success: false,
      error: err.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})
