import React, { useState } from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';
import TeamReadyButtons from './TeamReadyButtons';

// Array di colori per le squadre
const TEAM_COLORS = ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#795548'];

function CacheQuestion({ 
  answer,
  gameSettings,
  readyTeams,
  onTeamReady,
  onAnswer,
  allTeamsReady,
  t
}) {
  const [proposedAnswer, setProposedAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const buzzedTeam = Array.from(readyTeams)[0]; // Get the first (and only) team that buzzed

  const handleSubmit = () => {
    const correct = proposedAnswer.toLowerCase().trim() === answer.toLowerCase().trim();
    setIsCorrect(correct);
    setHasAnswered(true);
    onAnswer(`team${buzzedTeam}`, correct);
  };

  if (!readyTeams.size) {
    return (
      <TeamReadyButtons
        gameSettings={gameSettings}
        readyTeams={readyTeams}
        onTeamReady={onTeamReady}
        t={t}
      />
    );
  }

  if (hasAnswered) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t.game.answering} {buzzedTeam}:
        </Typography>
        <Typography 
          variant="body1" 
          gutterBottom 
          sx={{ 
            color: isCorrect ? 'success.main' : 'error.main',
            fontWeight: 'bold'
          }}
        >
          {proposedAnswer}
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          {t.game.correctAnswer}:
        </Typography>
        <Typography variant="body1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
          {answer}
        </Typography>

        <Typography 
          variant="h5" 
          sx={{ 
            mt: 2,
            color: isCorrect ? 'success.main' : 'error.main',
            fontWeight: 'bold'
          }}
        >
          {isCorrect ? 
            `✓ ${t.game.correctAnswer}! (5 ${t.game.points})` : 
            `✗ ${t.game.wrongAnswer}`}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {t.game.team} {buzzedTeam}, {t.game.typeAnswer}:
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          variant="outlined"
          value={proposedAnswer}
          onChange={(e) => setProposedAnswer(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: TEAM_COLORS[buzzedTeam - 1],
              },
              '&:hover fieldset': {
                borderColor: TEAM_COLORS[buzzedTeam - 1],
              },
              '&.Mui-focused fieldset': {
                borderColor: TEAM_COLORS[buzzedTeam - 1],
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: TEAM_COLORS[buzzedTeam - 1],
            '&:hover': {
              bgcolor: `${TEAM_COLORS[buzzedTeam - 1]}dd`,
            },
          }}
        >
          {t.game.confirm}
        </Button>
      </Box>
    </Box>
  );
}

export default CacheQuestion; 