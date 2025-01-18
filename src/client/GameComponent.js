import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, LinearProgress, ButtonGroup } from '@mui/material';

function GameComponent({ gameState, setGameState, gameSettings }) {
  const [timeLeft, setTimeLeft] = useState(gameSettings.timePerQuestion);
  const [answerType, setAnswerType] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [timerStarted, setTimerStarted] = useState(false);
  const [scores, setScores] = useState({
    team1: 0,
    team2: 0
  });

  useEffect(() => {
    const currentQ = gameState.questions[gameState.currentQuestion];
    if (currentQ) {
      setShuffledAnswers([currentQ.answer, ...currentQ.wrongAnswers].sort(() => Math.random() - 0.5));
    }
  }, [gameState.currentQuestion, gameState.questions]);

  useEffect(() => {
    if (timeLeft > 0 && !gameState.showAnswer && timerStarted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timerStarted) {
      setGameState({ ...gameState, showAnswer: true });
      new Audio('/assets/sounds/timer-sound.mp3').play();
    }
  }, [timeLeft, gameState.showAnswer, timerStarted]);

  const handleAnswerTypeSelect = (type) => {
    setAnswerType(type);
    setTimerStarted(true);
  };

  const handleTeamAnswer = (team) => {
    setGameState({ ...gameState, showAnswer: true });
    if (team) {
      setScores(prev => ({
        ...prev,
        [team]: prev[team] + 1
      }));
    }
  };

  const handleCarréAnswer = (answer) => {
    setGameState({ ...gameState, showAnswer: true });
    if (answer === currentQ.answer) {
      // In modalità carré, il punto va alla squadra che ha il turno
      const currentTeam = gameState.currentQuestion % 2 === 0 ? 'team1' : 'team2';
      setScores(prev => ({
        ...prev,
        [currentTeam]: prev[currentTeam] + 1
      }));
    }
  };

  const handleNextQuestion = () => {
    if (gameState.currentQuestion < gameState.questions.length - 1) {
      setGameState({
        ...gameState,
        currentQuestion: gameState.currentQuestion + 1,
        showAnswer: false
      });
      setTimeLeft(gameSettings.timePerQuestion);
      setAnswerType(null);
      setTimerStarted(false);
    } else {
      setGameState({
        ...gameState,
        isPlaying: false,
        finalScores: scores
      });
    }
  };

  const currentQ = gameState.questions[gameState.currentQuestion];

  if (!gameState.questions || !currentQ) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Caricamento domande...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">
          Domanda {gameState.currentQuestion + 1}/{gameSettings.questionsPerRound}
        </Typography>
        <Typography variant="h5">
          Punteggio: Squadra 1: {scores.team1} - Squadra 2: {scores.team2}
        </Typography>
      </Box>

      {timerStarted && (
        <LinearProgress 
          variant="determinate" 
          value={(timeLeft / gameSettings.timePerQuestion) * 100} 
          sx={{ mb: 2 }}
        />
      )}

      <Typography variant="h6" gutterBottom>
        {currentQ.question}
      </Typography>

      {!gameState.showAnswer && (
        <Box sx={{ mb: 2 }}>
          <Button 
            variant={answerType === 'carré' ? 'contained' : 'outlined'}
            onClick={() => handleAnswerTypeSelect('carré')}
            sx={{ mr: 1 }}
          >
            Carré
          </Button>
          <Button 
            variant={answerType === 'cache' ? 'contained' : 'outlined'}
            onClick={() => handleAnswerTypeSelect('cache')}
          >
            Cache
          </Button>
        </Box>
      )}

      {!gameState.showAnswer && answerType === 'carré' && (
        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {shuffledAnswers.map((answer, index) => (
            <Button
              key={index}
              variant="outlined"
              onClick={() => handleCarréAnswer(answer)}
              sx={{ p: 2, minHeight: '60px' }}
            >
              {answer}
            </Button>
          ))}
        </Box>
      )}

      {!gameState.showAnswer && answerType === 'cache' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Risposta: {currentQ.answer}
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Chi ha indovinato?
          </Typography>
          <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
            <Button onClick={() => handleTeamAnswer('team1')}>Squadra 1</Button>
            <Button onClick={() => handleTeamAnswer('team2')}>Squadra 2</Button>
            <Button onClick={() => handleTeamAnswer(null)}>Nessuno</Button>
          </ButtonGroup>
        </Box>
      )}

      {gameState.showAnswer && (
        <Box sx={{ mb: 2 }}>
          {answerType === 'carré' && (
            <Typography variant="h6" color="primary">
              Risposta: {currentQ.answer}
            </Typography>
          )}
          <Typography variant="body1" sx={{ mt: 1 }}>
            Fatto interessante: {currentQ.funFact}
          </Typography>
        </Box>
      )}

      <Button 
        variant="contained" 
        onClick={handleNextQuestion}
        disabled={!gameState.showAnswer}
      >
        Prossima Domanda
      </Button>
    </Box>
  );
}

export default GameComponent; 