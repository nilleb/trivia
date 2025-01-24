import React, { useState } from 'react';
import { translations } from '../translations';
import AuthWrapper from './components/AuthWrapper';
import GameContainer from './components/GameContainer';

function App() {
  const SESSION_EXPIRED = 'Session expired. Please log in again.';
  const [gameSettings, setGameSettings] = useState({
    players: 2,
    language: 'it',
    difficulty: 'medio',
    questionsPerRound: 10,
    timePerQuestion: 30
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('trivia_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('trivia_token') || null;
  });

  const [gameState, setGameState] = useState({
    isPlaying: false,
    currentQuestion: 0,
    showAnswer: false,
    questions: [],
    theme: '',
    scores: {},
    isGameOver: false
  });

  const [loginError, setLoginError] = useState(null);

  const handleLogin = async (credentialResponse) => {
    const newToken = credentialResponse.credential;
    setToken(newToken);
    localStorage.setItem('trivia_token', newToken);
    
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          const error = await response.json();
          throw new Error(error.message || 'You are not authorized to access this application');
        }
        throw new Error('Failed to authenticate');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('trivia_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Clear any stored data on error
      handleLogout();
      // Update state to show error in AuthWrapper
      setLoginError(error.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('trivia_user');
    localStorage.removeItem('trivia_token');
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
      if (!response.ok) {
        // If token is invalid, log out the user
        if (response.status === 401) {
          handleLogout();
          throw new Error(SESSION_EXPIRED);
        }
        throw new Error('Failed to fetch questions');
      }
      
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
      if (error.message !== SESSION_EXPIRED) {
        setGameState(prev => ({
          ...prev,
          isPlaying: false,
          error: error.message || translations[gameSettings.language].game.loadError
        }));
      }
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
    return (
      <AuthWrapper
        clientId={process.env.GOOGLE_CLIENT_ID}
        onLogin={handleLogin}
        t={t}
        loginError={loginError}
      />
    );
  }

  return (
    <GameContainer
      gameState={gameState}
      gameSettings={gameSettings}
      setGameSettings={setGameSettings}
      setGameState={setGameState}
      onStartGame={startGame}
      onLogout={handleLogout}
      handleAnswer={handleAnswer}
      handleNextQuestion={handleNextQuestion}
      handleNewGame={handleNewGame}
      t={t}
    />
  );
}

export default App; 