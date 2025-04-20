import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Hardcoded Gemini API Key (⚠️ Not secure, only for demo/testing)
const GEMINI_API_KEY = 'AIzaSyDWQMnQyEtmn1HwmsQgp5xZrtJ60Y9jvow';

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const HEALTH_PROMPT = `You are a preventive healthcare assistant. Explain medical concepts in simple terms.
Focus on:
- Early detection benefits
- Age-appropriate screenings
- Lifestyle modifications
- Cost-effective prevention
Format: Short paragraphs with everyday analogies
Question: `;

// Express app setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.render('login.ejs', { responseText: null });
});
app.post('/dashboard', (req, res) => {
    res.render('dashboard.ejs', { responseText: null });
});
app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs', { responseText: null });
});
app.get('/dashboard/learn', (req, res) => {
    res.render('lessons.ejs');
});

app.get('/dashboard/learn/preventive', (req, res) => {
    res.render('preventive healthcare.ejs', { responseText: null });
});
app.get('/dashboard/learn/nutrition', (req, res) => {
    res.render('Nutrition Basics.ejs', { responseText: null });
});
app.get('/dashboard/learn/mental-health', (req, res) => {
    res.render('mental-health.ejs', { responseText: null });
});

app.get('/dashboard/learn/chronic', (req, res) => {
    res.render('chronic-conditions.ejs', { responseText: null });
});
app.get('/dashboard/learn/first-aid', (req, res) => {
    res.render('first-aid.ejs', { responseText: null });
});
app.get('/dashboard/learn/vaccines', (req, res) => {
    res.render('vaccinations.ejs', { responseText: null });
});
app.get('/dashboard/learn/aging', (req, res) => {
    res.render('healthy-aging.ejs', { responseText: null });
});
app.get('/dashboard/learn/womens', (req, res) => {
    res.render('womens-health.ejs', { responseText: null });
});
app.get('/dashboard/learn/pediatric', (req, res) => {
    res.render('pediatric-care.ejs', { responseText: null });
});
app.get('/dashboard/learn/emergency', (req, res) => {
    res.render('emergency-prep.ejs', { responseText: null });
});



app.post('/generate', async (req, res) => {
    const fullPrompt = HEALTH_PROMPT + req.body.question;
    console.log('Received prompt:', fullPrompt);
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            contents: [
                {
                    parts: [{ text: fullPrompt }]
                }
            ]
        },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
        res.render('preventive healthcare.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('index', { responseText: 'Failed to fetch Gemini response.' });
    }
});


app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

