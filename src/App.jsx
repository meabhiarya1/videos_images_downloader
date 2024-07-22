import { useState } from "react";
import axios from "axios";
import Spinner from "./comp/Spinner";

function App() {
  const [inputStates, setInputStates] = useState([""]); // Initialize with one empty input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState([]); // Track individual errors for each input
  let downloadedVideos = [];
  const connection = import.meta.env.VITE_API_URL;

  const handleDownload = async (url, index) => {
    try {
      // Send a POST request to the backend endpoint
      const response = await axios.post(`${connection}/download/video`, {
        url,
      });

      const videoName = response.data;
      downloadedVideos.push(videoName);

      const downloadUrl = `${connection}/downloads/${videoName}`;

      // Fetch the video data
      const videoResponse = await fetch(downloadUrl);
      const videoBlob = await videoResponse.blob();

      // Verify the blob data
      if (!videoBlob.type.startsWith("video/")) {
        throw new Error("Downloaded file is not a video");
      }

      // Create a temporary URL for the video blob
      const videoBlobUrl = URL.createObjectURL(videoBlob);

      // Create a link element
      const link = document.createElement("a");
      link.href = videoBlobUrl;
      link.setAttribute("download", videoName);

      // Append the link to the body
      document.body.appendChild(link);

      // Trigger the click event to start download
      link.click();

      // Clean up: Remove the link and revoke the blob URL
      document.body.removeChild(link);
      URL.revokeObjectURL(videoBlobUrl);
    } catch (error) {
      console.error(`Error downloading video at index ${index + 1}:`, error);
      throw new Error(`Failed to download video at index ${index + 1}`);
    }
  };

  const downloadAll = async (e) => {
    e.preventDefault();
    setError("");
    setErrorDetails([]);
    setIsLoading(true);

    try {
      const downloadPromises = inputStates.map((link, index) =>
        handleDownload(link, index).catch((err) => {
          setErrorDetails((prev) => [...prev, { index, message: err.message }]);
        })
      );
      // Wait for all download promises to complete
      await Promise.all(downloadPromises);

      if (errorDetails.length > 0) {
        setError("Some downloads failed. Please check the individual errors.");
      }
    } catch (error) {
      console.error("Error during download all:", error);
      setError("An error occurred during the download. Please try again.");
    } finally {
      // await cleanup();
      setIsLoading(false);
      setInputStates([""]); // Reset input fields after processing
      downloadedVideos = [];
    }
  };

  const cleanup = async () => {
    try {
      if (downloadedVideos.length > 0) {
        await axios.post(`${connection}/delete/video`, {
          videos: downloadedVideos,
        });
        // Clear downloaded videos state after successful cleanup
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      throw new Error("Cleanup failed"); // Ensure cleanup failure is handled in downloadAll
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
        <span className="m-4 font-medium p-2 text-center rounded-lg max-w-md text-sm">
          Paste Video Link...
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
                  disabled={isLoading}
                />
                <span className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs">
                  Paste link here...
                </span>
              </label>
              {errorDetails.some((err) => err.index === index) && (
                <div className="text-red-500 text-sm">
                  {errorDetails.find((err) => err.index === index).message}
                </div>
              )}
            </div>
          ))}

          {/* Add more input box button */}
          <button
            type="button"
            className="w-24 flex rounded border border-indigo-600 bg-indigo-600 px-2 py-3 text-sm font:sm md:font-medium text-slate-300 hover:bg-transparent hover:text-indigo-600 text-center items-center justify-center"
            disabled={isLoading}
            onClick={() => setInputStates((prevInputs) => [...prevInputs, ""])}
          >
            More Link
          </button>

          {/* Download Button */}
          <button
            type="submit"
            className="w-full inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-slate-300 hover:bg-transparent hover:text-indigo-600 my-4 text-center"
            disabled={
              isLoading || inputStates.every((input) => input.trim() === "")
            }
          >
            {isLoading ? <Spinner /> : "Download"}
          </button>

          {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default App;
