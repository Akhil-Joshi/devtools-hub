"use client";

import { useState } from "react";

export default function URLClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    setOutput(encodeURIComponent(input));
  };

  const decode = () => {
    setOutput(decodeURIComponent(input));
  };

  return (
    <div>
      <textarea
        className="w-full h-32 p-3 border rounded-lg mb-4"
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
      </div>

      <textarea
        className="w-full h-32 p-3 border rounded-lg"
        value={output}
        readOnly
      />
    </div>
  );
}
