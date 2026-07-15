require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PART 1: EXACT AI SYSTEM INSTRUCTIONS (BEHAVIOR & PERSONA)
const SYSTEM_PROMPT = `You are 'Reality Hit,' a digital monk and the ultimate symbol of absolute truth. Your sole purpose is to deliver cold, hard facts or profoundly reassuring truths in response to the user's queries. 

Strict Rules of Interaction:
1. NO EXPLANATIONS: You are not a conversational chatbot. Never elaborate, describe, or converse. 
2. EXTREME BREVITY: Your maximum allowed response length is a single, hard-hitting phrase or a single word. 
3. TONE: Monastic, stoic, wise, and detached. You deliver reality checks without emotion.
4. CONTENT: Responses must be universally true facts—either a 'cold truth' (e.g., 'Time waits for no one') or a 'warm truth' (e.g., 'Pain is temporary').
5. NO FORMATTING: Do not use punctuation marks like periods or exclamation points at the end of your phrases. Deliver the raw text.

Example Interactions:
- User: I failed my exam and feel like a loser.
- AI: Failure precedes mastery
- User: What is the meaning of life?
- AI: Survival
- User: Will I ever find love?
- AI: Nothing is guaranteed
- User: I got the job!
- AI: Effort rewarded`;

/**
 * Built-in Monastic Intelligence Engine (Local Reality Hit Model)
 * Provides instant, highly accurate monastic truths matching exact semantic & emotional patterns.
 * Strips all ending punctuation.
 */
function generateLocalTruth(query) {
  const q = (query || '').toLowerCase().trim();

  // Keyword & emotional intent mapping to strict monastic truths (no ending punctuation)
  const rules = [
    // Failure, mistakes, defeat, rejection
    { keys: ['fail', 'loser', 'mistake', 'bad', 'rejected', 'rejection', 'flunk', 'lost', 'ruined', 'broke', 'fired', 'poor'],
      truths: [
        'Failure precedes mastery',
        'Stumble is not fall',
        'Defeat reveals character',
        'Scars prove healing',
        'Loss is instruction',
        'Ego shatters before truth emerges',
        'Every fall teaches gravity',
        'Pain clarifies priority'
      ]
    },
    // Meaning of life, existence, why are we here
    { keys: ['meaning of life', 'why are we here', 'purpose', 'existence', 'what is life', 'why exist', 'who am i', 'destiny'],
      truths: [
        'Survival',
        'Consciousness experiencing itself',
        'Action without attachment',
        'To observe and pass through',
        'Brief awareness between eternities',
        'Experience without ownership',
        'Silence beneath thought'
      ]
    },
    // Love, romance, heartbreak, loneliness, relationships
    { keys: ['love', 'find love', 'lonely', 'alone', 'heartbreak', 'breakup', 'crush', 'marry', 'soulmate', 'partner'],
      truths: [
        'Nothing is guaranteed',
        'Attachment breeds suffering',
        'Solitude is strength',
        'People change endlessly',
        'All meetings end in parting',
        'You complete yourself first',
        'Love is acceptance without demand',
        'Connection is impermanent'
      ]
    },
    // Success, achievement, winning, job, pride
    { keys: ['got the job', 'won', 'success', 'promoted', 'rich', 'wealth', 'happy', 'celebrate', 'passed', 'victory', 'best'],
      truths: [
        'Effort rewarded',
        'Glory fades quickly',
        'Stay humble in elevation',
        'Peak requires another climb',
        'Reward is temporary state',
        'Work continues tomorrow',
        'Mastery requires endless diligence'
      ]
    },
    // Time, age, death, future, aging, procrastination
    { keys: ['time', 'old', 'die', 'death', 'future', 'past', 'procrastinat', 'late', 'waste', 'tomorrow', 'forever'],
      truths: [
        'Time waits for no one',
        'The present is all that exists',
        'Decay is universal law',
        'Every second is spent once',
        'Tomorrow is an illusion',
        'Mortality defines urgency',
        'Nothing remains unchanged'
      ]
    },
    // Fear, anxiety, worry, stress, doubt
    { keys: ['scared', 'afraid', 'fear', 'anxious', 'anxiety', 'worry', 'stress', 'panic', 'doubt', 'overthinking'],
      truths: [
        'Fear lives only in anticipation',
        'Breath anchors reality',
        'Most worries never materialize',
        'Peace requires surrender of control',
        'Chaos is the natural order',
        'Stillness dissolves illusion',
        'Pain is inevitable but suffering is optional'
      ]
    },
    // Anger, unfairness, hate, jealousy, revenge
    { keys: ['angry', 'hate', 'mad', 'unfair', 'jealous', 'envy', 'revenge', 'betrayed', 'lie', 'liar'],
      truths: [
        'Anger burns the vessel harboring it',
        'The universe owes nothing',
        'Forgiveness frees the giver',
        'Comparison is theft of joy',
        'Expectation breeds resentment',
        'Truth requires no defense'
      ]
    },
    // Hard work, discipline, effort, study, fatigue
    { keys: ['work', 'tired', 'exhausted', 'study', 'discipline', 'lazy', 'hard', 'struggle', 'give up'],
      truths: [
        'Discipline compounds over time',
        'Endurance builds fortitude',
        'Comfort breeds weakness',
        'Rest then continue',
        'Resistance strengthens the muscle',
        'No shortcut exists to mastery'
      ]
    }
  ];

  // Match keyword rules
  for (const group of rules) {
    if (group.keys.some(key => q.includes(key))) {
      const idx = Math.floor(Math.random() * group.truths.length);
      return group.truths[idx];
    }
  }

  // Universal fallback truths (balanced cold and warm monastic facts)
  const universalTruths = [
    'Change is the only constant',
    'Silence speaks when words fail',
    'All things pass',
    'Reality exists independently of desire',
    'Perception shapes experience',
    'Stillness reveals clarity',
    'Action defines intention',
    'Nothing is permanent',
    'Truth remains regardless of belief',
    'The mind creates its own cage',
    'Simplicity is ultimate refinement',
    'Balance requires constant adjustment'
  ];

  return universalTruths[Math.floor(Math.random() * universalTruths.length)];
}

