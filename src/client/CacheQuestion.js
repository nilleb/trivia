import React from 'react';
import { Box, Button, Typography, ButtonGroup } from '@mui/material';
import TeamReadyButtons from './TeamReadyButtons';

// Array di colori per le squadre
const TEAM_COLORS = ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#795548'];

function CacheQuestion({ 
  answer,
  gameSettings,
  readyTeams,
  onTeamReady,
  onAnswer,
  allTeamsReady
}) {
  if (!allTeamsReady) {
    return (
      <TeamReadyButtons
        gameSettings={gameSettings}
        readyTeams={readyTeams}
        onTeamReady={onTeamReady}
      />
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" color="primary" gutterBottom>
        Risposta: {answer}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        Chi ha indovinato?
      </Typography>
      <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
        {Array.from({length: gameSettings.players}, (_, i) => i + 1).map(teamNum => (
          <Button 
            key={teamNum}
            onClick={() => onAnswer(`team${teamNum}`)}
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
        <Button onClick={() => onAnswer(null)}>Nessuno</Button>
      </ButtonGroup>
    </Box>
  );
}

export default CacheQuestion; 