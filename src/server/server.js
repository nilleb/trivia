const express = require('express');
const { OpenAI } = require('openai');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

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

app.get('/api/questions', async (req, res) => {
  const theme = req.query.theme;
  
  // In development, try to load from logs first
  if (process.env.NODE_ENV === 'development') {
    try {
      const files = await fs.readdir(logsDir);
      const logFiles = files
        .filter(file => file.startsWith(`quiz-${theme}-`))
        .sort()
        .reverse();

      if (logFiles.length > 0) {
        const latestLog = await fs.readFile(path.join(logsDir, logFiles[0]), 'utf-8');
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
    const prompt = `Genera 10 domande quiz sul tema "${theme}" con difficoltà medio. 
    Per ogni domanda fornisci:
    1. La domanda
    2. La risposta corretta
    3. Tre risposte sbagliate plausibili
    4. Un fatto interessante correlato
    Rispondi in lingua italiano.
    Formato JSON richiesto:
    {
      "questions": [
        {
          "question": "...",
          "answer": "...",
          "wrongAnswers": ["...", "...", "..."],
          "funFact": "..."
        }
      ]
    }`;

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
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
        const logFile = path.join(logsDir, `quiz-${theme}-${timestamp}.json`);
        const logData = {
          prompt,
          response,
          settings: { theme, difficulty: 'medio', language: 'italiano', numberOfQuestions: 10 },
          timestamp: new Date().toISOString()
        };
        
        await fs.writeFile(logFile, JSON.stringify(logData, null, 2));
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