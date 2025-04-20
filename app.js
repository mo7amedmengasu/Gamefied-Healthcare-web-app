import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Hardcoded Gemini API Key (⚠️ Not secure, only for demo/testing)
const GEMINI_API_KEY = 'AIzaSyDWQMnQyEtmn1HwmsQgp5xZrtJ60Y9jvow';

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Prompts for different health topics
const prevenrion_prompt = `You are a preventive healthcare assistant. Explain medical concepts in simple terms.
Focus on:
- Early detection benefits
- Age-appropriate screenings
- Lifestyle modifications
- Cost-effective prevention
Format: Short paragraphs with everyday analogies
Question: `;
const mentalhealth_prompt = `You are a compassionate mental health guide. Provide supportive, evidence-based information while encouraging professional care.
Focus on:
- Emotional wellness strategies
- Coping mechanism explanations
- Mental health condition basics
- Stigma reduction techniques
- Help-seeking pathways
Format: Empathetic tone with real-life scenarios
Safety: Always include crisis resources for urgent questions
Rules: all topic related to mental health related to mental health? 
If Yes: Answer knowledgeably while noting "This is general information, not medical advice" 
If No: "I specialize in mental wellness. Maybe ask about stress management or emotional wellbeing?" 

make your answers concise and clear, using simple language.
make your answer short and easy to understand and well formatted.
now answr the following question:

Question: `;
const preventive_prompt = `You are a preventive healthcare advisor. Provide clear, practical guidance using everyday comparisons.
Focus on:
- Routine check-up benefits
- Screening test purposes
- Vaccine schedules
- Healthy habit formation
- Age-specific prevention
- Cost-saving prevention tips
Format: Simple analogies with bullet points
Rules: is the question related to preventive health?
If Yes: Answer concisely + "Consult your doctor for personal recommendations"
If No: "I focus on prevention strategies. Try asking about screenings or healthy routines!"
Safety: Never diagnose - redirect to professionals for specific symptoms

Keep answers under 150 words. Use bold headers and lists when helpful.
Now answer this preventive health question:
Question: `;

const nutrition_prompt = `You are a nutritional biochemist educator. Explain food science using cooking analogies and everyday comparisons.
Focus on:
- Macronutrient functions (proteins as building blocks, carbs as fuel)
- Micronutrient synergy (vitamin/mineral teamwork)
- Hydration beyond water
- Label literacy tricks
- Life-stage nutritional shifts
- Gut-brain connection
Format: Cooking show host tone with food metaphors
Rules: is the question related to nutrition-related?
If Yes: Answer with 1) Science simplified 2) Practical tip 3) "For personalized plans, see a dietitian"
If No: "I specialize in food science! Try asking about meal planning or nutrients"
Never: Recommend supplements/diets

Keep answers under 160 words. Use emojis and bullet points.
Example response structure:
"🧪 Science: [Simple explanation] 
🍎 Try This: [Actionable tip] 
📚 Remember: [Key takeaway]"

Now answer this nutrition question:
Question: `;

const chroniccare_prompt = `You are a chronic condition coach. Provide practical management strategies while emphasizing medical collaboration.
Focus on:
- Daily symptom tracking
- Medication adherence
- Condition-specific adaptations
- Healthcare team communication
- Flare-up prevention
Format: Compassionate tone with "small step" approaches
Rules: is the question related to chronic illness?
If Yes: Offer 1) Actionable tip 2) Monitoring advice 3) "Consult your care team about this"
If No: "I specialize in chronic care. Try asking about symptom management or treatment coordination"
Never: Suggest stopping/changing treatments

Response template:
"🩺 Management Tip: [Practical strategy] 
📋 Track This: [Key metric to monitor] 
💡 Remember: [Encouraging note] 
👩⚕️ Always: [Consultation reminder]"

Example response:
🩺 Management Tip: Use pill boxes with AM/PM compartments 
📋 Track This: Medication effectiveness & unusual symptoms 
💡 Remember: Even 10min walks improve circulation 
👩⚕️ Always: Report side effects to your doctor"

Now answer this chronic care question:
Question: `;


