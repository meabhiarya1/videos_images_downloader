import React, { useState } from "react";
import axios from "axios";

function App() {
  const [inputStates, setInputStates] = useState([""]); // Initialize with one empty input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadedFiles, setDownloadedFiles] = useState([]);

  const handleDownload = async (url) => {
    try {
      setIsLoading(true);

      // Send a POST request to the backend endpoint
      const response = await axios.post(
        "http://localhost:8080/download-video",
        { url }
      );

      const downloadUrl = await axios.get(
        `http://localhost:8080/downloads/${response.data}`
      );
      // Create a link element
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.target = "_blank"; // Optional: Open in new tab
      link.setAttribute("download", `${response.data}`); // Optional: Specify filename for download

      // Append the link to the body
      document.body.appendChild(link);

      // Trigger the click event to start download
      link.click();

      // Clean up: Remove the link from the DOM
      document.body.removeChild(link);

      // Add downloaded file info to state
      // setDownloadedFiles((prevFiles) => [
      //   ...prevFiles,
      //   { url, filePath: response.data },
      // ]);
    } catch (error) {
      console.error("Error downloading the video:", error);
      setError("Failed to download the video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAll = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await Promise.all(inputStates.map((link) => handleDownload(link)));
    } catch (error) {
      console.error("Error during download all:", error);
      setError("An error occurred during the download. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const { value } = e.target;
    setInputStates((prevInputs) => {
      const updatedInputs = [...prevInputs];
      updatedInputs[index] = value;
      return updatedInputs;
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-2xl flex flex-col justify-center items-center w-full max-w-5xl p-4 bg-slate-700 rounded-lg shadow-md mx-4">
        <span className="m-4 font-medium p-2 text-center rounded-lg max-w-48">
          Paste Link Here
        </span>

        {/* Form to submit */}
        <form className="w-full" onSubmit={downloadAll}>
          {inputStates.map((link, index) => (
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
                  value={link}
                  onChange={(e) => handleChange(e, index)}
                />
                <span className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs">
                  Paste link here...
                </span>
              </label>
            </div>
          ))}

          {/* Add more input box button */}
          <button
            type="button"
            className="w-24 flex rounded border border-indigo-600 bg-indigo-600 px-2 py-3 text-sm font:sm md:font-medium text-slate-300 hover:bg-transparent hover:text-indigo-600 text-center items-center justify-center"
            onClick={() => setInputStates((prevInputs) => [...prevInputs, ""])}
          >
            More Link
          </button>

          {/* Download Button */}
          <button
            type="submit"
            className="w-full inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-slate-300 hover:bg-transparent hover:text-indigo-600 mt-4 text-center"
          >
            {isLoading ? "Downloading..." : "Download"}
          </button>
          {error && <div className="mt-4 text-red-500">{error}</div>}
        </form>

        {/* Display downloaded files */}
        {/* {downloadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-2">Downloaded Files:</h2>
            <ul className="text-white">
              {downloadedFiles.map((file, index) => (
                <li key={index}>
                  <a href={file.filePath} download="video.mp4">
                    {file.url} - {file.filePath}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default App;
