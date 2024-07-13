import React, { useCallback, useState } from "react";
import axios from "axios";
// import DownloadVideos from "./Pages/DownloadVideos";

function App() {
  const [inputStates, setInputStates] = useState([]);
  const [countInputBox, setCountInputBox] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (url) => {
    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        responseType: "blob",
      });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = url.split("/").pop(); // Use the last part of the URL as the filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Error downloading the video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAll = async (e) => {
    e.preventDefault();
    for (const link of inputStates) {
      await handleDownload(link);
    }
  };

  const handleChange = useCallback((e, index) => {
    const { value } = e.target;
    setInputStates((prevState) => {
      // Check if the index exists in the previous state
      const newState = [...prevState];
      if (newState[index] !== undefined) {
        // Update the existing value
        newState[index] = value;
      } else {
        // Create a new entry at the index
        newState[index] = value;
      }
      return newState;
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-2xl flex flex-col justify-center items-center w-full max-w-5xl p-4 bg-slate-700 rounded-lg shadow-md mx-4">
        <span className="m-4 font-medium p-2 text-center rounded-lg max-w-48">
          Paste Link Here
        </span>

        {/* Form to submit  */}
        <form className="w-full" onSubmit={downloadAll}>
          {[...Array(countInputBox)].map((_, index) => (
            <div key={index}>
              <label
                htmlFor={`link-${index}`}
                className="relative overflow-hidden rounded-md border pl-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex my-4"
              >
                <input
                  type="text"
                  id={`link-${index}`}
                  placeholder="Paste link here..."
                  className="peer h-8 w-full border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm items-center my-3 py-4"
                  value={inputStates[index]}
                  onChange={(e) => handleChange(e, index)}
                />
                <span className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs">
                  Paste link here...
                </span>
              </label>
            </div>
          ))}

          {/* Add more input box button*/}
          <button
            type="button"
            className="w-24 flex rounded border border-indigo-600 bg-indigo-600 px-2 py-3 text-sm font:sm md:font-medium text-slate-300 hover:bg-transparent hover:text-indigo-600 text-center items-center justify-center"
            onClick={() => setCountInputBox(countInputBox + 1)}
          >
            More Link
          </button>

          {/* Download Button */}
          <button
            type="submit"
            className="w-full inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-slate-300  hover:bg-transparent hover:text-indigo-600 mt-4 text-center"
          >
            {isLoading ? "Downloading..." : "Download"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
