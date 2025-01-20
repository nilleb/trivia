import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, LinearProgress, CircularProgress } from '@mui/material';
import CarréQuestion from './CarréQuestion';
import CacheQuestion from './CacheQuestion';

// Array di colori per le squadre
const TEAM_COLORS = ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#795548'];

function QuestionComponent({ 
  question, 
  currentTeam,
  gameSettings,
  scores,
  onAnswer,
  onNextQuestion,
  questionNumber,
  totalQuestions
}) {
  const [timeLeft, setTimeLeft] = useState(gameSettings.timePerQuestion);
  const [answerType, setAnswerType] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [timerStarted, setTimerStarted] = useState(false);
  const [readyTeams, setReadyTeams] = useState(new Set());
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTeam, setActiveTeam] = useState(null);

  // Reset states when question changes
  useEffect(() => {
    if (question) {
      setShuffledAnswers([question.answer, ...question.wrongAnswers].sort(() => Math.random() - 0.5));
      setAnswerType(null);
      setTimerStarted(false);
      setReadyTeams(new Set());
      setShowAnswer(false);
      setTimeLeft(gameSettings.timePerQuestion);
      setActiveTeam(null);
    }
  }, [question, gameSettings.timePerQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && !showAnswer && timerStarted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timerStarted) {
      setShowAnswer(true);
      new Audio('/assets/sounds/timer-sound.mp3').play();
    }
  }, [timeLeft, showAnswer, timerStarted]);

  const handleAnswerTypeSelect = (type) => {
    setAnswerType(type);
    setTimerStarted(true);
  };

  const handleTeamReady = (teamNumber) => {
    setReadyTeams(prev => {
      const newReadyTeams = new Set(prev);
      newReadyTeams.add(teamNumber);
      return newReadyTeams;
    });
    setActiveTeam(teamNumber);
  };

  const handleTeamAnswer = (team) => {
    setShowAnswer(true);
    onAnswer(team, true);
  };

  const handleCarréAnswer = (answer) => {
    setShowAnswer(true);
    // Use the team that buzzed in, not the turn-based team
    const teamThatAnswered = activeTeam || currentTeam;
    onAnswer(`team${teamThatAnswered}`, answer === question.answer);
  };

  const allTeamsReady = readyTeams.size === gameSettings.players;

  if (!question) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Use the team that buzzed in if available, otherwise use the turn-based team
  const effectiveTeam = activeTeam || currentTeam;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">
          Domanda {questionNumber}/{totalQuestions}
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
        {activeTeam ? `Risponde: Squadra ${activeTeam}` : `Turno: Squadra ${currentTeam}`}
      </Typography>

      {timerStarted && (
        <LinearProgress 
          variant="determinate" 
          value={(timeLeft / gameSettings.timePerQuestion) * 100} 
          sx={{ mb: 2 }}
        />
      )}

      <Typography variant="h6" gutterBottom>
        {question.question}
      </Typography>

      {!showAnswer && !answerType && (
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

      {!showAnswer && answerType === 'carré' && (
        <CarréQuestion
          shuffledAnswers={shuffledAnswers}
          currentTeam={effectiveTeam}
          readyTeams={readyTeams}
          onAnswer={handleCarréAnswer}
          onTeamReady={handleTeamReady}
          gameSettings={gameSettings}
        />
      )}

      {!showAnswer && answerType === 'cache' && (
        <CacheQuestion
          answer={question.answer}
          gameSettings={gameSettings}
          readyTeams={readyTeams}
          onTeamReady={handleTeamReady}
          onAnswer={handleTeamAnswer}
          allTeamsReady={allTeamsReady}
        />
      )}

      {showAnswer && (
        <Box sx={{ mb: 2 }}>
          {answerType === 'carré' && (
            <Typography variant="h6" color="primary">
              Risposta: {question.answer}
            </Typography>
          )}
          <Typography variant="body1" sx={{ mt: 1 }}>
            Fatto interessante: {question.funFact}
          </Typography>
        </Box>
      )}

      <Button 
        variant="contained" 
        onClick={onNextQuestion}
        disabled={!showAnswer}
      >
        Prossima Domanda
      </Button>
    </Box>
  );
}

export default QuestionComponent; 