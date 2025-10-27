import React, { useState } from "react";

export default function GalleryView({ files }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6">
      {files.map((file) => (
        <div
          key={file._id}
          className="relative group cursor-pointer"
          onClick={() => setSelected(file)}
        >
          {(file.mimetype || "").startsWith("image/") ? (
            <img
              src={file.cloudinaryUrl || file.url}
              alt={file.customName}
              className="rounded-lg object-cover w-full h-48 group-hover:opacity-80 transition"
            />
          ) : (
            <video
              src={file.url}
              className="rounded-lg object-cover w-full h-48"
              muted
              autoPlay
              loop
            />
          )}
        </div>
      ))}

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-11/12 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-3 text-gray-600 hover:text-black"
            >
              ✕
            </button>
            {(selected.mimetype || "").startsWith("image/") ? (
              <img
                src={selected.cloudinaryUrl || selected.url}
                alt={selected.customName}
                className="rounded-md w-full mb-3"
              />
            ) : (
              <video src={selected.url} controls className="rounded-md w-full mb-3" />
            )}
            <h2 className="font-medium text-lg">{selected.customName}</h2>
            <p className="text-sm text-gray-600">{selected.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(selected.tags || []).map((t, i) => (
                <span key={i} className="bg-gray-100 text-xs px-2 py-1 rounded-md">
                  #{t}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Uploaded: {new Date(selected.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
