import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Celebration } from '@mui/icons-material';

// Array di colori per le squadre
const TEAM_COLORS = ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#795548'];

function EndGameScreen({ scores, onNewGame, t }) {
  // Find the winning team(s)
  const maxScore = Math.max(...Object.values(scores));
  const winners = Object.entries(scores)
    .filter(([_, score]) => score === maxScore)
    .map(([team]) => team);

  return (
    <Box sx={{ 
      mt: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3
    }}>
      <Typography variant="h3" gutterBottom align="center">
        {t.game.gameOver}
      </Typography>

      {/* Winner announcement */}
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Celebration sx={{ fontSize: 40, color: 'gold' }} />
        <Typography variant="h4" color="primary">
          {winners.length > 1 
            ? t.game.tie
            : `${t.game.winner}: ${t.game.team} ${winners[0].replace('team', '')}`}
        </Typography>
        <Celebration sx={{ fontSize: 40, color: 'gold' }} />
      </Box>

      {/* Final Scores */}
      <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom align="center">
          {t.game.finalScores}
        </Typography>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mt: 2
        }}>
          {Object.entries(scores)
            .sort(([, a], [, b]) => b - a) // Sort by score in descending order
            .map(([team, score], index) => (
              <Box 
                key={team}
                sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  bgcolor: winners.includes(team) ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  border: winners.includes(team) ? '1px solid gold' : '1px solid transparent'
                }}
              >
                <Typography 
                  variant="h6"
                  sx={{ 
                    color: TEAM_COLORS[parseInt(team.replace('team', '')) - 1],
                    fontWeight: winners.includes(team) ? 'bold' : 'normal'
                  }}
                >
                  {t.game.team} {team.replace('team', '')}
                </Typography>
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: winners.includes(team) ? 'bold' : 'normal'
                  }}
                >
                  {score} {score === 1 ? t.game.point : t.game.points}
                </Typography>
              </Box>
            ))}
        </Box>
      </Paper>

      <Button 
        variant="contained" 
        color="primary" 
        size="large"
        onClick={onNewGame}
        sx={{ mt: 3 }}
      >
        {t.game.newGame}
      </Button>
    </Box>
  );
}

export default EndGameScreen; 