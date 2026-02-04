import React from "react";

const PermissionCheckbox = ({ label, checked, onChange, disabled = false }) => {
  return (
    <label
      className={`
      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none h-full
      ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-base-200 border-base-200"
          : checked
            ? "bg-primary/5 border-primary shadow-sm"
            : "bg-base-100 border-base-300 hover:border-primary/50"
      }
    `}
    >
      <input
        type="checkbox"
        className={`checkbox checkbox-sm rounded ${checked ? "checkbox-primary" : "border-base-content/40"}`}
        checked={checked || false}
        onChange={!disabled ? onChange : undefined}
        disabled={disabled}
      />
      <span
        className={`text-sm font-medium ${checked ? "text-primary" : "text-base-content/80"}`}
      >
        {label}
      </span>
    </label>
  );
};

export default PermissionCheckbox;
