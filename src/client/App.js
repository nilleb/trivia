import React, { useState } from 'react';
import { Container, Box, Button, Typography } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GameSetup from './GameSetup';
import QuestionComponent from './QuestionComponent';
import EndGameScreen from './EndGameScreen';
import { translations } from '../translations';

function App() {
  const [gameSettings, setGameSettings] = useState({
    players: 2,
    language: 'it',
    difficulty: 'medio',
    questionsPerRound: 10,
    timePerQuestion: 30
  });

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [gameState, setGameState] = useState({
    isPlaying: false,
    currentQuestion: 0,
    showAnswer: false,
    questions: [],
    theme: '',
    scores: {},
    isGameOver: false
  });

  const handleLogin = async (credentialResponse) => {
    setToken(credentialResponse.credential);
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${credentialResponse.credential}`
        }
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const startGame = async () => {
    if (!token) {
      return;
    }

    try {
      const initialState = {
        isPlaying: true,
        questions: [],
        currentQuestion: 0,
        error: null,
        isGameOver: false,
        scores: Object.fromEntries(
          Array.from({length: gameSettings.players}, (_, i) => [`team${i+1}`, 0])
        )
      };
      
      setGameState(prev => ({
        ...prev,
        ...initialState
      }));

      const response = await fetch(
        `/api/questions?theme=${gameState.theme}&language=${gameSettings.language}&difficulty=${gameSettings.difficulty}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error(translations[gameSettings.language].game.noQuestions);
      }

      setGameState(prev => ({
        ...prev,
        questions: data.questions
      }));
    } catch (error) {
      console.error('Errore:', error);
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        error: error.message || translations[gameSettings.language].game.loadError
      }));
    }
  };

  const handleAnswer = (team, isCorrect, points = 1) => {
    if (isCorrect && team) {
      setGameState(prev => ({
        ...prev,
        scores: {
          ...prev.scores,
          [team]: prev.scores[team] + points
        }
      }));
    }
  };

  const handleNextQuestion = () => {
    if (gameState.currentQuestion < gameState.questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        showAnswer: false
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isGameOver: true
      }));
    }
  };

  const handleNewGame = () => {
    setGameState({
      isPlaying: false,
      currentQuestion: 0,
      showAnswer: false,
      questions: [],
      theme: '',
      scores: {},
      isGameOver: false
    });
  };

  // Get translations for current language
  const t = translations[gameSettings.language];

  if (!user) {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      return (
        <Container>
          <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            <Typography variant="h4" color="error" gutterBottom>
              Configuration Error
            </Typography>
            <Typography>
              Google Client ID is not configured. Please check your environment variables.
            </Typography>
          </Box>
        </Container>
      );
    }

    return (
      <GoogleOAuthProvider clientId={clientId}>
        <Container>
          <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            <Typography variant="h4" gutterBottom>
              {t?.auth?.welcome || 'Welcome to Trivia Game'}
            </Typography>
            <GoogleLogin
              onSuccess={handleLogin}
              onError={() => console.log('Login Failed')}
            />
          </Box>
        </Container>
      </GoogleOAuthProvider>
    );
  }

  if (gameState.isGameOver) {
    return (
      <Container>
        <EndGameScreen
          scores={gameState.scores}
          onNewGame={handleNewGame}
          t={t}
        />
      </Container>
    );
  }

  if (!gameState.isPlaying) {
    return (
      <Container>
        <GameSetup
          gameSettings={gameSettings}
          setGameSettings={setGameSettings}
          gameState={gameState}
          setGameState={setGameState}
          onStartGame={startGame}
          t={t}
        />
      </Container>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestion];

  return (
    <Container>
      <QuestionComponent
        question={currentQuestion}
        currentTeam={(gameState.currentQuestion % gameSettings.players) + 1}
        gameSettings={gameSettings}
        scores={gameState.scores}
        onAnswer={handleAnswer}
        onNextQuestion={handleNextQuestion}
        questionNumber={gameState.currentQuestion + 1}
        totalQuestions={gameSettings.questionsPerRound}
        t={t}
      />
    </Container>
  );
}

export default App; 