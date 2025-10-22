// src/components/Analytics.jsx
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { LineChart, Line } from "recharts";

export default function Analytics({ files }) {
  const [fileTypes, setFileTypes] = useState({});
  const [storageUsed, setStorageUsed] = useState(0);
  const [uploadActivity, setUploadActivity] = useState({});
  const [largestFiles, setLargestFiles] = useState([]);
  const [duplicateFiles, setDuplicateFiles] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [topDownloads, setTopDownloads] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    if (!files || files.length === 0) return;

    // File types
    const types = { Images: 0, Videos: 0, Documents: 0, Audio: 0, Others: 0 };
    files.forEach((f) => {
      if (f.mimetype.startsWith("image/")) types.Images += 1;
      else if (f.mimetype.startsWith("video/")) types.Videos += 1;
      else if (
        f.mimetype === "application/pdf" ||
        f.mimetype.startsWith("text/") ||
        f.mimetype === "application/msword" ||
        f.mimetype.includes("spreadsheet")
      )
        types.Documents += 1;
      else if (f.mimetype.startsWith("audio/")) types.Audio += 1;
      else types.Others += 1;
    });
    setFileTypes(types);

    // Storage used
    const totalStorage = files.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024);
    setStorageUsed(Number(totalStorage.toFixed(2)));

    // Upload activity
    const now = new Date();
    const thisWeek = files.filter((f) => {
      const d = new Date(f.createdAt);
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const thisMonth = files.filter((f) => {
      const d = new Date(f.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    setUploadActivity({ week: thisWeek.length, month: thisMonth.length, total: files.length });

    // Largest files
    const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 5);
    setLargestFiles(largest);

    // Duplicate / similar files
    const seen = {};
    const duplicates = [];
    files.forEach((f) => {
      const key = f.originalname + "_" + f.size;
      if (seen[key]) duplicates.push(f);
      else seen[key] = true;
    });
    setDuplicateFiles(duplicates);

    // Most frequently used tags
    const tagCount = {};
    files.forEach((f) => {
      f.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    setTopTags(sortedTags);

    // Upload history last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const count = files.filter((f) => {
        const fDate = new Date(f.createdAt);
        return (
          fDate.getFullYear() === d.getFullYear() &&
          fDate.getMonth() === d.getMonth() &&
          fDate.getDate() === d.getDate()
        );
      }).length;
      return { day: d.toISOString().slice(0, 10), count };
    }).reverse();
    setUploadHistory(last7Days);

    // Most downloaded files (Top 10, remove duplicates by name)
    const already = new Set();
    const topDl = [...files]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .filter((f) => {
        const key = f.customName || f.originalname;
        if (already.has(key)) return false;
        already.add(key);
        return true;
      })
      .slice(0, 10)
      .map((f) => ({ name: f.customName || f.originalname, downloads: f.downloads || 0 }));
    setTopDownloads(topDl);

    // === Tag-Similarity Clustering ===
    const unvisited = new Set(files);
    const clustersArr = [];
    while (unvisited.size > 0) {
      const cluster = [];
      const queue = [unvisited.values().next().value];
      while (queue.length > 0) {
        const file = queue.pop();
        if (!unvisited.has(file)) continue;
        unvisited.delete(file);
        cluster.push(file);
        for (let f of unvisited) {
          if (f.tags.some((tag) => file.tags.includes(tag))) queue.push(f);
        }
      }
      if (cluster.length > 1) clustersArr.push(cluster);
    }

    const formattedClusters = clustersArr.map((c) => {
      const tagMap = {};
      c.forEach((f) => f.tags.forEach((tag) => (tagMap[tag] = (tagMap[tag] || 0) + 1)));
      const topTag = Object.entries(tagMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "Misc";
      return { topTag, count: c.length, files: c };
    });
    setClusters(formattedClusters);
  }, [files]);

  return (
    <div className="space-y-6 px-6 py-6">
      {/* First row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* File Types Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">File Types Distribution</h3>
          <ul className="space-y-1">
            {Object.entries(fileTypes).map(([type, count]) => (
              <li key={type} className="flex justify-between">
                <span>{type}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Storage Breakdown */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Storage Breakdown</h3>
          <p className="text-md text-gray-500 mb-1">Used</p>
          <div className="relative w-full bg-gray-200 h-3 rounded">
            <div
              className="absolute top-0 left-0 h-3 bg-blue-600 rounded"
              style={{ width: `${(storageUsed / 5120) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-1">{storageUsed} MB of 5 GB</p>
        </div>
        {/* Upload Activity */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Upload Activity</h3>
          <ul className="space-y-1 text-md">
            <li className="flex justify-between">
              <span>This week</span>
              <span>{uploadActivity.week} files</span>
            </li>
            <li className="flex justify-between">
              <span>This month</span>
              <span>{uploadActivity.month} files</span>
            </li>
            <li className="flex justify-between">
              <span>Total uploads</span>
              <span>{uploadActivity.total} files</span>
            </li>
          </ul>
        </div>
      </div>
      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Largest Files */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Largest Files</h3>
          <ul className="space-y-1 text-md">
            {largestFiles.map((f) => (
              <li key={f._id || f.filename} className="flex justify-between text-md">
                <span>{f.customName}</span>
                <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Duplicate / Similar Files */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Duplicate / Similar Files</h3>
          {duplicateFiles.length ? (
            <ul className="space-y-1 text-md">
              {duplicateFiles.map((f) => (
                <li key={f._id || f.filename}>{f.customName}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No duplicates found</p>
          )}
        </div>
        {/* Most Frequently Used Tags */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Most Frequently Used Tags</h3>
          {topTags.length ? (
            <ul className="space-y-1 text-md">
              {topTags.map(([tag, count]) => (
                <li key={tag} className="flex justify-between">
                  <span>{tag}</span>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No tags used yet</p>
          )}
        </div>
      </div>
      {/* Charts Section (new row) */}
<div className="grid grid-cols-1 gap-12">
  {/* Upload Activity Line Chart */}
  <div className="bg-white p-4 rounded-lg shadow mt-8">
    <h3 className="font-semibold mb-8">Upload Activity (Last 7 Days)</h3>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={uploadHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="day" 
          interval={0} 
          angle={-45} 
          textAnchor="end" 
          height={50} 
          tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
        />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* Most Downloaded Files */}
  <div className="bg-white p-4 rounded-lg shadow mt-4">
    <h3 className="font-semibold mb-4">Most Downloaded Files</h3>
    {topDownloads.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topDownloads} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            interval={0} 
            angle={-45} 
            textAnchor="end" 
            height={50} 
            tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="downloads" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-gray-400 text-sm">No downloads yet</p>
    )}
  </div>
</div>

      {/* Cluster Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {clusters.map((c, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow hover:shadow-lg mt-8 transition-all">
            <h3 className="font-bold text-lg mb-2">{c.topTag} Cluster</h3>
            <p className="text-sm text-gray-500 mb-2">{c.count} files</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {c.files.map((f) => (
                <div key={f._id || f.filename} className="border rounded overflow-hidden aspect-square flex items-center justify-center">
                  {f.mimetype.startsWith("image/") ? (
                    // <img
                    //   src={`http://localhost:5000/uploads/${encodeURIComponent(f.filename)}`}
                    //   alt={f.originalname}
                    //   className="object-cover h-full w-full"
                    // />
                    <img
  src={f.url}
  alt={f.originalname}
  className="object-cover h-full w-full"
/>

                  ) : (
                    <span className="text-xs text-gray-600 text-center px-1">{f.originalname}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





// bestest final boss

// src/components/Analytics.jsx
// import React, { useEffect, useState } from "react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
// import { LineChart, Line } from "recharts";


// export default function Analytics({ files }) {
//   const [fileTypes, setFileTypes] = useState({});
//   const [storageUsed, setStorageUsed] = useState(0);
//   const [uploadActivity, setUploadActivity] = useState({});
//   const [largestFiles, setLargestFiles] = useState([]);
//   const [duplicateFiles, setDuplicateFiles] = useState([]);
//   const [topTags, setTopTags] = useState([]);
//   const [topDownloads, setTopDownloads] = useState([]);
//   const [uploadHistory, setUploadHistory] = useState([]);


//   useEffect(() => {
//     if (!files || files.length === 0) return;

//     // File types
//     const types = { Images: 0, Videos: 0, Documents: 0, Audio: 0, Others: 0 };
//     files.forEach((f) => {
//       if (f.mimetype.startsWith("image/")) types.Images += 1;
//       else if (f.mimetype.startsWith("video/")) types.Videos += 1;
//       else if (
//         f.mimetype === "application/pdf" ||
//         f.mimetype.startsWith("text/") ||
//         f.mimetype === "application/msword" ||
//         f.mimetype.includes("spreadsheet")
//       )
//         types.Documents += 1;
//       else if (f.mimetype.startsWith("audio/")) types.Audio += 1;
//       else types.Others += 1;
//     });
//     setFileTypes(types);

//     // Storage used
//     const totalStorage = files.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024); // MB
//     setStorageUsed(Number(totalStorage.toFixed(2)));

//     // Upload activity
//     const now = new Date();
//     const thisWeek = files.filter((f) => {
//       const d = new Date(f.createdAt);
//       const diff = (now - d) / (1000 * 60 * 60 * 24);
//       return diff <= 7;
//     });
//     const thisMonth = files.filter((f) => {
//       const d = new Date(f.createdAt);
//       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//     });
//     setUploadActivity({
//       week: thisWeek.length,
//       month: thisMonth.length,
//       total: files.length,
//     });

//     // Largest files
//     const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 5);
//     setLargestFiles(largest);

//     // Duplicate / similar files
//     const seen = {};
//     const duplicates = [];
//     files.forEach((f) => {
//       const key = f.originalname + "_" + f.size;
//       if (seen[key]) duplicates.push(f);
//       else seen[key] = true;
//     });
//     setDuplicateFiles(duplicates);

//     // Most frequently used tags
//     const tagCount = {};
//     files.forEach((f) => {
//       f.tags.forEach((tag) => {
//         tagCount[tag] = (tagCount[tag] || 0) + 1;
//       });
//     });
//     const sortedTags = Object.entries(tagCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5);
//     setTopTags(sortedTags);


//   //   const today = new Date();
//   //   const last7Days = Array.from({ length: 7 }, (_, i) => {
//   //   const d = new Date();
//   //   d.setDate(today.getDate() - i);
//   //   const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
//   //   return {
//   //     day: dateStr,
//   //     count: files.filter(f => f.createdAt.slice(0, 10) === dateStr).length,
//   //   };
//   // }).reverse(); // oldest day first
//   // setUploadHistory(last7Days);


//   const last7Days = Array.from({ length: 7 }, (_, i) => {
//   const d = new Date();
//   d.setDate(d.getDate() - i);

//   const count = files.filter(f => {
//     const fDate = new Date(f.createdAt);
//     return (
//       fDate.getFullYear() === d.getFullYear() &&
//       fDate.getMonth() === d.getMonth() &&
//       fDate.getDate() === d.getDate()
//     );
//   }).length;

//   return {
//     day: d.toISOString().slice(0, 10), // for display
//     count,
//   };
// }).reverse(); // oldest first

// setUploadHistory(last7Days);


//     // Most downloaded files (Top 5)
//     // const topDl = [...files]
//     //   .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
//     //   .slice(0, 5)
//     //   .map((f) => ({
//     //     name: f.originalname,
//     //     downloads: f.downloadCount || 0,
//     //   }));
//     // setTopDownloads(topDl);

//     // Most downloaded files (Top 5, remove duplicates by filename)
// const already = new Set();
// const topDl = [...files]
//   .sort((a, b) => (b.downloads || 0) - (a.downloads || 0)) // use downloads field
//   .filter((f) => {
//     const key = f.customName || f.originalname; // deduplicate by name
//     if (already.has(key)) return false;
//     already.add(key);
//     return true;
//   })
//   .slice(0, 10)
//   .map((f) => ({
//     name: f.customName || f.originalname, // display customName if available
//     downloads: f.downloads || 0,
//   }));

// setTopDownloads(topDl);


//   }, [files]);

//   return (
//     <div className="space-y-6 px-6 py-4">
//       {/* First row */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* File Types Distribution */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">File Types Distribution</h3>
//           <ul className="space-y-1">
//             {Object.entries(fileTypes).map(([type, count]) => (
//               <li key={type} className="flex justify-between">
//                 <span>{type}</span>
//                 <span>{count}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Storage Breakdown */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Storage Breakdown</h3>
//           <p className="text-sm text-gray-500 mb-1">Used</p>
//           <div className="relative w-full bg-gray-200 h-3 rounded">
//             <div
//               className="absolute top-0 left-0 h-3 bg-blue-600 rounded"
//               style={{ width: `${(storageUsed / 5120) * 100}%` }}
//             ></div>
//           </div>
//           <p className="text-xs text-gray-400 mt-1">{storageUsed} MB of 5 GB</p>
//         </div>

//         {/* Upload Activity */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Upload Activity</h3>
//           <ul className="space-y-1 text-sm">
//             <li className="flex justify-between">
//               <span>This week</span>
//               <span>{uploadActivity.week} files</span>
//             </li>
//             <li className="flex justify-between">
//               <span>This month</span>
//               <span>{uploadActivity.month} files</span>
//             </li>
//             <li className="flex justify-between">
//               <span>Total uploads</span>
//               <span>{uploadActivity.total} files</span>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Second row */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Largest Files */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Largest Files</h3>
//           <ul className="space-y-1 text-sm">
//             {largestFiles.map((f) => (
//               <li key={f._id || f.filename} className="flex justify-between">
//                 <span>{f.originalname}</span>
//                 <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Duplicate / Similar Files */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Duplicate / Similar Files</h3>
//           {duplicateFiles.length ? (
//             <ul className="space-y-1 text-sm">
//               {duplicateFiles.map((f) => (
//                 <li key={f._id || f.filename}>{f.originalname}</li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-400 text-sm">No duplicates found</p>
//           )}
//         </div>

//         {/* Most Frequently Used Tags */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Most Frequently Used Tags</h3>
//           {topTags.length ? (
//             <ul className="space-y-1 text-sm">
//               {topTags.map(([tag, count]) => (
//                 <li key={tag} className="flex justify-between">
//                   <span>{tag}</span>
//                   <span>{count}</span>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-400 text-sm">No tags used yet</p>
//           )}
//         </div>
//       </div>

//       {/* Charts Section (new row) */}


//       <div className="grid grid-cols-1 gap-12">
//   {/* Upload Activity Line Chart */}
//   <div className="bg-white p-4 rounded-lg shadow">
//     <h3 className="font-semibold mb-2">Upload Activity (Last 7 Days)</h3>
//     <ResponsiveContainer width="100%" height={250}>
//       <LineChart data={uploadHistory}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="day" />
//         <YAxis allowDecimals={false} />
//         <Tooltip />
//         <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
//       </LineChart>
//     </ResponsiveContainer>
//   </div>

//   {/* Most Downloaded Files */}
//   <div className="bg-white p-4 rounded-lg shadow">
//     <h3 className="font-semibold mb-4">Most Downloaded Files</h3>
//     {topDownloads.length > 0 ? (
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={topDownloads}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="downloads" fill="#3b82f6" radius={[6, 6, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ) : (
//       <p className="text-gray-400 text-sm">No downloads yet</p>
//     )}
//   </div>
// </div>


//       {/* <div className="bg-white p-4 rounded-lg shadow">
//     <h3 className="font-semibold mb-2">Upload Activity (Last 7 Days)</h3>
//     <ResponsiveContainer width="100%" height={250}>
//       <LineChart data={uploadHistory}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="day" />
//         <YAxis allowDecimals={false} />
//         <Tooltip />
//         <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
//       </LineChart>
//     </ResponsiveContainer>
//   </div>


//       <div className="bg-white p-4 rounded-lg shadow">
//         <h3 className="font-semibold mb-4">Most Downloaded Files</h3>
//         {topDownloads.length > 0 ? (
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={topDownloads}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="downloads" fill="#3b82f6" radius={[6, 6, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className="text-gray-400 text-sm">No downloads yet</p>
//         )}
//       </div> */}
//     </div>
//   );
// }






// // src/components/Analytics.jsx
// import React, { useEffect, useState } from "react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
// import { LineChart, Line } from "recharts";

// export default function Analytics({ files }) {
//   const [fileTypes, setFileTypes] = useState({});
//   const [storageUsed, setStorageUsed] = useState(0);
//   const [uploadActivity, setUploadActivity] = useState({});
//   const [largestFiles, setLargestFiles] = useState([]);
//   const [duplicateFiles, setDuplicateFiles] = useState([]);
//   const [topTags, setTopTags] = useState([]);
//   const [topDownloads, setTopDownloads] = useState([]);
//   const [uploadHistory, setUploadHistory] = useState([]);
//   const [clusters, setClusters] = useState([]);

//   useEffect(() => {
//     if (!files || files.length === 0) return;

//     // File types
//     const types = { Images: 0, Videos: 0, Documents: 0, Audio: 0, Others: 0 };
//     files.forEach((f) => {
//       if (f.mimetype.startsWith("image/")) types.Images += 1;
//       else if (f.mimetype.startsWith("video/")) types.Videos += 1;
//       else if (
//         f.mimetype === "application/pdf" ||
//         f.mimetype.startsWith("text/") ||
//         f.mimetype === "application/msword" ||
//         f.mimetype.includes("spreadsheet")
//       )
//         types.Documents += 1;
//       else if (f.mimetype.startsWith("audio/")) types.Audio += 1;
//       else types.Others += 1;
//     });
//     setFileTypes(types);

//     // Storage used
//     const totalStorage = files.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024);
//     setStorageUsed(Number(totalStorage.toFixed(2)));

//     // Upload activity
//     const now = new Date();
//     const thisWeek = files.filter((f) => {
//       const d = new Date(f.createdAt);
//       const diff = (now - d) / (1000 * 60 * 60 * 24);
//       return diff <= 7;
//     });
//     const thisMonth = files.filter((f) => {
//       const d = new Date(f.createdAt);
//       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//     });
//     setUploadActivity({
//       week: thisWeek.length,
//       month: thisMonth.length,
//       total: files.length,
//     });

//     // Largest files
//     const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 5);
//     setLargestFiles(largest);

//     // Duplicate / similar files
//     const seen = {};
//     const duplicates = [];
//     files.forEach((f) => {
//       const key = f.originalname + "_" + f.size;
//       if (seen[key]) duplicates.push(f);
//       else seen[key] = true;
//     });
//     setDuplicateFiles(duplicates);

//     // Most frequently used tags
//     const tagCount = {};
//     files.forEach((f) => {
//       f.tags.forEach((tag) => {
//         tagCount[tag] = (tagCount[tag] || 0) + 1;
//       });
//     });
//     const sortedTags = Object.entries(tagCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5);
//     setTopTags(sortedTags);

//     // Upload history last 7 days
//     const last7Days = Array.from({ length: 7 }, (_, i) => {
//       const d = new Date();
//       d.setDate(d.getDate() - i);
//       const count = files.filter((f) => {
//         const fDate = new Date(f.createdAt);
//         return (
//           fDate.getFullYear() === d.getFullYear() &&
//           fDate.getMonth() === d.getMonth() &&
//           fDate.getDate() === d.getDate()
//         );
//       }).length;
//       return {
//         day: d.toISOString().slice(0, 10),
//         count,
//       };
//     }).reverse();
//     setUploadHistory(last7Days);

//     // Most downloaded files (Top 10, remove duplicates by name)
//     const already = new Set();
//     const topDl = [...files]
//       .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
//       .filter((f) => {
//         const key = f.customName || f.originalname;
//         if (already.has(key)) return false;
//         already.add(key);
//         return true;
//       })
//       .slice(0, 10)
//       .map((f) => ({
//         name: f.customName || f.originalname,
//         downloads: f.downloads || 0,
//       }));
//     setTopDownloads(topDl);

//     // === Tag-Similarity Clustering ===
//     const unvisited = new Set(files);
//     const clustersArr = [];

//     while (unvisited.size > 0) {
//       const cluster = [];
//       const queue = [unvisited.values().next().value];
//       while (queue.length > 0) {
//         const file = queue.pop();
//         if (!unvisited.has(file)) continue;
//         unvisited.delete(file);
//         cluster.push(file);

//         for (let f of unvisited) {
//           if (f.tags.some(tag => file.tags.includes(tag))) {
//             queue.push(f);
//           }
//         }
//       }
//       if (cluster.length > 1) clustersArr.push(cluster); // filter clusters with >1 file
//     }

//     // Compute cluster info: top tag + count
//     const formattedClusters = clustersArr.map((c) => {
//       const tagMap = {};
//       c.forEach(f => f.tags.forEach(tag => { tagMap[tag] = (tagMap[tag] || 0) + 1 }));
//       const topTag = Object.entries(tagMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "Misc";
//       return {
//         topTag,
//         count: c.length,
//         files: c,
//       };
//     });
//     setClusters(formattedClusters);

//   }, [files]);

//   return (
//     <div className="space-y-6 px-6 py-6">
//       {/* First row */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         {/* File Types Distribution */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">File Types Distribution</h3>
//           <ul className="space-y-1">
//             {Object.entries(fileTypes).map(([type, count]) => (
//               <li key={type} className="flex justify-between">
//                 <span>{type}</span>
//                 <span>{count}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Storage Breakdown */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Storage Breakdown</h3>
//           <p className="text-md text-gray-500 mb-1">Used</p>
//           <div className="relative w-full bg-gray-200 h-3 rounded">
//             <div
//               className="absolute top-0 left-0 h-3 bg-blue-600 rounded"
//               style={{ width: `${(storageUsed / 5120) * 100}%` }}
//             ></div>
//           </div>
//           <p className="text-sm text-gray-400 mt-1">{storageUsed} MB of 5 GB</p>
//         </div>

//         {/* Upload Activity */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Upload Activity</h3>
//           <ul className="space-y-1 text-md">
//             <li className="flex justify-between">
//               <span>This week</span>
//               <span>{uploadActivity.week} files</span>
//             </li>
//             <li className="flex justify-between">
//               <span>This month</span>
//               <span>{uploadActivity.month} files</span>
//             </li>
//             <li className="flex justify-between">
//               <span>Total uploads</span>
//               <span>{uploadActivity.total} files</span>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Second row */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Largest Files */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Largest Files</h3>
//           <ul className="space-y-1 text-md">
//             {largestFiles.map((f) => (
//               <li key={f._id || f.filename} className="flex justify-between text-md">
//                 <span>{f.customName}</span>
//                 <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Duplicate / Similar Files */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Duplicate / Similar Files</h3>
//           {duplicateFiles.length ? (
//             <ul className="space-y-1 text-md">
//               {duplicateFiles.map((f) => (
//                 <li key={f._id || f.filename}>{f.customName}</li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-400 text-sm">No duplicates found</p>
//           )}
//         </div>

//         {/* Most Frequently Used Tags */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Most Frequently Used Tags</h3>
//           {topTags.length ? (
//             <ul className="space-y-1 text-md">
//               {topTags.map(([tag, count]) => (
//                 <li key={tag} className="flex justify-between">
//                   <span>{tag}</span>
//                   <span>{count}</span>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-400 text-sm">No tags used yet</p>
//           )}
//         </div>
//       </div>

//       {/* Charts Section (new row) */}
//       <div className="grid grid-cols-1 gap-12">
//         {/* Upload Activity Line Chart */}
//         <div className="bg-white p-4 rounded-lg shadow mt-8">
//           <h3 className="font-semibold mb-8">Upload Activity (Last 7 Days)</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={uploadHistory}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="day" />
//               <YAxis allowDecimals={false} />
//               <Tooltip />
//               <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Most Downloaded Files */}
//         <div className="bg-white p-4 rounded-lg shadow mt-4">
//           <h3 className="font-semibold mb-4">Most Downloaded Files</h3>
//           {topDownloads.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={topDownloads}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="downloads" fill="#3b82f6" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="text-gray-400 text-sm">No downloads yet</p>
//           )}
//         </div>
//       </div>

//       {/* Cluster Section */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {clusters.map((c, idx) => (
//           <div key={idx} className="bg-white p-4 rounded-lg shadow hover:shadow-lg mt-8 transition-all">
//             <h3 className="font-bold text-lg mb-2">{c.topTag} Cluster</h3>
//             <p className="text-sm text-gray-500 mb-2">{c.count} files</p>
//             <div className="grid grid-cols-3 gap-8 max-h-60 overflow-y-auto">
//               {c.files.map(f => (
//                 <div key={f._id || f.filename} className="border rounded overflow-hidden h-24 w-24 flex items-center justify-center">
//                   {/* {f.mimetype.startsWith("image/") ? (
//                     <img src={f.url || f.path} alt={f.originalname} className="object-cover h-full w-full"/>
//                   ) : (
//                     <span className="text-xs text-gray-600 text-center px-1">{f.originalname}</span>
//                   )} */}

//                   {f.mimetype.startsWith("image/") ? (
//                     <img
//                       src={f.url || f.downloadURL}
//                       alt={f.originalname}
//                       className="object-cover h-full w-full"
//                     />
//                   ) : (
//                     <span className="text-xs text-gray-600 text-center px-1">{f.originalname}</span>
//                   )}

//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }











// // src/components/Analytics.jsx
// import React, { useEffect, useState } from "react";

// export default function Analytics({ files }) {
//   const [fileTypes, setFileTypes] = useState({});
//   const [storageUsed, setStorageUsed] = useState(0);
//   const [uploadActivity, setUploadActivity] = useState({});
//   const [largestFiles, setLargestFiles] = useState([]);
//   const [duplicateFiles, setDuplicateFiles] = useState([]);
//   const [topTags, setTopTags] = useState([]);

//   useEffect(() => {
//     if (!files || files.length === 0) return;

//     // File types
//     const types = { Images: 0, Videos: 0, Documents: 0, Audio: 0, Others: 0 };
//     files.forEach((f) => {
//       if (f.mimetype.startsWith("image/")) types.Images += 1;
//       else if (f.mimetype.startsWith("video/")) types.Videos += 1;
//       else if (
//         f.mimetype === "application/pdf" ||
//         f.mimetype.startsWith("text/") ||
//         f.mimetype === "application/msword" ||
//         f.mimetype.includes("spreadsheet")
//       )
//         types.Documents += 1;
//       else if (f.mimetype.startsWith("audio/")) types.Audio += 1;
//       else types.Others += 1;
//     });
//     setFileTypes(types);

//     // Storage used
//     const totalStorage = files.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024); // MB
//     setStorageUsed(Number(totalStorage.toFixed(2)));

//     // Upload activity
//     const now = new Date();
//     const thisWeek = files.filter((f) => {
//       const d = new Date(f.createdAt);
//       const diff = (now - d) / (1000 * 60 * 60 * 24);
//       return diff <= 7;
//     });
//     const thisMonth = files.filter((f) => {
//       const d = new Date(f.createdAt);
//       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//     });
//     setUploadActivity({
//       week: thisWeek.length,
//       month: thisMonth.length,
//       total: files.length,
//     });

//     // Largest files
//     const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 5);
//     setLargestFiles(largest);

//     // Duplicate / similar files (simple demo: same name or size)
//     const seen = {};
//     const duplicates = [];
//     files.forEach((f) => {
//       const key = f.originalname + "_" + f.size;
//       if (seen[key]) duplicates.push(f);
//       else seen[key] = true;
//     });
//     setDuplicateFiles(duplicates);

//     // Most frequently used tags
//     const tagCount = {};
//     files.forEach((f) => {
//       f.tags.forEach((tag) => {
//         tagCount[tag] = (tagCount[tag] || 0) + 1;
//       });
//     });
//     const sortedTags = Object.entries(tagCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5);
//     setTopTags(sortedTags);
//   }, [files]);

//   return (
//     <div className="space-y-6 px-6 py-4">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* File Types Distribution */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">File Types Distribution</h3>
//           <ul className="space-y-1">
//             {Object.entries(fileTypes).map(([type, count]) => (
//               <li key={type} className="flex justify-between">
//                 <span>{type}</span>
//                 <span>{count}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Storage Breakdown */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Storage Breakdown</h3>
//           <p className="text-sm text-gray-500 mb-1">Used</p>
//           <div className="relative w-full bg-gray-200 h-3 rounded">
//             <div
//               className="absolute top-0 left-0 h-3 bg-blue-600 rounded"
//               style={{ width: `${(storageUsed / 5120) * 100}%` }}
//             ></div>
//           </div>
//           <p className="text-xs text-gray-400 mt-1">
//             {storageUsed} MB of 5 GB
//           </p>
//         </div>

//         {/* Upload Activity */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Upload Activity</h3>
//           <ul className="space-y-1 text-sm">
//             <li className="flex justify-between">
//               <span>This week</span>
//               <span>{uploadActivity.week} files</span>
//             </li>
//             <li className="flex justify-between">
//               <span>This month</span>
//               <span>{uploadActivity.month} files</span>
//             </li>
//             <li className="flex justify-between">
//               <span>Total uploads</span>
//               <span>{uploadActivity.total} files</span>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Additional Analytics */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Largest Files */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Largest Files</h3>
//           <ul className="space-y-1 text-sm">
//             {largestFiles.map((f) => (
//               <li key={f._id || f.filename} className="flex justify-between">
//                 <span>{f.originalname}</span>
//                 <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Duplicate / Similar Files */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Duplicate / Similar Files</h3>
//           {duplicateFiles.length ? (
//             <ul className="space-y-1 text-sm">
//               {duplicateFiles.map((f) => (
//                 <li key={f._id || f.filename}>{f.originalname}</li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-400 text-sm">No duplicates found</p>
//           )}
//         </div>

//         {/* Most Frequently Used Tags */}
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold mb-2">Most Frequently Used Tags</h3>
//           {topTags.length ? (
//             <ul className="space-y-1 text-sm">
//               {topTags.map(([tag, count]) => (
//                 <li key={tag} className="flex justify-between">
//                   <span>{tag}</span>
//                   <span>{count}</span>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-400 text-sm">No tags used yet</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }