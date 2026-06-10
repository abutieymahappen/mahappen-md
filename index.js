import express from "express"
import cors from "cors"
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"
import Pino from "pino"

const app = express()

app.use(cors())

const PORT = process.env.PORT || 8080

app.get("/", (req, res) => {
  res.send("AKATSUKII-MD ONLINE ✅")
})

async function startBot(number) {

  const { state, saveCreds } =
    await useMultiFileAuthState("./session")

  const { version } =
    await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: Pino({ level: "silent" }),
    auth: state,
    browser: ["AKATSUKII-MD", "Chrome", "1.0.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  await new Promise(resolve =>
    setTimeout(resolve, 5000)
  )

  const code =
    await sock.requestPairingCode(number)

  return code
}

app.get("/pair/:number", async (req, res) => {

  try {

    const code =
      await startBot(req.params.number)

    res.json({
      success: true,
      code
    })

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    })

  }

})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})
