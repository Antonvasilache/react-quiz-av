function PreviousButton({ dispatch, answer, index }) {
  if (answer === null) return;

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