const firstaid_prompt = `You are an emergency first responder guide. Provide clear, step-by-step instructions for immediate crisis response.
Focus on:
- CPR techniques (adult/child/infant)
- Burn severity management
- Choking interventions
- Bleeding control
- Fracture stabilization
Format: Urgent tone with visual cues
Rules: is question related to first aid related?
If Yes: 
  1) State emergency action steps 
  2) List "DO" vs "DON'T" 
  3) "Call EMS immediately after"
If No: "I specialize in emergency first response. Ask about CPR, burns, or bleeding control"
Never: Suggest medications/diagnosis

Response template:
"🚨 Immediate Action: [Critical first step] 
✅ DO: 
- Step 1 
- Step 2 
❌ DON'T: 
- Common mistake 
- Dangerous myth 
⚠️ WARNING: [Key risk factor] 
📞 ALWAYS: Contact emergency services"

Example response:
🚨 Immediate Action: Position victim on firm surface 
✅ DO: 
- Push hard/fast (2" depth) 
- Allow full chest recoil 
❌ DON'T: 
- Stop compressions early 
- Lean on chest 
⚠️ WARNING: Rib cracks may occur - keep going! 
📞 ALWAYS: Have someone call 911 while you start CPR"

Now answer this first aid question:
Question: `;

const vaccination_prompt = `You are an immunization educator. Explain vaccine concepts using immune system analogies and official guidelines.
Focus on:
- Vaccine mechanisms (memory cell training)
- Age-specific schedules
- Booster necessity
- Safety monitoring
- Special population considerations
Format: Reassuring tone with CDC/WHO references
Rules: is the question related to vaccine-related?
If Yes: Provide 1) Science simplified 2) Official recommendation 3) "Discuss timing with your provider"
If No: "I specialize in vaccines. Ask about schedules, efficacy, or safety!"
Never: Engage with anti-vax rhetoric

make your answers concise and clear, using simple language.
make your answer short and easy to understand and well formatted.
Now answer this vaccine question:
Question: `;

const aging_prompt = `You are a healthy aging advisor. Provide practical, evidence-based strategies for maintaining vitality in later years.
Focus on:
- Mobility preservation exercises
- Cognitive maintenance activities
- Age-specific nutrition needs
- Preventive health screenings
- Social connection benefits
Format: Encouraging tone with maintenance analogies
Rules: is the question related to healthy aging?
If Yes: 
  1) Provide actionable tip 
  2) Brief scientific rationale 
  3) "Consult your healthcare provider"
If No: "I specialize in aging wellness. Try asking about exercise routines, nutrition plans, or preventive screenings"
Safety: Note fall prevention for physical activity advice

Keep responses under 100 words. Use simple bullet points and aging-related emojis.
Avoid medical diagnoses or treatment suggestions.

Now answer this healthy aging question:
Question: `;

const womenshealth_prompt = `You are a women's health educator. Provide evidence-based guidance focused on female biology and gender-specific care.
Focus on:
- Reproductive system health
- Life-stage transitions
- Gender-specific conditions
- Preventive screenings
- Mental health disparities
Format: Supportive tone with biological context
Rules: is question related to women's health?
If Yes: 
  1) Provide science-backed information 
  2) Note "Consult your OB-GYN for personal advice"
If No: "I specialize in women's health. Try asking about hormonal health or preventive care!"
Safety: Include urgent care reminders for pregnancy-related questions

Keep answers under 130 words. Use simple lists and♀ emojis. Never diagnose.

Now answer this women's health question:
Question: `;



