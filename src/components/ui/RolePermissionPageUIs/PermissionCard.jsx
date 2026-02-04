import React from "react";

const PermissionCard = ({ title, icon: Icon, children }) => {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 overflow-visible h-full">
      <div className="card-body p-6">
        <h3 className="flex items-center gap-2 text-base font-bold text-base-content border-b border-base-200 pb-3 mb-4">
          <Icon className="size-4 text-primary" />
          {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PermissionCard;