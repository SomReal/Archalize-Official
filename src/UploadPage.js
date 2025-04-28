import React, { useState } from "react";

function UploadPage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [critique, setCritique] = useState("");
  const [loading, setLoading] = useState(false);

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setImagePreview(reader.result);
        sendImageToBackend(base64String);
      };
      reader.readAsDataURL(file);
    }
  }

  function sendImageToBackend(base64Image) {
    setCritique(""); // reset old critique
    setLoading(true);
  
    fetch('/api/critique', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Image }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.critique) {
          setCritique(data.critique);
        } else {
          setCritique("No critique generated. Please try again.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setCritique("An error occurred. Please try again.");
        setLoading(false);
      });
  }
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E293B] font-sans px-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Upload a Building Photo</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-6 block w-full max-w-sm text-sm text-white file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-yellow-400 file:text-black
          hover:file:bg-yellow-300"
      />

      {imagePreview && (
        <div className="mt-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2 text-yellow-400">Uploaded Image:</h2>
          <img src={imagePreview} alt="Preview" className="w-80 rounded-lg shadow-lg mb-6" />
        </div>
      )}

      {loading && (
        <p className="text-yellow-400 text-lg font-semibold animate-pulse">Analyzing with AI...</p>
      )}

      {critique && (
        <div className="mt-6 bg-white text-[#1E293B] p-6 rounded-lg shadow-lg max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Architectural Critique</h2>
          <p className="text-lg">{critique}</p>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
