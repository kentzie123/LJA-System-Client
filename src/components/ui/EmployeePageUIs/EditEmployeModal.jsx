"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useBranchStore } from "@/stores/useBranchStore";
import { useRoleStore } from "@/stores/useRoleStore";
import { X } from "lucide-react";

const EditEmployeeModal = ({ isOpen, onClose, employee }) => {
  const { updateUser, isUpdatingUser } = useUserStore();
  const { branches, fetchBranches, isLoadingBranches } = useBranchStore();
  const { roles, fetchRoles, isLoadingRoles } = useRoleStore();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role_id: 3,
    branch: "",
    position: "",
    payrate: "",
  });

  // 1. Error State
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
      fetchRoles();
    }
  }, [isOpen, fetchBranches, fetchRoles]);

  // Load employee data & reset errors
  useEffect(() => {
    if (employee) {
      setFormData({
        fullname: employee.fullname || "",
        email: employee.email || "",
        password: "", // Password starts blank
        role_id: employee.role_id || 3,
        branch: employee.branch || "",
        position: employee.position || "",
        payrate: employee.payrate || "",
      });
      setErrors({}); // Clear old errors
    }
  }, [employee]);

  // 2. Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    // For role_id convert to int, otherwise string
    const finalValue = name === "role_id" ? parseInt(value) : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 3. Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim())
      newErrors.fullname = "Full Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format.";

    // NOTE: Password validation is looser here because it's optional for edits
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "New password must be at least 6 chars.";
    }

    if (!formData.branch) newErrors.branch = "Please select a branch.";
    if (!formData.position.trim()) newErrors.position = "Position is required.";

    if (!formData.payrate) newErrors.payrate = "Daily rate is required.";
    else if (isNaN(formData.payrate) || Number(formData.payrate) < 0)
      newErrors.payrate = "Invalid amount.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await updateUser(employee.id, formData);
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300">
          <div className="text-lg font-bold">Edit Employee</div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <div className="py-4 px-6 space-y-1 overflow-y-auto custom-scrollbar">
          <form id="edit-employee-form" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs font-semibold">
                Full Name
              </legend>
              <input
                type="text"
                name="fullname"
                className={`input input-bordered w-full text-xs ${
                  errors.fullname ? "input-error" : ""
                }`}
                placeholder="e.g. Juan Dela Cruz"
                value={formData.fullname}
                onChange={handleChange}
              />
              {errors.fullname && (
                <span className="text-error text-xs mt-1">
                  {errors.fullname}
                </span>
              )}
            </fieldset>

            {/* Email */}
            <fieldset className="fieldset mt-2">
              <legend className="fieldset-legend text-xs font-semibold">
                Email Address
              </legend>
              <input
                type="email"
                name="email"
                className={`input input-bordered w-full text-xs ${
                  errors.email ? "input-error" : ""
                }`}
                placeholder="user@lumina.co"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className="text-error text-xs mt-1">{errors.email}</span>
              )}
            </fieldset>

            {/* Password */}
            <fieldset className="fieldset mt-2">
              <legend className="fieldset-legend text-xs font-semibold">
                Password{" "}
                <span className="text-base-content/40 font-normal ml-1">
                  (Leave blank to keep current)
                </span>
              </legend>
              <input
                type="password"
                name="password"
                className={`input input-bordered w-full text-xs ${
                  errors.password ? "input-error" : ""
                }`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span className="text-error text-xs mt-1">
                  {errors.password}
                </span>
              )}
            </fieldset>

            {/* Grid: Branch & Role */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs font-semibold">
                  Branch
                </legend>
                <select
                  name="branch"
                  className={`select select-bordered w-full text-xs ${
                    errors.branch ? "select-error" : ""
                  }`}
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={isLoadingBranches}
                >
                  <option value="" disabled>
                    Select Branch
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {errors.branch && (
                  <span className="text-error text-xs mt-1">
                    {errors.branch}
                  </span>
                )}
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs font-semibold">
                  Role
                </legend>
                <select
                  name="role_id"
                  className="select select-bordered w-full text-xs"
                  value={formData.role_id}
                  onChange={handleChange}
                  disabled={isLoadingRoles}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>

            {/* Grid: Position & Payrate */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs font-semibold">
                  Position
                </legend>
                <input
                  type="text"
                  name="position"
                  className={`input input-bordered w-full text-xs ${
                    errors.position ? "input-error" : ""
                  }`}
                  placeholder="e.g. Sales"
                  value={formData.position}
                  onChange={handleChange}
                />
                {errors.position && (
                  <span className="text-error text-xs mt-1">
                    {errors.position}
                  </span>
                )}
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs font-semibold">
                  Daily Rate
                </legend>
                <input
                  type="number"
                  name="payrate"
                  className={`input input-bordered w-full text-xs ${
                    errors.payrate ? "input-error" : ""
                  }`}
                  placeholder="0.00"
                  value={formData.payrate}
                  onChange={handleChange}
                />
                {errors.payrate && (
                  <span className="text-error text-xs mt-1">
                    {errors.payrate}
                  </span>
                )}
              </fieldset>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="btn text-xs"
                disabled={isUpdatingUser}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs"
                disabled={isUpdatingUser}
              >
                {isUpdatingUser ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
