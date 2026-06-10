import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
res.send("AKATSUKII-MD ONLINE ✅");
});

app.get("/pair/:number", (req, res) => {

const number = req.params.number;

// Fake test pair code
const code =
Math.random().toString(36)
.substring(2, 10)
.toUpperCase();

res.json({
success: true,
number,
code
});

});

app.listen(PORT, () => {
console.log("Server running on " + PORT);
});
