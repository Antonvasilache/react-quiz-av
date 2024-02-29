import { createContext, useContext, useEffect, useReducer } from "react";

const questionsData = {
  questions: [
    {
      question: "Which is the most popular JavaScript framework?",
      options: ["Angular", "React", "Svelte", "Vue"],
      correctOption: "React",
      points: 10,
    },
    {
      question: "Which company invented React?",
      options: ["Google", "Apple", "Netflix", "Facebook"],
      correctOption: "Facebook",
      points: 10,
    },
    {
      question: "What's the fundamental building block of React apps?",
      options: ["Components", "Blocks", "Elements", "Effects"],
      correctOption: "Components",
      points: 10,
    },
    {
      question:
        "What's the name of the syntax we use to describe the UI in React components?",
      options: ["FBJ", "Babel", "JSX", "ES2015"],
      correctOption: "JSX",
      points: 10,
    },
    {
      question: "How does data flow naturally in React apps?",
      options: [
        "From parents to children",
        "From children to parents",
        "Both ways",
        "The developers decides",
      ],
      correctOption: "From parents to children",
      points: 10,
    },
    {
      question: "How to pass data into a child component?",
      options: ["State", "Props", "PropTypes", "Parameters"],
      correctOption: "Props",
      points: 10,
    },
    {
      question: "When to use derived state?",
      options: [
        "Whenever the state should not trigger a re-render",
        "Whenever the state can be synchronized with an effect",
        "Whenever the state should be accessible to all components",
        "Whenever the state can be computed from another state variable",
      ],
      correctOption:
        "Whenever the state can be computed from another state variable",
      points: 30,
    },
    {
      question: "What triggers a UI re-render in React?",
      options: [
        "Running an effect",
        "Passing props",
        "Updating state",
        "Adding event listeners to DOM elements",
      ],
      correctOption: "Updating state",
      points: 20,
    },
    {
      question: 'When do we directly "touch" the DOM in React?',
      options: [
        "When we need to listen to an event",
        "When we need to change the UI",
        "When we need to add styles",
        "Almost never",
      ],
      correctOption: "Almost never",
      points: 20,
    },
    {
      question: "In what situation do we use a callback to update state?",
      options: [
        "When updating the state will be slow",
        "When the updated state is very data-intensive",
        "When the state update should happen faster",
        "When the new state depends on the previous state",
      ],
      correctOption: "When the new state depends on the previous state",
      points: 30,
    },
    {
      question:
        "If we pass a function to useState, when will that function be called?",
      options: [
        "On each re-render",
        "Each time we update the state",
        "Only on the initial render",
        "The first time we update the state",
      ],
      correctOption: "Only on the initial render",
      points: 30,
    },
    {
      question:
        "Which hook to use for an API request on the component's initial render?",
      options: ["useState", "useEffect", "useRef", "useReducer"],
      correctOption: "useEffect",
      points: 10,
    },
    {
      question:
        "Which variables should go into the useEffect dependency array?",
      options: [
        "Usually none",
        "All our state variables",
        "All state and props referenced in the effect",
        "All variables needed for clean up",
      ],
      correctOption: "All state and props referenced in the effect",
      points: 30,
    },
    {
      question: "An effect will always run on the initial render.",
      options: [
        "True",
        "It depends on the dependency array",
        "False",
        "In depends on the code in the effect",
      ],
      correctOption: "True",
      points: 30,
    },
    {
      question:
        "When will an effect run if it doesn't have a dependency array?",
      options: [
        "Only when the component mounts",
        "Only when the component unmounts",
        "The first time the component re-renders",
        "Each time the component is re-rendered",
      ],
      correctOption: "Each time the component is re-rendered",
      points: 20,
    },
  ],
};

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
    dispatch({ type: "dataReceived", payload: questionsData.questions });

    //Option to fetch the questions from an external source
    // fetch(`http://localhost:9000/questions`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     dispatch({ type: "dataReceived", payload: data });
    //     console.log(data);
    //   })
    //   .catch((err) => dispatch({ type: "dataFailed" }));
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
