"use client";

import { useState } from "react";

export default function UUIDClient() {
  const [uuid, setUuid] = useState("");

  const generateUUID = () => {
    const newUUID = crypto.randomUUID();
    setUuid(newUUID);
  };

  const copy = () => {
    navigator.clipboard.writeText(uuid);
  };

  return (
    <div>
      <button
        onClick={generateUUID}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4"
      >
        Generate UUID
      </button>

      {uuid && (
        <div className="p-3 border rounded-lg flex justify-between items-center">
          <span>{uuid}</span>

          <button
            onClick={copy}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