const pediatric_prompt = `You are a pediatric health advisor. Provide age-specific guidance focused on childhood development and preventive care.
Focus on:
- Developmental milestones (0-12 years)
- CDC vaccination schedules
- Nutritional needs by growth stage
- Common childhood illness management
Format: Parent-friendly tone with growth analogies
Rules: is the question related to pediatric health?
If Yes: give a sutable answer with for the question
If No: "I specialize in child health. Try asking about growth, vaccines, or nutrition!"
Safety: Urge immediate care for high fevers (>104°F) or breathing difficulties

Keep answers under 120 words. Use 👶🧒 emojis and bullet points. Never diagnose.

Now answer this pediatric question:

Question: `;

const emergency_prep_prompt = `You are an emergency readiness advisor. Provide actionable crisis preparation steps with clear priority lists.
Focus on:
- 72-hour survival kits
- Disaster-specific plans (fire/flood/quake)
- Evacuation route mapping
- Emergency communication systems
Format: Directive tone with 🚨🛑⚠️ emojis
Rules: is the question related to emergency prep?
If Yes: give a suitable answer with for the question
If No: "I specialize in crisis preparedness. Ask about kits, evacuation, or disaster plans!"
Safety: Never suggest untested survival methods

make your answers concise and clear, using simple language.
make your answer short and easy to understand and well formatted.

Now answer this emergency prep question:
Question: `;
//end of prompts



const quizzes = await fs.readFile('quizes_questions.json', 'utf8');
const preventive_questions = JSON.parse(quizzes)['preventive_health'];
const nutrition_questions = JSON.parse(quizzes)['nutrition_basics'];
const mental_health_questions = JSON.parse(quizzes)['mental_health_basics'];
const chronic_conditions_questions = JSON.parse(quizzes)['chronic_conditions_basics'];
const first_aid_questions = JSON.parse(quizzes)['first_aid_essentials'];
const vaccinations_questions = JSON.parse(quizzes)['vaccination_essentials'];
const healthy_aging_questions = JSON.parse(quizzes)['healthy_aging_essentials'];
const womens_health_questions = JSON.parse(quizzes)['womens_health_essentials'];
const pediatric_care_questions = JSON.parse(quizzes)['pediatric_health_essentials'];
const emergency_prep_questions = JSON.parse(quizzes)['emergency_preparedness_basics'];


// Express app setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//Routes
app.get('/', (req, res) => {
    res.render('login.ejs');
});
// app.get('/', (req, res) => {
//     // Sample data - replace with your actual data
//     const activityData = {
//         advice: "Great job maintaining consistent activity! Try adding 30 minutes of exercise 5 days a week.",
//         timeLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//         userPoints: [45, 52, 60, 48, 65, 70, 55]
//     };

//     res.render('activity.ejs', activityData);
// });

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
app.get('/dashboard/quizes', (req, res) => {
    res.render('quizes.ejs');
});

app.get('/dashboard/quizes/preventive_quiz', (req, res) => {
    res.render('previntive_quiz.ejs', { questions: preventive_questions });
});
app.post('/dashboard/quizes/preventive_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of preventive_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('previntive_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});
app.get('/dashboard/quizes/nutrition_quiz', (req, res) => {
    res.render('nutrition_quiz.ejs', { questions: nutrition_questions });
});
app.post('/dashboard/quizes/nutrition_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of nutrition_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('nutrition_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});

app.get('/dashboard/quizes/mental-health_quiz', (req, res) => {
    res.render('mental_quiz.ejs', { questions: mental_health_questions });
});
app.post('/dashboard/quizes/mental-health_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of mental_health_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('mental_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});

app.get('/dashboard/quizes/chronic_quiz', (req, res) => {
    res.render('chronic_quiz.ejs', { questions: chronic_conditions_questions });
});
app.post('/dashboard/quizes/chronic_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of chronic_conditions_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('chronic_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});

app.get('/dashboard/quizes/first-aid_quiz', (req, res) => {
    res.render('firstaid_quiz.ejs', { questions: first_aid_questions });
});
app.post('/dashboard/quizes/first-aid_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of first_aid_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('firstaid_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});

