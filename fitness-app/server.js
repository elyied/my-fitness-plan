const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your HTML file

// The Secret Route
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "API Key not configured on server" });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Gemini API Error');
        }

        // Send just the text back to the frontend
        const text = data.candidates[0].content.parts[0].text;
        res.json({ text });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to fetch AI response" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});