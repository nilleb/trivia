import React, { useState } from 'react';
import { Container } from '@mui/material';
import GameSetup from './GameSetup';
import QuestionComponent from './QuestionComponent';

function App() {
  const [gameSettings, setGameSettings] = useState({
    players: 2,
    language: 'italiano',
    difficulty: 'medio',
    questionsPerRound: 10,
    timePerQuestion: 30
  });

  const [gameState, setGameState] = useState({
    isPlaying: false,
    currentQuestion: 0,
    showAnswer: false,
    questions: [],
    theme: '',
    scores: {}
  });

  const startGame = async () => {
    try {
      const initialState = {
        isPlaying: true,
        questions: [],
        currentQuestion: 0,
        error: null,
        scores: Object.fromEntries(
          Array.from({length: gameSettings.players}, (_, i) => [`team${i+1}`, 0])
        )
      };
      
      setGameState(prev => ({
        ...prev,
        ...initialState
      }));

      const response = await fetch(`/api/questions?theme=${gameState.theme}`);
      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('Nessuna domanda ricevuta');
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
        error: error.message || 'Errore nel caricamento delle domande'
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
        isPlaying: false
      }));
    }
  };

  if (!gameState.isPlaying) {
    return (
      <Container>
        <GameSetup
          gameSettings={gameSettings}
          setGameSettings={setGameSettings}
          gameState={gameState}
          setGameState={setGameState}
          onStartGame={startGame}
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
      />
    </Container>
  );
}

export default App; 