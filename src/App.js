import Main from "./components/Main";
import Error from "./components/Error";
import Timer from "./components/Timer";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Progress from "./components/Progress";
import Question from "./components/Question";
import NextButton from "./components/NextButton";
import StartScreen from "./components/StartScreen";
import FinishScreen from "./components/FinishScreen";
import PreviousButton from "./components/PreviousButton";
import { useQuiz } from "./context/QuizContext";

export default function App() {
  const { status } = useQuiz();
  return (
    <div className="app">
      <Header />

      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && <StartScreen />}
        {status === "active" && (
          <>
            <Progress />
            <Question />
            <Footer>
              <PreviousButton />
              <Timer />
              <NextButton />
            </Footer>
          </>
        )}
        {status === "finished" && <FinishScreen />}
      </Main>
    </div>
  );
}
