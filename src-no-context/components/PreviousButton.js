function PreviousButton({ dispatch, answer, index, answersArray }) {
  if (answer === null && answersArray.length === 0) return;

  if (index > 0)
    return (
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: "previousQuestion" })}
      >
        Previous
      </button>
    );
}
export default PreviousButton;
