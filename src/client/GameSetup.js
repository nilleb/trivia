import React from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl,
  InputLabel,
  Typography
} from '@mui/material';

function GameSetup({ gameSettings, setGameSettings, gameState, setGameState, onStartGame, t }) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t.gameSetup.title}
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t.gameSetup.players}</InputLabel>
        <Select
          value={gameSettings.players}
          onChange={(e) => setGameSettings({...gameSettings, players: e.target.value})}
        >
          {[2,3,4,5,6].map(num => (
            <MenuItem key={num} value={num}>{num}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t.gameSetup.language}</InputLabel>
        <Select
          value={gameSettings.language}
          onChange={(e) => setGameSettings({...gameSettings, language: e.target.value})}
        >
          <MenuItem value="it">Italiano</MenuItem>
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="fr">Français</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t.gameSetup.difficulty.label}</InputLabel>
        <Select
          value={gameSettings.difficulty}
          onChange={(e) => setGameSettings({...gameSettings, difficulty: e.target.value})}
        >
          <MenuItem value="facile">{t.gameSetup.difficulty.easy}</MenuItem>
          <MenuItem value="medio">{t.gameSetup.difficulty.medium}</MenuItem>
          <MenuItem value="difficile">{t.gameSetup.difficulty.hard}</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="number"
        label={t.gameSetup.questionsPerRound}
        value={gameSettings.questionsPerRound}
        onChange={(e) => setGameSettings({...gameSettings, questionsPerRound: e.target.value})}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="number"
        label={t.gameSetup.timePerQuestion}
        value={gameSettings.timePerQuestion}
        onChange={(e) => setGameSettings({...gameSettings, timePerQuestion: e.target.value})}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label={t.gameSetup.theme}
        value={gameState.theme || ''}
        onChange={(e) => setGameState({...gameState, theme: e.target.value})}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={!gameState.theme}
        onClick={onStartGame}
        sx={{ mt: 2, mb: 2 }}
      >
        {t.gameSetup.startGame}
      </Button>

      {gameState.error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {gameState.error}
        </Typography>
      )}
    </Box>
  );
}

export default GameSetup; 