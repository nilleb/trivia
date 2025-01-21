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
  totalQuestions,
  t
}) {
  const [timeLeft, setTimeLeft] = useState(gameSettings.timePerQuestion);
  const [answerType, setAnswerType] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [timerStarted, setTimerStarted] = useState(false);
  const [readyTeams, setReadyTeams] = useState(new Set());
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTeam, setActiveTeam] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

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
      setLastAnswerCorrect(null);
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

  const verifyAnswer = async (givenAnswer) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('trivia_token')}`
        },
        body: JSON.stringify({
          givenAnswer,
          correctAnswer: question.answer,
          question: question.question,
          language: gameSettings.language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify answer');
      }

      const result = await response.json();
      setVerificationResult(result);
      return result;
    } catch (error) {
      console.error('Error verifying answer:', error);
      return { isCorrect: givenAnswer === question.answer, explanation: null };
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTeamAnswer = async (team, givenAnswer) => {
    setShowAnswer(true);
    const result = await verifyAnswer(givenAnswer);
    setLastAnswerCorrect(result.isCorrect);
    // Cache questions are worth 5 points
    onAnswer(team, result.isCorrect, 5);
  };

  const handleCarréAnswer = async (answer) => {
    setShowAnswer(true);
    const result = await verifyAnswer(answer);
    setLastAnswerCorrect(result.isCorrect);
    // Use the team that buzzed in, not the turn-based team
    const teamThatAnswered = activeTeam || currentTeam;
    // Carré questions are worth 1 point
    onAnswer(`team${teamThatAnswered}`, result.isCorrect, 1);
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
          {t.game.question} {questionNumber}/{totalQuestions}
        </Typography>
        <Typography variant="h5">
          {Object.entries(scores).map(([team, score], index) => (
            <span key={team}>
              {index > 0 && ' - '}
              {t.game.team} {team.replace('team', '')}: {score}
            </span>
          ))}
        </Typography>
      </Box>

      <Typography variant="subtitle1" gutterBottom color="primary">
        {activeTeam ? 
          `${t.game.answering} ${activeTeam}` : 
          `${t.game.turn} ${currentTeam}`}
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
            {t.game.carré}
          </Button>
          <Button 
            variant={answerType === 'cache' ? 'contained' : 'outlined'}
            onClick={() => handleAnswerTypeSelect('cache')}
          >
            {t.game.cache}
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
          t={t}
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
          t={t}
        />
      )}

      {showAnswer && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="primary">
            {t.game.correctAnswer}: {question.answer}
          </Typography>
          
          {activeTeam && (
            <>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mt: 1,
                  color: lastAnswerCorrect ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}
              >
                {lastAnswerCorrect ? 
                  `✓ ${t.game.correctAnswer}! (${answerType === 'cache' ? '5' : '1'} ${answerType === 'cache' ? t.game.points : t.game.point})` : 
                  `✗ ${t.game.wrongAnswer}`}
              </Typography>
              {isVerifying ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography>{t.game.verifying || 'Verifying answer...'}</Typography>
                </Box>
              ) : verificationResult?.explanation && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mt: 1,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1
                  }}
                >
                  {verificationResult.explanation}
                </Typography>
              )}
            </>
          )}

          <Typography variant="body1" sx={{ mt: 2 }}>
            {t.game.funFact}: {question.funFact}
          </Typography>
        </Box>
      )}

      <Button 
        variant="contained" 
        onClick={onNextQuestion}
        disabled={!showAnswer}
      >
        {t.game.nextQuestion}
      </Button>
    </Box>
  );
}

export default QuestionComponent; 