import TeamReadyButtons from '../client/TeamReadyButtons';

export default {
  title: 'Game/TeamReadyButtons',
  component: TeamReadyButtons,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

const mockGameSettings = {
  players: 3,
  timePerQuestion: 30,
};

export const NoTeamBuzzedYet = {
  args: {
    gameSettings: mockGameSettings,
    readyTeams: new Set(),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in first!`),
  },
};

export const Team1Buzzed = {
  args: {
    gameSettings: mockGameSettings,
    readyTeams: new Set([1]),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in first!`),
  },
};

export const Team2Buzzed = {
  args: {
    gameSettings: mockGameSettings,
    readyTeams: new Set([2]),
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in first!`),
  },
};

export const MoreTeamsAvailable = {
  args: {
    gameSettings: { ...mockGameSettings, players: 6 },
    readyTeams: new Set([3]), // Team 3 buzzed in
    onTeamReady: (teamNum) => console.log(`Team ${teamNum} buzzed in first!`),
  },
}; 