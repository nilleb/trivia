const express = require('express');
const { OpenAI } = require('openai');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

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

console.log(process.env.NODE_ENV === 'development');

app.get('/api/questions', async (req, res) => {
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
        json_schema:STRUCTURED_OUTPUT_SCHEMA,
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
}); 