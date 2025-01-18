import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, LinearProgress, ButtonGroup } from '@mui/material';

// Array di colori per le squadre
const TEAM_COLORS = ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#795548'];

function GameComponent({ gameState, setGameState, gameSettings }) {
  const [timeLeft, setTimeLeft] = useState(gameSettings.timePerQuestion);
  const [answerType, setAnswerType] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [timerStarted, setTimerStarted] = useState(false);
  const [readyTeams, setReadyTeams] = useState(new Set());
  const [scores, setScores] = useState(
    Object.fromEntries(
      Array.from({length: gameSettings.players}, (_, i) => [`team${i+1}`, 0])
    )
  );

  // Calcola quale squadra ha il turno corrente
  const currentTeam = gameState.currentQuestion % gameSettings.players + 1;

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
    // Non resettiamo più readyTeams qui
  };

  const handleTeamReady = (teamNumber) => {
    setReadyTeams(prev => {
      const newReadyTeams = new Set(prev);
      newReadyTeams.add(teamNumber);
      return newReadyTeams;
    });
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
      setScores(prev => ({
        ...prev,
        [`team${currentTeam}`]: prev[`team${currentTeam}`] + 1
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
      setReadyTeams(new Set()); // Resettiamo readyTeams solo qui
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

  const allTeamsReady = readyTeams.size === gameSettings.players;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">
          Domanda {gameState.currentQuestion + 1}/{gameSettings.questionsPerRound}
        </Typography>
        <Typography variant="h5">
          {Object.entries(scores).map(([team, score], index) => (
            <span key={team}>
              {index > 0 && ' - '}
              Squadra {team.replace('team', '')}: {score}
            </span>
          ))}
        </Typography>
      </Box>

      <Typography variant="subtitle1" gutterBottom color="primary">
        Turno: Squadra {currentTeam}
      </Typography>

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

      {!gameState.showAnswer && !answerType && (
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
        <>
          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {(() => {
              const isTeamReady = readyTeams.has(currentTeam);
              return shuffledAnswers.map((answer, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => isTeamReady && handleCarréAnswer(answer)}
                  disabled={!isTeamReady}
                  sx={{ 
                    p: 2, 
                    minHeight: '60px',
                    opacity: isTeamReady ? 1 : 0.9,
                    cursor: isTeamReady ? 'pointer' : 'not-allowed',
                    borderColor: isTeamReady ? TEAM_COLORS[currentTeam - 1] : '#999',
                    color: isTeamReady ? TEAM_COLORS[currentTeam - 1] : '#666',
                    borderWidth: '2px',
                    backgroundColor: isTeamReady ? 'transparent' : '#f5f5f5',
                    '&:hover': {
                      borderColor: isTeamReady ? TEAM_COLORS[currentTeam - 1] : '#999',
                      bgcolor: isTeamReady ? `${TEAM_COLORS[currentTeam - 1]}11` : '#f5f5f5'
                    },
                    '&.Mui-disabled': {
                      borderColor: '#999',
                      color: '#666',
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  {answer}
                </Button>
              ));
            })()}
          </Box>

          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.from({length: gameSettings.players}, (_, i) => i + 1).map(teamNum => (
              <Button
                key={teamNum}
                variant={readyTeams.has(teamNum) ? 'contained' : 'outlined'}
                onClick={() => handleTeamReady(teamNum)}
                disabled={readyTeams.has(teamNum)}
                sx={{
                  bgcolor: readyTeams.has(teamNum) ? TEAM_COLORS[teamNum - 1] : 'transparent',
                  color: readyTeams.has(teamNum) ? 'white' : TEAM_COLORS[teamNum - 1],
                  borderColor: TEAM_COLORS[teamNum - 1],
                  '&:hover': {
                    bgcolor: readyTeams.has(teamNum) ? TEAM_COLORS[teamNum - 1] : 'rgba(33, 150, 243, 0.04)'
                  }
                }}
              >
                Lo so (Squadra {teamNum})
              </Button>
            ))}
          </Box>
        </>
      )}

      {!gameState.showAnswer && answerType === 'cache' && !allTeamsReady && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.from({length: gameSettings.players}, (_, i) => i + 1).map(teamNum => (
            <Button
              key={teamNum}
              variant={readyTeams.has(teamNum) ? 'contained' : 'outlined'}
              onClick={() => handleTeamReady(teamNum)}
              disabled={readyTeams.has(teamNum)}
              sx={{
                bgcolor: readyTeams.has(teamNum) ? TEAM_COLORS[teamNum - 1] : 'transparent',
                color: readyTeams.has(teamNum) ? 'white' : TEAM_COLORS[teamNum - 1],
                borderColor: TEAM_COLORS[teamNum - 1],
                '&:hover': {
                  bgcolor: readyTeams.has(teamNum) ? TEAM_COLORS[teamNum - 1] : 'rgba(33, 150, 243, 0.04)'
                }
              }}
            >
              Lo so (Squadra {teamNum})
            </Button>
          ))}
        </Box>
      )}

      {!gameState.showAnswer && answerType === 'cache' && allTeamsReady && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Risposta: {currentQ.answer}
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Chi ha indovinato?
          </Typography>
          <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
            {Array.from({length: gameSettings.players}, (_, i) => i + 1).map(teamNum => (
              <Button 
                key={teamNum}
                onClick={() => handleTeamAnswer(`team${teamNum}`)}
                sx={{
                  color: TEAM_COLORS[teamNum - 1],
                  borderColor: TEAM_COLORS[teamNum - 1],
                  '&:hover': {
                    bgcolor: `${TEAM_COLORS[teamNum - 1]}22`
                  }
                }}
              >
                Squadra {teamNum}
              </Button>
            ))}
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