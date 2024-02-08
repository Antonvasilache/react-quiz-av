import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Footer from "./Footer";
import Timer from "./Timer";
import PreviousButton from "./PreviousButton";

const initialState = {
  questions: [],
  //'loading', 'error', 'ready', 'active', 'finished'
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: localStorage.getItem("highscore"),
  secondsRemaining: null,
  answersArray: [],
};

const SECONDS_PER_QUESTION = 30;

const newAnswers = function (array, index, answer) {
  array.splice(index, 1, answer);

  return array;
};

const randomize = function (array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: randomize(action.payload),
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
      console.log(question);
      console.log(action.payload);
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
      localStorage.setItem(
        "highscore",
        state.points > state.highscore ? state.points : ""
      );
      return {
        ...state,
        status: "finished",
        points: state.answersArray
          .filter((ans) => ans.at(2) === true)
          .reduce((acc, current) => acc + current.at(3), 0),
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };

    case "reset":
      return {
        ...initialState,
        questions: randomize(state.questions),
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

export default function App() {
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
    <div className="app">
      <Header />

      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen
            numQuestions={numQuestions}
            dispatch={dispatch}
            highscore={highscore}
          />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPoints={maxPoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <PreviousButton
                dispatch={dispatch}
                answer={answer}
                index={index}
              />
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestions={numQuestions}
                index={index}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishScreen
            points={points}
            maxPoints={maxPoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}
