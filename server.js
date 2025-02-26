require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";  // ✅ Correct Model

app.post("/api/translate", async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;

        if (!text || !targetLanguage) {
            return res.status(400).json({ message: "❌ Text and targetLanguage are required." });
        }

        const requestBody = {
            contents: [{ 
                role: "user", 
                parts: [{ text: `Translate the following text into ${targetLanguage} naturally and concisely: "${text}"` }] 
            }],
            generationConfig: { temperature: 0.7 }
        };

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            requestBody,
            { headers: { "Content-Type": "application/json" } }
        );

        // ✅ Extract translation text properly
        const translatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!translatedText) {
            return res.status(500).json({ message: "❌ Failed to retrieve translation." });
        }

        res.json({ translation: translatedText });

    } catch (error) {
        console.error("❌ Gemini AI Translation Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Translation failed", error: error.response?.data || error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

