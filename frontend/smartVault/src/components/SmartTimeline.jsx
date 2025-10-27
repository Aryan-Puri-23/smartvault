import { motion } from "framer-motion";

const groupFilesByDate = (files) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const groups = { Today: [], ThisWeek: [], Older: [] };

  files.forEach((file) => {
    const fileDate = new Date(file.createdAt);
    if (fileDate.toDateString() === today.toDateString()) groups.Today.push(file);
    else if (fileDate >= startOfWeek) groups.ThisWeek.push(file);
    else groups.Older.push(file);
  });

  return groups;
};

export default function SmartTimeline({ files }) {
  const grouped = groupFilesByDate(files);
  const timelineSections = [
    { label: "📅 Today", items: grouped.Today },
    { label: "📆 This Week", items: grouped.ThisWeek },
    { label: "🗓️ Older", items: grouped.Older },
  ];

  return (
    <div className="p-6 w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Smart Timeline</h2>

      {timelineSections.map(
        (section) =>
          section.items.length > 0 && (
            <div key={section.label} className="mb-10">
              <h3 className="text-lg font-bold mb-6 text-gray-700">{section.label}</h3>

              <div className="relative border-l border-gray-300 sm:border-none sm:grid sm:grid-cols-2 sm:gap-8">
                {section.items.map((file, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <motion.div
                      key={file._id}
                      className={`relative mb-10 flex items-start sm:mb-12 sm:block ${
                        isEven ? "sm:pl-10 sm:text-left" : "sm:pr-10 sm:text-right"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Timeline dot (only visible on small screens) */}
                      <div className="absolute left-[-7px] top-2 w-3 h-3 bg-blue-500 rounded-full sm:hidden"></div>

                      <div
                        className={`relative bg-white border rounded-lg shadow-sm p-4 w-full sm:w-5/6 hover:shadow-md transition ${
                          isEven ? "sm:ml-auto" : "sm:mr-auto"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 flex items-center justify-center rounded-md border bg-gray-50 overflow-hidden">
                            {(file.mimetype || "").startsWith("image/") ? (
                              <img
                                src={file.cloudinaryUrl || file.url}
                                alt={file.originalname}
                                className="h-full w-full object-cover"
                              />
                            ) : (file.mimetype || "").startsWith("video/") ? (
                              <video
                                src={file.url}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <p className="text-gray-400 text-sm font-medium">
                                {file.mimetype?.split("/")[0].toUpperCase() || "FILE"}
                              </p>
                            )}
                          </div>

                          {/* File details */}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-800 truncate cursor-pointer hover:underline">
                              {file.customName || file.originalname}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(file.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Hover info card (desktop only) */}
                        <div className="hidden sm:block mt-3 text-sm text-gray-600">
                          <p>Type: {file.mimetype}</p>
                          <p>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )
      )}
    </div>
  );
}
