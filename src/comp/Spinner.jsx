import ClipLoader from "react-spinners/ClipLoader";

const Spinner = () => {
  return (
    <div className="sweet-loading">
      <ClipLoader 
        color="#ffffff"
        size={20}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Spinner;
