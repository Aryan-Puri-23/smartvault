// best best best
import React, { useState, useEffect, useRef } from "react";
import Dropdown from "./ui/Dropdown";
import GridView from "./GridView";
import MemoryView from "./MemoryView";
import {
  Upload,
  Grid,
  List,
  Eye,
  Share2,
  Download,
  Trash2,
  Star,
} from "lucide-react";

export default function MyFiles({ files, setFiles, userId }) {
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    description: "",
    tags: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null); // ✅ added

  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const [editingFile, setEditingFile] = useState(null);
  const [editData, setEditData] = useState({ customName: "", description: "", tags: "" });
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  // Fetch files on mount
  useEffect(() => {
    if (!userId) return;

    const fetchFiles = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/files?userId=${userId}`);
        const data = await res.json();
        console.log("Fetched files on mount:", data);
        setFiles(
          data.map(file => ({
            ...file,
            url: file.cloudinaryUrl, // use the real DB field
          }))
        );
      } catch (err) {
        console.error("Failed to fetch files:", err);
      }
    };

    fetchFiles();
  }, [userId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return alert("Please select a file!");

    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("description", uploadData.description);
      formData.append("tags", uploadData.tags);
      formData.append("userId", userId);
      formData.append("customName", uploadData.customName);

      const res = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Upload response:", data);

      const newFile = {
        ...data.file,
        url: data.file.cloudinaryUrl, // ✅ use actual Cloudinary URL
      };
      setFiles(prev => [newFile, ...prev]);

      setShowUpload(false);
      setUploadData({ file: null, description: "", tags: "", customName: "" });
      setPreviewUrl(null);

    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/files/${id}`, {
        method: "DELETE",
      });
      // fetchFiles();
      setFiles(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredFiles = files.filter((file) => {
    const name = file.originalname || file.customName || "";
    const desc = file.description || "";
    const tags = file.tags || [];
    const createdAt = new Date(file.createdAt);

    // ✅ Search filter
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase()) ||
      tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    // ✅ Type filter
    let matchesType = true;
    if (typeFilter === "Image") matchesType = file.mimetype?.startsWith("image/");
    if (typeFilter === "Video") matchesType = file.mimetype?.startsWith("video/");
    if (typeFilter === "Application")
      matchesType = file.mimetype?.startsWith("application/");

    // ✅ Time filter
    let matchesTime = true;
    const now = new Date();
    if (timeFilter === "Last 7 Days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesTime = createdAt >= sevenDaysAgo;
    }
    if (timeFilter === "Last 30 Days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchesTime = createdAt >= thirtyDaysAgo;
    }

    return matchesSearch && matchesType && matchesTime;
  });

  const handleToggleFavorite = async (file) => {
    try {
      const res = await fetch(`http://localhost:5000/api/files/${file._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !file.favorite }),
      });
      if (!res.ok) throw new Error("Failed to toggle favorite");
      // fetchFiles();
      const updatedFile = await res.json();
      setFiles(prev => prev.map(f => f._id === updatedFile._id ? updatedFile : f));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (editingFile) {
      setEditData({
        customName: editingFile.customName || "",
        description: editingFile.description || "",
        tags: (editingFile.tags || []).join(", "),
      });
    }
  }, [editingFile]);

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/files/${editingFile._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customName: editData.customName,
          description: editData.description,
          tags: editData.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to update file");
      const updatedFile = await res.json();

      // Update files in MyFiles, Overview, Analytics
      setFiles(prev => prev.map(f => f._id === updatedFile._id ? updatedFile : f));

      setEditingFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 py-4 gap-4 lg:w-full w-11/12 max-w-6xl mx-auto">

        {/* Search Bar: full width on < lg, 1/2 width on lg+ */}
        <input
          type="text"
          placeholder="Search files by name, description, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-11/12 sm:w-full lg:w-1/2 mx-auto rounded-md border px-3 py-2 text-sm"
        />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:flex-nowrap justify-between items-center w-3/4 sm:w-full lg:w-auto mx-auto px-2 gap-3 sm:gap-4">

          <Dropdown
            options={["All Types", "Image", "Video", "Application"]}
            value={typeFilter}
            onChange={setTypeFilter}
          />

          {/* Time Filter */}
          <Dropdown
            options={["All Time", "Last 7 Days", "Last 30 Days"]}
            value={timeFilter}
            onChange={setTimeFilter}
          />

          {/* Grid/List buttons side by side */}
          <div className="flex flex-row gap-3">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-md border px-2 py-1 cursor-pointer w-auto ${viewMode === "grid" ? "bg-gray-200" : ""}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("memory")}
              className={`rounded-md border px-2 py-1 cursor-pointer w-auto ${viewMode === "list" ? "bg-gray-200" : ""}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Upload button */}
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white cursor-pointer w-3/4 sm:w-auto justify-center"
          >
            <Upload className="h-4 w-4" /> Upload
          </button>

        </div>
      </div>


      {/* Upload Popup */}
      {showUpload && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-medium mb-4">Upload File</h2>
            <form className="space-y-3" onSubmit={handleUpload}>
              <div
                className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-500"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    setUploadData({ ...uploadData, file });
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrl ? (
                  uploadData.file.type.startsWith("image/") ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <p className="text-sm">{uploadData.file.name}</p>
                  )
                ) : (
                  <>
                    <Upload className="h-6 w-6 mb-1" />
                    <p className="text-sm">Drag & drop or click to select</p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setUploadData({ ...uploadData, file });
                  setPreviewUrl(file ? URL.createObjectURL(file) : null);
                }}
              />

              {/* New: File Name input */}
              <input
                type="text"
                placeholder="File Name"
                className="w-full border px-2 py-1 rounded"
                value={uploadData.customName || ""}
                onChange={(e) =>
                  setUploadData({ ...uploadData, customName: e.target.value })
                }
                required
                maxLength={20}
              />
              <p className="text-xs text-gray-500">
                {uploadData.customName?.length || 0}/20 characters used
              </p>

              <input
                type="text"
                placeholder="Description"
                className="w-full border px-2 py-1 rounded"
                value={uploadData.description}
                onChange={(e) =>
                  setUploadData({ ...uploadData, description: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Tags (comma separated)"
                className="w-full border px-2 py-1 rounded"
                value={uploadData.tags}
                onChange={(e) =>
                  setUploadData({ ...uploadData, tags: e.target.value })
                }
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpload(false);
                    setPreviewUrl(null);
                  }}
                  className="px-3 py-1 border rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Files section */}
      {viewMode === "grid" && (
  <GridView
    filteredFiles={filteredFiles}
    setEditingFile={setEditingFile}
    handleToggleFavorite={handleToggleFavorite}
    setSelectedFile={setSelectedFile}
    handleDelete={handleDelete}
    setFiles={setFiles}
  />
)}

{viewMode === "memory" && (
  <MemoryView
    files={filteredFiles}
    setSelectedFile={setSelectedFile}
    handleToggleFavorite={handleToggleFavorite}
  />
)}

      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()} // Prevent closing on inner clicks
          >
            <h2 className="text-lg font-bold mb-2">
              {selectedFile.customName || selectedFile.originalname || "Unnamed File"}
            </h2>

            {selectedFile.mimetype?.startsWith("image/") ? (
              <img
                src={selectedFile.cloudinaryUrl || selectedFile.url} // use url instead of cloudinaryUrl
                alt={selectedFile.originalname}
                className="w-full h-auto object-contain"
              />
            ) : selectedFile.mimetype?.startsWith("video/") ? (
              <video
                src={selectedFile.cloudinaryUrl || selectedFile.url} // use url instead of cloudinaryUrl
                controls
                className="w-full h-auto"
              />
            ) : (
              <p>File type preview not available</p>
            )}

            <p className="mt-4 text-gray-600">{selectedFile.description || "No description"}</p>

            <div className="mt-4 flex flex-wrap gap-4">
              {(selectedFile.tags || []).map((tag, i) => (
                <span
                  key={i}
                  className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>Size: {((selectedFile.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
              <p>Uploaded: {new Date(selectedFile.createdAt).toLocaleString()}</p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-3 py-1 border rounded hover:bg-red-500 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingFile && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setEditingFile(null)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Edit File</h2>
            <label className="text-sm font-medium">File Name:</label>

            <input
              type="text"
              className="w-full border px-2 py-1 rounded mb-2"
              value={editData.customName}
              onChange={(e) => setEditData({ ...editData, customName: e.target.value })}
              placeholder="File Name"
            />
            <label className="text-sm font-medium">File description:</label>

            <input
              type="text"
              className="w-full border px-2 py-1 rounded mb-2"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Description"
            />

            <label className="text-sm font-medium">tags:</label>

            <input
              type="text"
              className="w-full border px-2 py-1 rounded mb-2"
              value={editData.tags}
              onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
              placeholder="Tags (comma separated)"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingFile(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}