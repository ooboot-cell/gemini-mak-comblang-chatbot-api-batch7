import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { GoogleGenAI } from '@google/genai';  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`)); // fixed template string and missing parenthesis

app.post('/api/chat', async (req, res) => { // fixed async function parameter syntax
    const { conversation } = req.body; // changed from message to conversation
    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        const contents = conversation.map(({ role, text }) => ({ 
            role, 
            parts: [{ text }] 
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            generationConfig: { // fixed config key
                temperature: 0.7,
                maxOutputTokens: 500,
            },
            systemInstruction: 'Jawab hanya dengan menggunakan bahasa Indonesia. Jangan menjawab dengan bahasa lain.', // fixed key
        });

        // Gemini API returns candidates array
        const reply = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

        res.status(200).json({ reply });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});