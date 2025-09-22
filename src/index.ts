import "dotenv/config";
import express from "express";
import morgan from "morgan";
import {customAlphabet} from "nanoid";
import {getUrl, saveUrl} from "./lib/urlRepository";
import { verifyUrl } from "./lib/verifyUrl";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(morgan("dev"));
app.use(express.json());

const urlDatabase: Map<string, string> = new Map();

app.get("/", (req, res) => {
    res.send("Hello, World!");
})


app.post("/shorten", async (req, res) => {
    const { url } = req.body;
    if(!url) {
        return res.status(400).json({ error: "URL is required" });
    }
    const urlIsValid = verifyUrl(url);
    if(!urlIsValid) {
        return res.status(400).json({ error: "Invalid URL format" });
    }
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const shortid = customAlphabet(alphabet, 6)();
    await saveUrl({shortCode: shortid, url});
    urlDatabase.set(shortid, url);
    res.json({ shortUrl: `${req.protocol}://${req.get("host")}/${shortid}` });
})

app.get("/:shortid", async (req, res) => {
    try {
        const {shortid} = req.params;
        const originalUrl = urlDatabase.get(shortid) || await getUrl(shortid);

        if (!originalUrl) {
            return res.status(404).json({error: "URL not found"});
        }
        urlDatabase.set(shortid, originalUrl);

        res.redirect(originalUrl);
    } catch (error) {
        return res.status(500).json({error: "Internal Server Error"});
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on =http://localhost:${PORT}`);
})