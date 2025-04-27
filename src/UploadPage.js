import React, { useState } from "react";

function UploadPage() {
  const [image, setImage] = useState(null);

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
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

      {image && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-white">Preview:</h2>
          <img src={image} alt="Uploaded Preview" className="w-80 rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
}

export default UploadPage;
