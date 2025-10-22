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
    const fetchFiles = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/files?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch files");
        const data = await res.json();
        setFiles(data);
      } catch (err) {
        console.error(err);
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
            className={`font-medium cursor-pointer ${
              activeTab === "overview"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`font-medium cursor-pointer ${
              activeTab === "files"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            My Files
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`font-medium cursor-pointer ${
              activeTab === "analytics"
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
        {activeTab === "analytics" && <Analytics files={files}/>}
      </div>
    </div>
  );
}




// import { useState } from "react";
// import Navbar from "./Navbar";
// import Overview from "./Overview";
// import MyFiles from "./MyFiles";
// import Analytics from "./Analytics";

// export default function Dashboard() {
//   const [activeTab, setActiveTab] = useState("files");

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       {/* Tabs */}
//       <div className="flex justify-center bg-white border-b">
//         <nav className="flex gap-6 py-3">
//           <button
//             onClick={() => setActiveTab("overview")}
//             className={`font-medium ${activeTab === "overview" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black"}`}
//           >
//             Overview
//           </button>
//           <button
//             onClick={() => setActiveTab("files")}
//             className={`font-medium ${activeTab === "files" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black"}`}
//           >
//             My Files
//           </button>
//           <button
//             onClick={() => setActiveTab("analytics")}
//             className={`font-medium ${activeTab === "analytics" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black"}`}
//           >
//             Analytics
//           </button>
//         </nav>
//       </div>

//       {/* Render section based on active tab */}
//       <div className="p-6">
//         {activeTab === "overview" && <Overview />}
//         {activeTab === "files" && <MyFiles />}
//         {activeTab === "analytics" && <Analytics />}
//       </div>
//     </div>
//   );
// }



// import React, { useState } from "react";
// import { LogOut, User, Upload, Grid, List, Eye, Share2, Download, Trash2, Star, Database } from "lucide-react";
// import { Link } from "react-router-dom"
// import Navbar from "./Navbar";

// const files = [
//   {
//     id: 1,
//     name: "vacation-sunset.jpg",
//     size: "1.95 MB",
//     date: "1/15/2024",
//     type: "image",
//     description: "Beautiful sunset at Malibu beach during our California vacation",
//     tags: ["vacation", "beach", "sunset"],
//     favorite: true,
//   },
//   {
//     id: 2,
//     name: "quarterly-report-q4.pdf",
//     size: "1000 KB",
//     date: "1/14/2024",
//     type: "application",
//     description: "Q4 2023 quarterly business presentation and financial report",
//     tags: ["work", "presentation", "quarterly"],
//     favorite: false,
//   },
//   {
//     id: 3,
//     name: "birthday-celebration.mp4",
//     size: "15 MB",
//     date: "1/13/2024",
//     type: "video",
//     description: "Emma's 8th birthday party celebration with family and friends",
//     tags: ["family", "birthday", "celebration"],
//     favorite: true,
//   },
//   {
//     id: 4,
//     name: "wedding-photos-album.zip",
//     size: "50 MB",
//     date: "1/12/2024",
//     type: "application",
//     description: "Complete wedding photo album from Sarah and Mike's wedding",
//     tags: ["wedding", "photos", "memories"],
//     favorite: false,
//   },
// ];

// export default function Dashboard() {
//   const [search, setSearch] = useState("");

//   const filteredFiles = files.filter(
//     (file) =>
//       file.name.toLowerCase().includes(search.toLowerCase()) ||
//       file.description.toLowerCase().includes(search.toLowerCase()) ||
//       file.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       {/* Tabs */}
//       <div className="flex justify-center bg-white border-b">
//         <nav className="flex gap-6 py-3">
//           <button className="font-medium text-gray-500 hover:text-black">Overview</button>
//           <button className="font-medium border-b-2 border-black text-black">My Files</button>
//           <button className="font-medium text-gray-500 hover:text-black">Analytics</button>
//         </nav>
//       </div>

//       {/* Toolbar */}
//       <div className="flex items-center justify-between px-6 py-4">
//         <input
//           type="text"
//           placeholder="Search files by name, description, or tags..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-1/2 rounded-md border px-3 py-2 text-sm"
//         />
//         <div className="flex items-center gap-3">
//           <select className="rounded-md border px-2 py-1 text-sm">
//             <option>All Types</option>
//             <option>Image</option>
//             <option>Video</option>
//             <option>Application</option>
//           </select>
//           <select className="rounded-md border px-2 py-1 text-sm">
//             <option>All Time</option>
//             <option>Last 7 Days</option>
//             <option>Last 30 Days</option>
//           </select>
//           <button className="rounded-md border px-2 py-1">
//             <Grid className="h-4 w-4" />
//           </button>
//           <button className="rounded-md border px-2 py-1">
//             <List className="h-4 w-4" />
//           </button>
//           <button className="flex items-center gap-1 rounded-md bg-black px-3 py-2 text-sm text-white">
//             <Upload className="h-4 w-4" /> Upload
//           </button>
//         </div>
//       </div>

//       {/* Files grid */}
//       <div className="grid grid-cols-1 gap-6 px-6 pb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//         {filteredFiles.map((file) => (
//           <div key={file.id} className="rounded-lg border bg-white p-4 shadow-sm">
//             <div className="flex items-center justify-between">
//               <h2 className="truncate font-medium text-sm">{file.name}</h2>
//               <Star
//                 className={`h-5 w-5 cursor-pointer ${file.favorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
//               />
//             </div>
//             <p className="text-xs text-gray-500">
//               {file.size} • {file.date}
//             </p>
//             <div className="mt-3 flex h-32 items-center justify-center rounded-md border bg-gray-50 text-gray-400 text-sm">
//               {file.type.toUpperCase()}
//             </div>
//             <p className="mt-2 text-sm text-gray-600 line-clamp-2">{file.description}</p>
//             <div className="mt-2 flex flex-wrap gap-2">
//               {file.tags.map((tag, i) => (
//                 <span key={i} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
//                   {tag}
//                 </span>
//               ))}
//             </div>
//             <div className="mt-3 flex justify-between text-sm">
//               <button className="flex items-center gap-1 text-gray-600 hover:text-black">
//                 <Eye className="h-4 w-4" /> View
//               </button>
//               <button className="flex items-center gap-1 text-gray-600 hover:text-black">
//                 <Share2 className="h-4 w-4" /> Share
//               </button>
//               <button className="flex items-center gap-1 text-gray-600 hover:text-black">
//                 <Download className="h-4 w-4" /> Download
//               </button>
//               <button className="flex items-center gap-1 text-red-500 hover:text-red-700">
//                 <Trash2 className="h-4 w-4" /> Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }