"use client";

import { useState } from "react";

export default function Base64Client() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    setOutput(btoa(input));
  };

  const decode = () => {
    try {
      setOutput(atob(input));
    } catch {
      setOutput("Invalid Base64 string");
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div>
      <textarea
        className="w-full h-40 p-3 border rounded-lg mb-4"
        placeholder="Enter text..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex gap-3 mb-4">
        <button
          onClick={encode}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Encode
        </button>

        <button
          onClick={decode}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          Decode
        </button>

        <button
          onClick={copy}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Copy
        </button>
      </div>

      <textarea
        className="w-full h-40 p-3 border rounded-lg"
        value={output}
        readOnly
      />
    </div>
  );
}
