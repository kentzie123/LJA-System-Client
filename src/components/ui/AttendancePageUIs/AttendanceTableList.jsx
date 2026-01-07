import { ImageIcon } from "lucide-react";

const AttendanceTableList = ({ attendances, isFetchingAttendances }) => {
  // Helper to format 24h time to 12h or keep as is
  const formatTime = (time) => {
    if (!time) return "-";
    return time.substring(0, 5); // Returns HH:MM
  };

  // Helper to get initials if the backend doesn't provide them
  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "??"
    );
  };

  return (
    <table className="table w-full border-separate border-spacing-0">
      <thead>
        <tr className="bg-base-300/50 text-base-content/50 uppercase text-xxs tracking-wider">
          <th className="py-4 pl-6 font-semibold border-b border-base-300">
            Employee
          </th>
          <th className="py-4 font-semibold border-b border-base-300">Date</th>
          <th className="py-4 font-semibold border-b border-base-300">Times</th>
          <th className="py-4 font-semibold border-b border-base-300 text-center">
            Status
          </th>
          <th className="py-4 font-semibold border-b border-base-300">
            Photos
          </th>
          <th className="py-4 pr-6 font-semibold border-b border-base-300 text-right">
            Action (In / Out)
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-base-300">
        {isFetchingAttendances ? (
          <tr>
            <td colSpan="6" className="py-10 text-center opacity-50">
              Loading records...
            </td>
          </tr>
        ) : attendances.length === 0 ? (
          <tr>
            <td colSpan="6" className="py-10 text-center opacity-50">
              No attendance records found.
            </td>
          </tr>
        ) : (
          attendances.map((record) => (
            <tr
              key={record.id}
              className="hover:bg-base-100/50 transition-colors"
            >
              {/* Employee Info */}
              <td className="py-4 pl-6">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-info text-info-content rounded-full w-10 h-10">
                      <span className="text-sm font-bold">
                        {record.initials || getInitials(record.fullname)}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-base-content">
                    {record.fullname}
                  </span>
                </div>
              </td>

              {/* Date */}
              <td className="py-4 text-base-content/80 text-xs">
                {new Date(record.date).toLocaleDateString()}
              </td>

              {/* Times */}
              <td className="py-4 text-xxs font-mono">
                <div className="flex flex-col gap-0.5">
                  <span className="text-info font-bold">
                    IN:{" "}
                    <span className="text-base-content/40">
                      {formatTime(record.time_in)}
                    </span>
                  </span>
                  <span className="text-error font-bold">
                    OUT:{" "}
                    <span className="text-base-content/40">
                      {formatTime(record.time_out)}
                    </span>
                  </span>
                </div>
              </td>

              {/* Status Badge */}
              <td className="py-4 text-center">
                <span
                  className={`px-3 py-1 rounded-full border text-xxs font-bold uppercase ${
                    record.time_in
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-warning/30 bg-warning/10 text-warning"
                  }`}
                >
                  {record.time_out
                    ? "Completed"
                    : record.time_in
                    ? "On Duty"
                    : "Absent"}
                </span>
              </td>

              {/* Photo Links */}
              <td className="py-4">
                <div className="flex gap-2">
                  {record.photo_in ? (
                    <div className="tooltip" data-tip="View Photo In">
                      <a
                        href={record.photo_in}
                        target="_blank"
                        className="btn btn-ghost btn-xs px-1 h-auto min-h-0"
                      >
                        <ImageIcon className="size-4 text-info" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-xxs opacity-20">No In</span>
                  )}
                  {record.photo_out && (
                    <div className="tooltip" data-tip="View Photo Out">
                      <a
                        href={record.photo_out}
                        target="_blank"
                        className="btn btn-ghost btn-xs px-1 h-auto min-h-0"
                      >
                        <ImageIcon className="size-4 text-error" />
                      </a>
                    </div>
                  )}
                </div>
              </td>

              {/* Action States */}
              <td className="py-4 pr-6 text-right">
                <div className="flex flex-col items-end gap-1 text-xxs font-bold uppercase tracking-tighter">
                  <div className="flex items-center gap-2">
                    <span className="opacity-40">IN</span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        record.time_in
                          ? "bg-success text-success-content"
                          : "bg-warning text-warning-content"
                      }`}
                    >
                      {record.time_in ? "Logged" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-40">OUT</span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        record.time_out
                          ? "bg-info text-info-content"
                          : "bg-base-300 text-base-content/40"
                      }`}
                    >
                      {record.time_out ? "Logged" : "N/A"}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default AttendanceTableList;
