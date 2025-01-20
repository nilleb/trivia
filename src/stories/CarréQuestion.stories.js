import CarréQuestion from '../client/CarréQuestion';

export default {
  title: 'Game/CarréQuestion',
  component: CarréQuestion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

// Mock data
const mockAnswers = ['Roma', 'Parigi', 'Londra', 'Madrid'];

const mockGameSettings = {
  players: 3,
  timePerQuestion: 30
};

export const WaitingForBuzz = {
  args: {
    shuffledAnswers: mockAnswers,
    currentTeam: 1,
    readyTeams: new Set(),
    onAnswer: (answer) => console.log(`Selected answer: ${answer}`),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in!`),
    gameSettings: mockGameSettings,
  },
};

export const Team1Answering = {
  args: {
    shuffledAnswers: mockAnswers,
    currentTeam: 1,
    readyTeams: new Set([1]),
    onAnswer: (answer) => console.log(`Team 1 selected: ${answer}`),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in!`),
    gameSettings: mockGameSettings,
  },
};

export const Team2Answering = {
  args: {
    shuffledAnswers: mockAnswers,
    currentTeam: 2,
    readyTeams: new Set([2]),
    onAnswer: (answer) => console.log(`Team 2 selected: ${answer}`),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in!`),
    gameSettings: mockGameSettings,
  },
};

export const WithMoreTeams = {
  args: {
    shuffledAnswers: mockAnswers,
    currentTeam: 4,
    readyTeams: new Set([4]),
    onAnswer: (answer) => console.log(`Team 4 selected: ${answer}`),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in!`),
    gameSettings: { ...mockGameSettings, players: 6 },
  },
}; 