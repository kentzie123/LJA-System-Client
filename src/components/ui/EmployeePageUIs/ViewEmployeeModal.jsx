"use client";

import {
  X,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  User,
  Shield,
  DollarSign,
} from "lucide-react";

// Helper for Initials
const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Helper for Colors
const getAvatarColor = (id) => {
  const colors = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-info",
    "bg-success",
    "bg-warning",
    "bg-error",
    "bg-neutral",
  ];
  return colors[(id || 0) % colors.length];
};

const ViewEmployeeModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] scale-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-base-300 bg-base-200/30">
          <div className="flex items-center gap-4">
            <div className={`avatar placeholder`}>
              <div
                className={`${getAvatarColor(
                  employee.id
                )} text-white w-16 rounded-full flex items-center justify-center font-bold text-xl`}
              >
                <span>{getInitials(employee.fullname)}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{employee.fullname}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-sm badge-ghost">
                  {employee.role_name}
                </span>
                {employee.isActive ? (
                  <span className="badge badge-sm badge-success badge-outline">
                    Active
                  </span>
                ) : (
                  <span className="badge badge-sm badge-error badge-outline">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Section: Contact */}
          <div>
            <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">
              Contact Information
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/70">
                  <Mail className="size-4" />
                </div>
                <div>
                  <div className="text-base-content/50 text-xs">
                    Email Address
                  </div>
                  <div className="font-medium">{employee.email}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="divider my-0"></div>

          {/* Section: Employment */}
          <div>
            <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">
              Employment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/70">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <div className="text-base-content/50 text-xs">Position</div>
                  <div className="font-medium">
                    {employee.position || "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/70">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <div className="text-base-content/50 text-xs">Branch</div>
                  <div className="font-medium">
                    {employee.branch || "Unassigned"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/70">
                  <DollarSign className="size-4" />
                </div>
                <div>
                  <div className="text-base-content/50 text-xs">Daily Rate</div>
                  <div className="font-medium">
                    {employee.payrate ? `₱${employee.payrate}` : "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/70">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <div className="text-base-content/50 text-xs">
                    Joined Date
                  </div>
                  <div className="font-medium">
                    {formatDate(employee.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 bg-base-100 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
