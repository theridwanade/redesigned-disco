import "dotenv/config";
import express from "express";
import morgan from "morgan";
import {customAlphabet} from "nanoid";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(morgan("dev"));
app.use(express.json());

const urlDatabase: Map<string, string> = new Map();

app.get("/", (req, res) => {
    res.send("Hello, World!");
})

app.get("/:shortid", (req, res) => {
    const { shortid } = req.params;
    const originalUrl = urlDatabase.get(shortid);
    if(!originalUrl) {
        return res.status(404).json({ error: "URL not found" });
    }
    res.redirect(originalUrl);

})

app.post("/shorten", (req, res) => {
    const { url } = req.body;

    if(!url) {
        return res.status(400).json({ error: "URL is required" });
    }
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const shortid = customAlphabet(alphabet, 6)();
    urlDatabase.set(shortid, url);
    res.json({ shortUrl: `${req.protocol}://${req.get("host")}/${shortid}` });
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})