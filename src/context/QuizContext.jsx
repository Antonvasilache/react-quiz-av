import { createContext, useContext, useEffect, useReducer } from "react";

const QuizContext = createContext();

const initialState = {
  questions: [],
  //'loading', 'error', 'ready', 'active', 'finished'
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: localStorage.getItem("highscore")
    ? localStorage.getItem("highscore")
    : 0,
  secondsRemaining: null,
  answersArray: [],
};

const SECONDS_PER_QUESTION = 30;

//reselecting answers when going back and forth between questions
const newAnswers = function (array, index, answer) {
  array.splice(index, 1, answer);

  return array;
};

//randomize the questions order on each run
const randomize = function (array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

//randomize the options order on each run
const randomizeOptions = function (questions) {
  return questions.map((question) => ({
    ...question,
    options: randomize(question.options),
  }));
};

const calculatePoints = function (answersArray) {
  return answersArray
    .filter((ans) => ans.at(2) === true)
    .reduce((acc, current) => acc + current.at(3), 0);
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: randomizeOptions(randomize(action.payload)),
        status: "ready",
      };

    case "dataFailed":
      return { ...state, status: "error" };

    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECONDS_PER_QUESTION,
      };

    case "newAnswer":
      const question = state.questions.at(state.index);
      const correctFlag = action.payload === question.correctOption;
      const answeredQuestion = [
        question.id,
        action.payload,
        correctFlag,
        question.points,
      ];
      const answerFound = state.answersArray.find(
        (ans) => question.id === ans.at(0)
      );

      return {
        ...state,
        answer: action.payload,
        answersArray: answerFound
          ? newAnswers(state.answersArray, state.index, answeredQuestion)
          : [...state.answersArray, answeredQuestion],
      };

    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };

    case "previousQuestion":
      return { ...state, index: state.index - 1, answer: null };

    case "finish":
      const newPoints = calculatePoints(state.answersArray);
      localStorage.setItem(
        "highscore",
        newPoints > state.highscore ? newPoints : state.highscore
      );
      return {
        ...state,
        status: "finished",
        points: newPoints,
        highscore: newPoints > state.highscore ? newPoints : state.highscore,
      };

    case "reset":
      return {
        ...initialState,
        questions: randomizeOptions(randomize(state.questions)),
        status: "ready",
        highscore: state.highscore,
      };

    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };

    default:
      throw new Error("action unknown");
  }
}

function QuizProvider({ children }) {
  const [
    {
      questions,
      status,
      index,
      answer,
      points,
      highscore,
      secondsRemaining,
      answersArray,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPoints = questions.reduce(
    (prev, current) => prev + current.points,
    0
  );

  useEffect(function () {
    fetch(`http://localhost:9000/questions`)
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);

  return (
    <QuizContext.Provider
      value={{
        questions,
        numQuestions,
        maxPoints,
        status,
        index,
        answer,
        points,
        highscore,
        secondsRemaining,
        answersArray,

        dispatch,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined)
    throw new Error(`Context was used outside the Quiz Provider`);

  return context;
}

export { QuizProvider, useQuiz };