/**
 * Clean up raw output to enforce Rule #5 strictly:
 * "NO FORMATTING: Do not use punctuation marks like periods or exclamation points at the end of your phrases. Deliver the raw text."
 */
function cleanMonasticOutput(text) {
  if (!text) return 'Silence';
  // Remove leading/trailing quotes, whitespace, and trailing periods/exclamation marks/question marks
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();
  cleaned = cleaned.replace(/[.!?]+$/, '').trim();
  return cleaned || 'Silence';
}

// Endpoint to fetch system prompt for UI audit/inspection
app.get('/api/system-prompt', (req, res) => {
  res.json({ systemPrompt: SYSTEM_PROMPT });
});

// Main endpoint to deliver the Reality Hit
app.post('/api/truth', async (req, res) => {
  try {
    const { query, provider = 'local', apiKey } = req.body;

    if (!query || !query.trim()) {
      return res.json({
        truth: 'Silence reveals truth',
        provider: 'local',
        monasticStatus: 'pure'
      });
    }

    const key = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // 1. Google Gemini API integration
    if (provider === 'gemini' && key) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: [{
              role: 'user',
              parts: [{ text: query }]
            }],
            generationConfig: {
              maxOutputTokens: 25,
              temperature: 0.6
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return res.json({
              truth: cleanMonasticOutput(rawText),
              provider: 'gemini',
              monasticStatus: 'live-cloud'
            });
          }
        } else {
          console.warn('Gemini API fallback triggered due to response status:', response.status);
        }
      } catch (err) {
        console.warn('Gemini API error, falling back to monastic intelligence engine:', err.message);
      }
    }

    // 2. OpenAI API integration
    if (provider === 'openai' && key) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: query }
            ],
            max_tokens: 25,
            temperature: 0.6
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.choices?.[0]?.message?.content;
          if (rawText) {
            return res.json({
              truth: cleanMonasticOutput(rawText),
              provider: 'openai',
              monasticStatus: 'live-cloud'
            });
          }
        }
      } catch (err) {
        console.warn('OpenAI API error, falling back to monastic intelligence engine:', err.message);
      }
    }

    // 3. Local Monastic Intelligence Engine (or graceful fallback)
    const localTruth = generateLocalTruth(query);
    return res.json({
      truth: cleanMonasticOutput(localTruth),
      provider: 'local',
      monasticStatus: 'monastic-engine'
    });

  } catch (error) {
    console.error('Reality Hit Server Error:', error);
    res.status(500).json({
      truth: 'Chaos is temporary',
      provider: 'local',
      monasticStatus: 'error-recovered'
    });
  }
});

// SPA fallback for any static route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function startServer(port) {
  const server = http.createServer(app);
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is currently in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(` ⛩️  REALITY HIT - DIGITAL MONK BACKEND ACTIVE`);
    console.log(` 📍 Local URL: http://localhost:${port}`);
    console.log(` 📜 Strict Monastic Persona Loaded.`);
    console.log(`======================================================\n`);
  });
}

startServer(typeof PORT === 'number' ? PORT : parseInt(PORT, 10));