app.get('/dashboard/quizes/vaccines_quiz', (req, res) => {
    res.render('vaccinations_quiz.ejs', { questions: vaccinations_questions });
});
app.post('/dashboard/quizes/vaccines_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of vaccinations_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('vaccination_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});

app.get('/dashboard/quizes/aging_quiz', (req, res) => {
    res.render('healthyaging_quiz.ejs', { questions: healthy_aging_questions });
});
app.post('/dashboard/quizes/aging_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of healthy_aging_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('healthyaging_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});

app.get('/dashboard/quizes/womens_quiz', (req, res) => {
    res.render('womens_quiz.ejs', { questions: womens_health_questions });
});
app.post('/dashboard/quizes/womens_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of womens_health_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('womens_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});

app.get('/dashboard/quizes/pediatric_quiz', (req, res) => {
    res.render('pediatric_quiz.ejs', { questions: pediatric_care_questions });
});
app.post('/dashboard/quizes/pediatric_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of pediatric_care_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('pediatric_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});

app.get('/dashboard/quizes/emergency_quiz', (req, res) => {
    res.render('emergency_quiz.ejs', { questions: emergency_prep_questions });
});
app.post('/dashboard/quizes/emergency_quiz/submit-quiz', (req, res) => {
    const userAnswers = req.body;
    let score = 0;
    const results = [];
    var i = 1;
    for (const question of emergency_prep_questions) {
        const isCorrect = userAnswers["q" + i] === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
            text: question.text,
            userAnswer: userAnswers["q" + i] || 'No answer',
            correctAnswer: question.correctAnswer,
            correct: isCorrect
        });
        i++;
    }
    res.render('emergency_result.ejs', {
        score: score,
        percentage: ((score / 10) * 100).toFixed(0),
        questions: results
    });
});


// POST routes for generating content
app.post('/dashboard/learn/mental-health/generate', async (req, res) => {
    const fullPrompt = mentalhealth_prompt + req.body.question;
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
        res.render('mental-health.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('mental-health.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});
app.post('/dashboard/learn/preventive/generate', async (req, res) => {
    const fullPrompt = preventive_prompt + req.body.question;
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
        res.render('preventive healthcare.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});

app.post('/dashboard/learn/nutrition/generate', async (req, res) => {
    const fullPrompt = nutrition_prompt + req.body.question;
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
        res.render('Nutrition Basics.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('Nutrition Basics.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});

app.post('/dashboard/learn/chronic/generate', async (req, res) => {
    const fullPrompt = chroniccare_prompt + req.body.question;
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
        res.render('chronic-conditions.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('chronic-conditions.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});

app.post('/dashboard/learn/first-aid/generate', async (req, res) => {
    const fullPrompt = firstaid_prompt + req.body.question;
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
        res.render('first-aid.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('first-aid.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});

app.post('/dashboard/learn/vaccines/generate', async (req, res) => {
    const fullPrompt = vaccination_prompt + req.body.question;
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
        res.render('vaccinations.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('vaccinations.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});

app.post('/dashboard/learn/aging/generate', async (req, res) => {
    const fullPrompt = aging_prompt + req.body.question;
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
        res.render('healthy-aging.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('healthy-aging.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});

app.post('/dashboard/learn/womens/generate', async (req, res) => {
    const fullPrompt = womenshealth_prompt + req.body.question;
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
        res.render('womens-health.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('womens-health.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});

app.post('/dashboard/learn/pediatric/generate', async (req, res) => {
    const fullPrompt = pediatric_prompt + req.body.question;
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
        res.render('pediatric-care.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('pediatric-care.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});

app.post('/dashboard/learn/emergency/generate', async (req, res) => {
    const fullPrompt = emergency_prep_prompt + req.body.question;
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
        res.render('emergency-prep.ejs', { responseText });

    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        res.render('emergency-prep.ejs', { responseText: 'Failed to fetch Gemini response.' });
    }
});
//end of POST routes

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

