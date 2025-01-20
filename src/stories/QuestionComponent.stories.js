import QuestionComponent from '../client/QuestionComponent';

export default {
  title: 'Game/QuestionComponent',
  component: QuestionComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

const mockQuestion = {
  question: "Qual è il monumento più famoso di Parigi?",
  answer: "La Torre Eiffel",
  wrongAnswers: ["L'Arco di Trionfo", "Notre-Dame", "Il Louvre"],
  funFact: "La Torre Eiffel fu costruita in occasione dell'Esposizione Universale del 1889."
};

const mockGameSettings = {
  players: 3,
  timePerQuestion: 30,
  questionsPerRound: 10
};

const mockScores = {
  team1: 2,
  team2: 1,
  team3: 3
};

export const Loading = {
  args: {
    question: null,
    currentTeam: 1,
    gameSettings: mockGameSettings,
    scores: mockScores,
    onAnswer: (team, isCorrect) => console.log('Answer:', { team, isCorrect }),
    onNextQuestion: () => console.log('Next question'),
    questionNumber: 1,
    totalQuestions: 10
  },
};

export const NewQuestion = {
  args: {
    ...Loading.args,
    question: mockQuestion
  },
};

export const CarréMode = {
  args: {
    ...NewQuestion.args,
    answerType: 'carré'
  },
};

export const CacheMode = {
  args: {
    ...NewQuestion.args,
    answerType: 'cache'
  },
};

export const ShowingAnswer = {
  args: {
    ...CarréMode.args,
    showAnswer: true
  },
}; 