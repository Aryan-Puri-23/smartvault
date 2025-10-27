import React from "react";

export default function MemoriesView({ files }) {
  // Group by month-year or similar tags
  const grouped = files.reduce((acc, f) => {
    const date = new Date(f.createdAt);
    const key = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
    acc[key] = acc[key] || [];
    acc[key].push(f);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-10">
      {Object.entries(grouped).map(([period, groupFiles]) => (
        <div key={period}>
          <h2 className="text-xl font-semibold mb-4">{period}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {groupFiles.map((file) => (
              <div
                key={file._id}
                className="rounded-md border bg-white shadow-sm overflow-hidden"
              >
                {(file.mimetype || "").startsWith("image/") ? (
                  <img
                    src={file.cloudinaryUrl || file.url}
                    alt={file.customName}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <video
                    src={file.url}
                    className="w-full h-40 object-cover"
                    muted
                    autoPlay
                    loop
                  />
                )}
                <div className="p-2">
                  <p className="font-medium text-sm truncate">
                    {file.customName || file.originalname}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.tags?.slice(0, 2).map((t) => `#${t} `)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
