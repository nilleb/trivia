import React from 'react';
import { Container } from '@mui/material';
import LogoutButton from './LogoutButton';
import GameSetup from '../GameSetup';
import QuestionComponent from '../QuestionComponent';
import EndGameScreen from '../EndGameScreen';

const GameContainer = ({
  gameState,
  gameSettings,
  setGameSettings,
  setGameState,
  onStartGame,
  onLogout,
  handleAnswer,
  handleNextQuestion,
  handleNewGame,
  t
}) => {
  if (gameState.isGameOver) {
    return (
      <Container>
        <LogoutButton onLogout={onLogout} />
        <EndGameScreen
          scores={gameState.scores}
          onNewGame={handleNewGame}
          t={t}
        />
      </Container>
    );
  }

  if (!gameState.isPlaying) {
    return (
      <Container>
        <LogoutButton onLogout={onLogout} />
        <GameSetup
          gameSettings={gameSettings}
          setGameSettings={setGameSettings}
          gameState={gameState}
          setGameState={setGameState}
          onStartGame={onStartGame}
          t={t}
        />
      </Container>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestion];

  return (
    <Container>
      <LogoutButton onLogout={onLogout} />
      <QuestionComponent
        question={currentQuestion}
        currentTeam={(gameState.currentQuestion % gameSettings.players) + 1}
        gameSettings={gameSettings}
        scores={gameState.scores}
        onAnswer={handleAnswer}
        onNextQuestion={handleNextQuestion}
        questionNumber={gameState.currentQuestion + 1}
        totalQuestions={gameSettings.questionsPerRound}
        t={t}
      />
    </Container>
  );
};

export default GameContainer; 