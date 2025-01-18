import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl,
  InputLabel,
  Typography
} from '@mui/material';
import GameComponent from './GameComponent';

function App() {
  const [gameSettings, setGameSettings] = useState({
    players: 2,
    language: 'italiano',
    difficulty: 'medio',
    questionsPerRound: 10,
    timePerQuestion: 30
  });

  const [gameState, setGameState] = useState({
    isPlaying: false,
    currentQuestion: null,
    timer: null,
    showAnswer: false,
    questions: [],
    theme: ''
  });

  const startGame = async (theme) => {
    try {
      setGameState({
        ...gameState,
        isPlaying: true,
        questions: [],
        currentQuestion: null,
        error: null
      });

      const response = await fetch(`/api/questions?theme=${theme}`);
      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('Nessuna domanda ricevuta');
      }

      setGameState({
        ...gameState,
        isPlaying: true,
        questions: data.questions,
        currentQuestion: 0,
        error: null
      });
    } catch (error) {
      console.error('Errore:', error);
      setGameState({
        ...gameState,
        isPlaying: false,
        error: error.message || 'Errore nel caricamento delle domande'
      });
    }
  };

  return (
    <Container>
      {!gameState.isPlaying ? (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Impostazioni Gioco
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Numero di Giocatori</InputLabel>
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
            <InputLabel>Lingua</InputLabel>
            <Select
              value={gameSettings.language}
              onChange={(e) => setGameSettings({...gameSettings, language: e.target.value})}
            >
              <MenuItem value="italiano">Italiano</MenuItem>
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="français">Français</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficoltà</InputLabel>
            <Select
              value={gameSettings.difficulty}
              onChange={(e) => setGameSettings({...gameSettings, difficulty: e.target.value})}
            >
              <MenuItem value="facile">Facile</MenuItem>
              <MenuItem value="medio">Medio</MenuItem>
              <MenuItem value="difficile">Difficile</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Domande per manche"
            value={gameSettings.questionsPerRound}
            onChange={(e) => setGameSettings({...gameSettings, questionsPerRound: e.target.value})}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Secondi per risposta"
            value={gameSettings.timePerQuestion}
            onChange={(e) => setGameSettings({...gameSettings, timePerQuestion: e.target.value})}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Tema delle domande"
            value={gameState.theme || ''}
            onChange={(e) => setGameState({...gameState, theme: e.target.value})}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!gameState.theme}
            onClick={() => startGame(gameState.theme)}
            sx={{ mt: 2, mb: 2 }}
          >
            Inizia Gioco
          </Button>

          {gameState.error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {gameState.error}
            </Typography>
          )}
        </Box>
      ) : (
        <GameComponent 
          gameState={gameState}
          setGameState={setGameState}
          gameSettings={gameSettings}
        />
      )}
    </Container>
  );
}

export default App; 