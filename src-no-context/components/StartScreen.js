function StartScreen({ numQuestions, dispatch, highscore }) {
  return (
    <div className="start">
      <h2>Welcome to the React Quiz!</h2>
      <h3>{numQuestions} questions to test your React mastery</h3>
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: "start" })}
      >
        Let's start
      </button>
      <h4>Highscore: {highscore}</h4>
    </div>
  );
}

export default StartScreen;
