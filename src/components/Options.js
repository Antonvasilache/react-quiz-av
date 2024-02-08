function Options({ question, dispatch, answer }) {
  const randomizeQuestion = function (array) {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  return (
    <div className="options">
      {question.options.map((option, index) => (
        <button
          className={`btn btn-option ${index === answer ? "answer" : ""} `}
          key={option}
          onClick={() => dispatch({ type: "newAnswer", payload: index })}
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
