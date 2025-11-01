import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Overview from "./Overview";
import MyFiles from "./MyFiles";
import Analytics from "./Analytics";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("files");
  const [files, setFiles] = useState([]);

  // Get current user from localStorage
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = currentUser ? currentUser.uid : null;



  useEffect(() => {
  if (!userId) return;

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/files?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  fetchFiles();
}, [userId]);




  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Tabs */}
      <div className="flex justify-center bg-gray-50">
        <nav className="flex gap-6 py-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`font-medium cursor-pointer ${activeTab === "overview"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`font-medium cursor-pointer ${activeTab === "files"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
              }`}
          >
            My Files
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`font-medium cursor-pointer ${activeTab === "analytics"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
              }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Render section based on active tab */}
      <div className="p-6">
        {activeTab === "overview" && <Overview userId={userId} />}
        {activeTab === "files" && <MyFiles files={files} setFiles={setFiles} userId={userId} />}
        {activeTab === "analytics" && <Analytics files={files} />}
      </div>
    </div>
  );
}