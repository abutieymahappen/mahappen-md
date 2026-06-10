import express from "express";
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("AKATSUKII-MD ONLINE ✅");
});

app.get("/pair/:number", async (req, res) => {
  try {
    const number = req.params.number;

    const { state } =
      await useMultiFileAuthState(`sessions/${number}`);

    const { version } =
      await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state
    });

    const code =
      await sock.requestPairingCode(number);

    res.json({
      success: true,
      number,
      code
    });

  } catch (err) {

    res.json({
      success: false,
      error: err.message
    });

  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
