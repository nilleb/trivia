import React from 'react';
import { Box, Button } from '@mui/material';
import TeamReadyButtons from './TeamReadyButtons';

// Array di colori per le squadre
const TEAM_COLORS = ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#795548'];

function CarréQuestion({ 
  shuffledAnswers, 
  currentTeam, 
  readyTeams,
  onAnswer,
  onTeamReady,
  gameSettings,
  t
}) {
  const isAnyTeamReady = readyTeams.size > 0;

  return (
    <>
      <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {shuffledAnswers.map((answer, index) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => isAnyTeamReady && onAnswer(answer)}
            disabled={!isAnyTeamReady}
            sx={{ 
              p: 2, 
              minHeight: '60px',
              opacity: isAnyTeamReady ? 1 : 0.9,
              cursor: isAnyTeamReady ? 'pointer' : 'not-allowed',
              borderColor: isAnyTeamReady ? TEAM_COLORS[currentTeam - 1] : '#999',
              color: isAnyTeamReady ? TEAM_COLORS[currentTeam - 1] : '#666',
              borderWidth: '2px',
              backgroundColor: isAnyTeamReady ? 'transparent' : '#f5f5f5',
              '&:hover': {
                borderColor: isAnyTeamReady ? TEAM_COLORS[currentTeam - 1] : '#999',
                bgcolor: isAnyTeamReady ? `${TEAM_COLORS[currentTeam - 1]}11` : '#f5f5f5'
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
        ))}
      </Box>

      <TeamReadyButtons
        gameSettings={gameSettings}
        readyTeams={readyTeams}
        onTeamReady={onTeamReady}
        t={t}
      />
    </>
  );
}

export default CarréQuestion; 