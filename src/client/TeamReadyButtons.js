import React from 'react';
import { Box, Button } from '@mui/material';

// Array di colori per le squadre
const TEAM_COLORS = ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#795548'];

function TeamReadyButtons({ 
  gameSettings,
  readyTeams,
  onTeamReady
}) {
  // If any team is ready, all other buttons should be disabled
  const isAnyTeamReady = readyTeams.size > 0;

  return (
    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {Array.from({length: gameSettings.players}, (_, i) => i + 1).map(teamNum => {
        const isThisTeamReady = readyTeams.has(teamNum);
        
        return (
          <Button
            key={teamNum}
            variant={isThisTeamReady ? 'contained' : 'outlined'}
            onClick={() => onTeamReady(teamNum)}
            disabled={isAnyTeamReady && !isThisTeamReady}
            sx={{
              bgcolor: isThisTeamReady ? TEAM_COLORS[teamNum - 1] : 'transparent',
              color: isThisTeamReady ? 'white' : TEAM_COLORS[teamNum - 1],
              borderColor: TEAM_COLORS[teamNum - 1],
              '&:hover': {
                bgcolor: isThisTeamReady ? TEAM_COLORS[teamNum - 1] : `${TEAM_COLORS[teamNum - 1]}11`,
                borderColor: TEAM_COLORS[teamNum - 1]
              },
              '&.Mui-disabled': {
                borderColor: '#ccc',
                color: '#999',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Lo so (Squadra {teamNum})
          </Button>
        );
      })}
    </Box>
  );
}

export default TeamReadyButtons; 