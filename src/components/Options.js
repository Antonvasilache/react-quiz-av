import { useQuiz } from "../context/QuizContext";

function Options({ question }) {
  const { dispatch, answer, answersArray, index } = useQuiz();

  return (
    <div className="options">
      {question.options.map((option) => (
        <button
          className={`btn btn-option ${
            option === answer ||
            (answersArray.at(index) && option === answersArray.at(index).at(1))
              ? "answer"
              : ""
          } `}
          key={option}
          onClick={() => dispatch({ type: "newAnswer", payload: option })}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default Options;

//styling for correct/wrong answer
//const hasAnswered = answer !== null;
// ${
//   hasAnswered
//     ? index === question.correctOption
//       ? "correct"
//       : "wrong"
//     : ""
// }

//disabled={hasAnswered}
