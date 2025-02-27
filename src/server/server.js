const express = require('express');
const { OpenAI } = require('openai');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Get allowed emails from environment variable
const allowedEmails = process.env.ALLOWED_EMAILS ? process.env.ALLOWED_EMAILS.split(',').map(email => email.trim()) : [];

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    // Check if user's email is in the allowed list
    if (allowedEmails.length > 0 && !allowedEmails.includes(payload.email)) {
      console.log(`Unauthorized access attempt from email: ${payload.email}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your email is not authorized to access this application'
      });
    }

    req.user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const STRUCTURED_OUTPUT_SCHEMA = {
  "name": "questions_schema",
  "schema": {
    "type": "object",
    "properties": {
      "questions": {
        "type": "array",
        "description": "A list of questions with their respective answers and additional information.",
        "items": {
          "type": "object",
          "properties": {
            "question": {
              "type": "string",
              "description": "The question being asked."
            },
            "answer": {
              "type": "string",
              "description": "The correct answer to the question."
            },
            "wrongAnswers": {
              "type": "array",
              "description": "A list of incorrect answers.",
              "items": {
                "type": "string"
              }
            },
            "funFact": {
              "type": "string",
              "description": "An interesting fact related to the question."
            }
          },
          "required": [
            "question",
            "answer",
            "wrongAnswers",
            "funFact"
          ],
          "additionalProperties": false
        }
      }
    },
    "required": [
      "questions"
    ],
    "additionalProperties": false
  },
  "strict": true
}

const ANSWER_VERIFICATION_SCHEMA = {
  "name": "answer_verification_schema",
  "schema": {
    "type": "object",
    "properties": {
      "isCorrect": {
        "type": "boolean",
        "description": "Whether the given answer is correct or not"
      },
      "explanation": {
        "type": "string",
        "description": "Explanation of why the answer is correct or incorrect"
      },
      "similarity": {
        "type": "number",
        "description": "A score from 0 to 1 indicating how close the given answer is to the correct answer"
      }
    },
    "required": ["isCorrect", "explanation", "similarity"],
    "additionalProperties": false
  },
  "strict": true
};

// Improved logs directory handling
const logsDir = path.join(__dirname, '../../logs');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log(`Created logs directory at: ${logsDir}`);
  }
} catch (error) {
  console.error('Error creating logs directory:', error);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log(`${process.env.NODE_ENV === 'development' ? 'Development' : 'Production'} mode`);

// Protected route example
app.get('/api/user', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Apply authentication to questions route
app.get('/api/questions', authenticateToken, async (req, res) => {
  const theme = req.query.theme;
  const language = req.query.language || 'it';
  const difficulty = req.query.difficulty || 'medio';

  // Language-specific prompts
  const prompts = {
    it: `Genera 10 domande quiz sul tema "${theme}" con difficoltà ${difficulty}. 
    Per ogni domanda fornisci:
    1. La domanda
    2. La risposta corretta
    3. Tre risposte sbagliate plausibili
    4. Un fatto interessante correlato
    Rispondi in lingua italiano.`,
    en: `Generate 10 quiz questions about "${theme}" with ${difficulty} difficulty.
    For each question provide:
    1. The question
    2. The correct answer
    3. Three plausible wrong answers
    4. A related fun fact
    Answer in English.`,
    fr: `Générez 10 questions de quiz sur le thème "${theme}" avec une difficulté ${difficulty}.
    Pour chaque question, fournissez :
    1. La question
    2. La bonne réponse
    3. Trois mauvaises réponses plausibles
    4. Un fait intéressant lié
    Répondez en français.`
  };

  const prompt = `${prompts[language]}`;

  // In development, try to load from logs first
  if (process.env.NODE_ENV === 'development') {
    try {
      const files = await fsPromises.readdir(logsDir);
      const logFiles = files
        .filter(file => file.startsWith(`quiz-${theme}-${language}-${difficulty}-`))
        .sort()
        .reverse();

      if (logFiles.length > 0) {
        const latestLog = await fsPromises.readFile(path.join(logsDir, logFiles[0]), 'utf-8');
        const logData = JSON.parse(latestLog);
        console.log(`Loaded questions from log file: ${logFiles[0]}`);
        return res.json(logData.response);
      }
    } catch (error) {
      console.log('No log file found, generating new questions');
    }
  }

  // If no log file found or in production, generate new questions
  try {
    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: STRUCTURED_OUTPUT_SCHEMA,
      },
    });

    console.log('Received response from OpenAI');
    let response;
    try {
      response = JSON.parse(completion.choices[0].message.content);
      console.log('Successfully parsed OpenAI response');
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', completion.choices[0].message.content);
      throw new Error('Failed to parse OpenAI response: ' + parseError.message);
    }

    // Validate response structure
    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error('Invalid response format: questions array is missing');
    }

    // Save response to log file in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFile = path.join(logsDir, `quiz-${theme}-${language}-${difficulty}-${timestamp}.json`);
        const logData = {
          prompt,
          response,
          settings: { theme, language, difficulty, numberOfQuestions: 10 },
          timestamp: new Date().toISOString()
        };

        await fsPromises.writeFile(logFile, JSON.stringify(logData, null, 2));
        console.log(`Log file written successfully: ${logFile}`);
      } catch (logError) {
        console.error('Error writing log file:', logError);
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      error: 'Error generating questions',
      details: error.toString()
    });
  }
});

// Verify answer endpoint
app.post('/api/verify-answer', authenticateToken, async (req, res) => {
  try {
    const { givenAnswer, correctAnswer, question, language = 'it' } = req.body;

    // Convert answers to strings and check if they exist
    const givenAnswerStr = givenAnswer !== undefined ? String(givenAnswer) : undefined;
    const correctAnswerStr = correctAnswer !== undefined ? String(correctAnswer) : undefined;

    if (!givenAnswerStr || !correctAnswerStr || !question) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'givenAnswer, correctAnswer, and question are required'
      });
    }

    const prompts = {
      it: `Valuta se la risposta data "${givenAnswerStr}" è corretta per la domanda "${question}". 
          La risposta corretta è "${correctAnswerStr}".
          Considera sinonimi, errori di battitura minori e variazioni nella formulazione.
          Fornisci una spiegazione dettagliata del perché la risposta è corretta o sbagliata.`,
      en: `Evaluate if the given answer "${givenAnswerStr}" is correct for the question "${question}". 
          The correct answer is "${correctAnswerStr}".
          Consider synonyms, minor typos, and variations in phrasing.
          Provide a detailed explanation of why the answer is correct or incorrect.`,
      fr: `Évaluez si la réponse donnée "${givenAnswerStr}" est correcte pour la question "${question}". 
          La bonne réponse est "${correctAnswerStr}".
          Tenez compte des synonymes, des fautes de frappe mineures et des variations dans la formulation.
          Fournissez une explication détaillée de la raison pour laquelle la réponse est correcte ou incorrecte.`
    };

    const prompt = prompts[language] || prompts.en;

    const payload = {
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: ANSWER_VERIFICATION_SCHEMA,
      },
    }
    console.log(payload);
    const completion = await openai.chat.completions.create(payload);

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error('Error verifying answer:', error);
    res.status(500).json({
      error: 'Error verifying answer',
      details: error.toString()
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`${process.env.NODE_ENV === 'development' ? 'Development' : 'Production'} mode`);
}); 