import Options from "./Options";

function Question({ question, dispatch, answer, answersArray, index }) {
  return (
    <div>
      <h4>{question.question}</h4>
      <Options
        question={question}
        dispatch={dispatch}
        answer={answer}
        answersArray={answersArray}
        index={index}
      />
    </div>
  );
}

export default Question;
