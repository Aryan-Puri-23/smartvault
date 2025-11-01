import { Eye, Share2, Download, Trash2, Star } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function GridView({
  filteredFiles,
  setEditingFile,
  handleToggleFavorite,
  setSelectedFile,
  handleDelete,
  setFiles,
}) {
  return (
    <div className="grid grid-cols-1 gap-6 px-6 pb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
      {filteredFiles.length === 0 ? (
        <p className="text-gray-500">No files uploaded yet.</p>
      ) : (
        filteredFiles.map((file) => (
          <div key={file._id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="truncate font-medium text-sm">
                {file.customName || file.originalname}
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEditingFile(file)}
                  className="flex items-center gap-1 text-gray-600 hover:text-black cursor-pointer"
                >
                  Edit
                </button>

                <Star
                  className="h-5 w-5 cursor-pointer"
                  fill={file.favorite ? "yellow" : "none"}
                  stroke={file.favorite ? "black" : "gray"}
                  strokeWidth={file.favorite ? 1 : 1}
                  onClick={() => handleToggleFavorite(file)}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
              {new Date(file.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-3 flex h-44 sm:h-48 md:h-52 items-center justify-center rounded-md border bg-gray-50 text-gray-400 text-sm overflow-hidden">
              {(file.mimetype || "").startsWith("image/") ? (
                <img
                  src={file.cloudinaryUrl || file.url}
                  alt={file.originalname || file.customName}
                  className="h-full w-full object-cover cursor-pointer"
                  onClick={() => setSelectedFile(file)}
                />
              ) : (file.mimetype || "").startsWith("video/") ? (
                <video
                  src={file.url}
                  className="h-full w-full object-cover cursor-pointer"
                  controls
                />
              ) : (
                (file.mimetype || "file").split("/")[0].toUpperCase()
              )}
            </div>

            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {file.description}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {(file.tags || []).slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
              {file.tags?.length > 3 && (
                <span className="rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-600">
                  +{file.tags.length - 3}
                </span>
              )}
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <button
                onClick={() => setSelectedFile(file)}
                className="flex items-center gap-1 text-gray-600 hover:text-black cursor-pointer"
              >
                <Eye className="h-4 w-4" /> View
              </button>

              <button
                onClick={() => navigator.clipboard.writeText(file.url)}
                className="flex items-center gap-1 text-gray-600 hover:text-black cursor-pointer"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>

              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  const res = await fetch(`${API_BASE_URL}/files/${file._id}/download`);
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  const ext = file.originalname.split(".").pop();
                  a.download = file.customName
                    ? `${file.customName}.${ext}`
                    : file.originalname;
                  a.click();
                  a.remove();
                  setFiles((prevFiles) =>
                    prevFiles.map((f) =>
                      f._id === file._id
                        ? { ...f, downloads: (f.downloads || 0) + 1 }
                        : f
                    )
                  );
                }}
                className="flex items-center gap-1 text-gray-600 hover:text-black cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download
              </a>

              <button
                onClick={() => handleDelete(file._id)}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
