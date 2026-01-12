"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useBranchStore } from "@/stores/useBranchStore";
import { useRoleStore } from "@/stores/useRoleStore";
import {
  X,
  User,
  Mail,
  Lock,
  Briefcase,
  MapPin,
  PhilippinePeso,
  UserCog,
} from "lucide-react";

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const { addUser, isAddingUser } = useUserStore();
  const { branches, fetchBranches, isLoadingBranches } = useBranchStore();
  const { roles, fetchRoles, isLoadingRoles } = useRoleStore();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role_id: 3, // Default fallback
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

  // Reset form & errors on close/open
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    } else {
        // Optional: Reset form data if you want fresh form every time
    }
  }, [isOpen]);

  // 2. Handle Change + Clear Error
  const handleChange = (e) => {
    const { name, value } = e.target;
    // For role_id convert to int, otherwise string
    const finalValue = name === "role_id" ? parseInt(value) : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 3. Validation Logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) newErrors.fullname = "Full Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format.";
    
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 chars.";
    
    if (!formData.branch) newErrors.branch = "Please select a branch.";
    if (!formData.position.trim()) newErrors.position = "Position is required.";
    
    // Payrate validation
    if (!formData.payrate) newErrors.payrate = "Daily rate is required.";
    else if (isNaN(formData.payrate) || Number(formData.payrate) < 0) newErrors.payrate = "Invalid amount.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return; // Stop if invalid

    const success = await addUser(formData);
    if (success) {
      setFormData({
        fullname: "",
        email: "",
        password: "",
        role_id: 3,
        branch: "",
        position: "",
        payrate: "",
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] overflow-hidden">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300">
          <div>
            <div className="text-lg font-bold">Add New Employee</div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Create a new user account and assign roles.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="add-employee-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            noValidate // Disable browser default validation to use custom logic
          >
            {/* 1. Full Name */}
            <fieldset className="fieldset w-full md:col-span-2">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Full Name
              </legend>
              <div className="relative">
                <input
                  type="text"
                  name="fullname" // Add name attribute
                  placeholder="e.g. Juan Dela Cruz"
                  className={`input input-bordered w-full pl-10 text-sm ${errors.fullname ? "input-error" : ""}`}
                  value={formData.fullname}
                  onChange={handleChange}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
              </div>
              {errors.fullname && <span className="text-error text-xs mt-1">{errors.fullname}</span>}
            </fieldset>

            {/* 2. Email Address */}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Email Address
              </legend>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="user@lumina.co"
                  className={`input input-bordered w-full pl-10 text-sm ${errors.email ? "input-error" : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
              </div>
              {errors.email && <span className="text-error text-xs mt-1">{errors.email}</span>}
            </fieldset>

            {/* 3. Password */}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Password
              </legend>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 text-sm ${errors.password ? "input-error" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
              </div>
              {errors.password && <span className="text-error text-xs mt-1">{errors.password}</span>}
            </fieldset>

            {/* 4. Branch */}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Branch
              </legend>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none z-10" />
                <select
                  name="branch"
                  className={`select select-bordered w-full pl-10 text-sm ${errors.branch ? "select-error" : ""}`}
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={isLoadingBranches}
                >
                  <option value="" disabled>
                    Select a branch
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.branch && <span className="text-error text-xs mt-1">{errors.branch}</span>}
            </fieldset>

            {/* 5. Role */}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Role
              </legend>
              <div className="relative">
                <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none z-10" />
                <select
                  name="role_id"
                  className="select select-bordered w-full pl-10 text-sm"
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
              </div>
            </fieldset>

            {/* 6. Position */}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Position
              </legend>
              <div className="relative">
                <input
                  type="text"
                  name="position"
                  placeholder="e.g. Sales Associate"
                  className={`input input-bordered w-full pl-10 text-sm ${errors.position ? "input-error" : ""}`}
                  value={formData.position}
                  onChange={handleChange}
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
              </div>
              {errors.position && <span className="text-error text-xs mt-1">{errors.position}</span>}
            </fieldset>

            {/* 7. Daily Rate */}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend text-xs font-semibold text-base-content/70 pb-1">
                Daily Rate
              </legend>
              <div className="relative">
                <input
                  type="number"
                  name="payrate"
                  placeholder="0.00"
                  className={`input input-bordered w-full pl-10 text-sm ${errors.payrate ? "input-error" : ""}`}
                  value={formData.payrate}
                  onChange={handleChange}
                />
                <PhilippinePeso className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
              </div>
              {errors.payrate && <span className="text-error text-xs mt-1">{errors.payrate}</span>}
            </fieldset>
          </form>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 border-t border-base-300 flex justify-end gap-3 bg-base-100 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isAddingUser}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-employee-form"
            className="btn btn-primary px-8"
            disabled={isAddingUser}
          >
            {isAddingUser ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Create Employee"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;