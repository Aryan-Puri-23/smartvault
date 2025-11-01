// best best best

import { useEffect, useState } from "react";
import { Star, Eye, Download } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import img from "../assets/img.png";
import vid from "../assets/video.png";
import doc from "../assets/doc.png";



export default function Overview() {
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = currentUser ? currentUser.uid : null;

  const [files, setFiles] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [recentFiles, setRecentFiles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filesThisMonth, setFilesThisMonth] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://smartvault-backend.onrender.com/api";



useEffect(() => {
  if (!userId) return;

  fetch(`${API_BASE_URL}/files?userId=${userId}`)
    .then((res) => res.json())
    .then((data) => {
      const formatted = data.map(file => ({
        ...file,
        url: file.cloudinaryUrl || file.url,
      }));
      setFiles(formatted);
    })
    .catch((err) => console.error("Error fetching overview files:", err));
}, [userId]);


  useEffect(() => {
    if (!files || files.length === 0) {
      setStorageUsed(0);
      setRecentFiles([]);
      setFavorites([]);
      setFilesThisMonth([]);
      return;
    }
    const totalStorage = files.reduce(
      (acc, f) => acc + (f.size || 0) / (1024 * 1024),
      0
    );
    setStorageUsed(Number(totalStorage.toFixed(2)));

    const sortedFiles = [...files].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setRecentFiles(sortedFiles.slice(0, 5));

    setFavorites(files.filter((f) => f.favorite));

    const now = new Date();
    setFilesThisMonth(
      files.filter((f) => {
        const d = new Date(f.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
    );
  }, [files]);

  useEffect(() => {
  if (!userId) return;
  fetch(`${API_BASE_URL}/files/logs/user/${userId}`)
    .then((res) => res.json())
    .then((data) => setLogs(data))
    .catch((err) => console.error(err));
}, [userId]);

  const filteredLogs = logs
    .filter((log) =>
      actionFilter === "ALL" ? true : log.action === actionFilter
    )
    .filter((log) => {
      if (!dateFilter.from && !dateFilter.to) return true;
      const logDate = new Date(log.timestamp);
      const from = dateFilter.from ? new Date(dateFilter.from) : null;
      const to = dateFilter.to ? new Date(dateFilter.to) : null;
      return (!from || logDate >= from) && (!to || logDate <= to);
    })
    .slice(0, 5);

  const exportLogs = async () => {
    try {
      const exportData = logs
        .filter((log) =>
          actionFilter === "ALL" ? true : log.action === actionFilter
        )
        .filter((log) => {
          if (!dateFilter.from && !dateFilter.to) return true;
          const logDate = new Date(log.timestamp);
          const from = dateFilter.from ? new Date(dateFilter.from) : null;
          const to = dateFilter.to ? new Date(dateFilter.to) : null;
          return (!from || logDate >= from) && (!to || logDate <= to);
        });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Logs");

      sheet.addRow(["Action", "File", "Timestamp"]);
      exportData.forEach((log) => {
        sheet.addRow([
          log.action,
          log.fileName,
          new Date(log.timestamp).toLocaleString(),
        ]);
      });
      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach((col) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value ? cell.value.toString().length : 0;
          if (len > maxLength) maxLength = len;
        });
        col.width = maxLength + 2;
      });
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Logs.xlsx");
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="sm:space-y-6 space-y-4 sm:px-6 px-2 sm:py-4 py-2">
      {/* Welcome Card */}
      <div className="text-black border-2 border-black rounded-lg p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="mt-2">
            You have {files.length} file{files.length !== 1 ? "s" : ""} in your vault
            using {storageUsed} MB of storage.
          </p>
        </div>
        <div className="text-right text-sm">
          <p>Last login</p>
          <p>{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Files</p>
          <p className="text-xl font-bold">{files.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Storage Used</p>
          <div className="relative w-full bg-gray-200 h-3 rounded mt-1">
            <div
              className="absolute top-0 left-0 h-3 bg-blue-600 rounded"
              style={{ width: `${((storageUsed / 5120) * 100).toFixed(1)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">{storageUsed} MB of 5 GB</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Favorites</p>
          <p className="text-xl font-bold">{favorites.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-xl font-bold">{filesThisMonth.length}</p>
        </div>
      </div>

      {/* Recent Files + Favorites Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-12 mt-12">
        {/* Recent Files */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3 text-md">Recent Files</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.map((f) => (
                  <tr key={f._id || f.filename} className="border-b last:border-0">
                    <td className="py-2">
                      {f.customName || "Unnamed File"}
                    </td>

                    <td className="py-2">
                      {f.mimetype?.startsWith("image/")
                        ? "Image"
                        : f.mimetype?.startsWith("video/")
                          ? "Video"
                          : "Document"}
                    </td>
                    <td className="py-2">{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 flex justify-center gap-3">
                      <button
                        onClick={() => setSelectedFile(f)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Eye className="w-6 h-6 text-blue-600 cursor-pointer hover:bg-gray-100" />
                      </button>

                      <a
                        href={f.url}
                        download={f.originalname}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <Download className="w-6 h-6 text-green-600" />
                      </a>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Favorites Carousel */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col">
          <h3 className="font-bold mb-3 text-md">Favorites</h3>
          {favorites.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-2 items-center h-full">
              {favorites.map((f) => (
                <div
                  key={f._id || f.filename}
                  className="min-w-[120px] bg-gray-50 rounded-lg p-3 flex flex-col items-center shadow cursor-pointer"
                  onClick={() => setSelectedFile(f)}
                >
                  <div className="text-3xl h-8 w-8 mb-2 flex items-center justify-center">
                    {f.mimetype?.startsWith("image/")
                      ? <img src={img} className="h-full w-full object-contain" />
                      : f.mimetype?.startsWith("video/")
                        ? <img src={vid} className="h-full w-full object-contain" />
                        : <img src={doc} className="h-full w-full object-contain" />}
                  </div>
                  <span className="text-sm text-center truncate w-full">
                    {f.customName || "Unnamed"}
                  </span>
                  <Star className="h-4 w-4 text-yellow-500 mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No favorites yet.</p>
          )}
        </div>
      </div>

      {/* Logs + RHS Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 gap-12 lg:w-full lg: mt-12">
        {/* Logs */}
        <div className="bg-white p-6 rounded-lg shadow w-full">
          <h3 className="font-semibold mb-3 text-lg">Recent Activity</h3>
          <div className="relative border-l-2 border-gray-200 lg:pl-4 md:pl-8 sm:pl-4 pl-2 lg:mt-0 mt-8 space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                let color = "bg-gray-300 text-gray-800";
                switch (log.action) {
                  case "ADD":
                    color = "bg-green-100 text-green-800";
                    break;
                  case "EDIT":
                    color = "bg-blue-100 text-blue-800";
                    break;
                  case "DELETE":
                    color = "bg-red-100 text-red-800";
                    break;
                  case "DOWNLOAD":
                    color = "bg-yellow-100 text-yellow-800";
                    break;
                }

                return (
                  <div key={log._id} className="relative pl-8">
                    <span
                      className={`absolute -left-0 top-3 w-3 h-3 rounded-full ${color}`}
                    ></span>

                    <div className="bg-gray-50 p-2 sm:pl-4 sm:pr-4 rounded shadow-sm flex justify-between items-center">
                      <div className="flex items-center lg:gap-4 md:gap-8 sm:gap-4 gap-2 min-w-0">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
                          {log.action}
                        </span>
                        <span className="text-gray-700">
                          {log.fileName}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No recent activity.</p>
            )}
          </div>
        </div>

        {/* RHS Panel: Filters + Export */}
        <div className="bg-white p-6 pl-8 pr-8 rounded-lg shadow flex flex-col gap-4 ">
          <h3 className="font-semibold mb-2 text-lg">Filters & Export</h3>
          <div className="w-[90%] lg:w-full mx-auto flex flex-col gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Action Type</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm cursor-pointer"
              >
                <option value="ALL">All</option>
                <option value="ADD">Add</option>
                <option value="EDIT">Edit</option>
                <option value="DELETE">Delete</option>
                <option value="DOWNLOAD">Download</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">From Date</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm cursor-pointer"
              />
              <label className="block text-sm text-gray-600">To Date</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm cursor-pointer"
              />
            </div>
            <div className="flex w-full justify-center">
              <button
                onClick={exportLogs}
                className="px-3 py-2 rounded-md bg-blue-500 text-white text-sm font-bold mt-2 w-44 cursor-pointer hover:bg-blue-600"
              >
                Export Logs
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Popup Modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">{selectedFile.customName}</h2>

            {selectedFile.mimetype.startsWith("image/") ? (
              <img
                src={selectedFile.url}
                alt={selectedFile.originalname}
                className="w-full h-auto object-contain"
              />
            ) : selectedFile.mimetype.startsWith("video/") ? (
              <video
                src={selectedFile.url}
                controls
                className="w-full h-auto"
              />
            ) : (
              <p>File type preview not available</p>
            )}
            <p className="mt-4 text-gray-600">{selectedFile.description}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              {selectedFile.tags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-3 py-1 border rounded cursor-pointer hover:bg-red-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}