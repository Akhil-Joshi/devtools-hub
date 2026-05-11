"use client";

import { useState } from "react";

export default function TimestampClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const toDate = () => {
    const date = new Date(Number(input) * 1000);
    setOutput(date.toString());
  };

  const toTimestamp = () => {
    const ts = Math.floor(new Date(input).getTime() / 1000);
    setOutput(ts.toString());
  };

  return (
    <div>
      <textarea
        className="w-full h-32 p-3 border rounded-lg mb-4"
        placeholder="Enter timestamp or date..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex gap-3 mb-4">
        <button
          onClick={toDate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          To Date
        </button>

        <button
          onClick={toTimestamp}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          To Timestamp
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
