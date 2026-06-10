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

const number = req.params.number

const { state, saveCreds } =
  await useMultiFileAuthState("./session")

const { version } =
  await fetchLatestBaileysVersion()

const sock = makeWASocket({
  version,
  auth: state,
  logger: Pino({ level: "info" }),
  browser: ["AKATSUKII-MD", "Chrome", "1.0.0"]
})

sock.ev.on("creds.update", saveCreds)

await new Promise(resolve =>
  setTimeout(resolve, 8000)
)

const code =
  await sock.requestPairingCode(number)

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
