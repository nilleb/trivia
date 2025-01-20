import CacheQuestion from '../client/CacheQuestion';

export default {
  title: 'Game/CacheQuestion',
  component: CacheQuestion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

const mockGameSettings = {
  players: 3,
  timePerQuestion: 30,
};

export const WaitingForBuzz = {
  args: {
    answer: 'La Torre Eiffel',
    gameSettings: mockGameSettings,
    readyTeams: new Set(),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in!`),
    onAnswer: (teamNum) => console.log(`Team ${teamNum} got it right!`),
    allTeamsReady: false,
  },
};

export const Team1Buzzed = {
  args: {
    answer: 'La Torre Eiffel',
    gameSettings: mockGameSettings,
    readyTeams: new Set([1]),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in!`),
    onAnswer: (teamNum) => console.log(`Team ${teamNum} got it right!`),
    allTeamsReady: false,
  },
};

export const ShowingAnswer = {
  args: {
    answer: 'La Torre Eiffel',
    gameSettings: mockGameSettings,
    readyTeams: new Set([2]),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in!`),
    onAnswer: (teamNum) => console.log(`Team ${teamNum} got it right!`),
    allTeamsReady: true,
  },
};

export const WithMoreTeams = {
  args: {
    answer: 'La Torre Eiffel',
    gameSettings: { ...mockGameSettings, players: 6 },
    readyTeams: new Set([4]),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in!`),
    onAnswer: (teamNum) => console.log(`Team ${teamNum} got it right!`),
    allTeamsReady: true,
  },
}; 