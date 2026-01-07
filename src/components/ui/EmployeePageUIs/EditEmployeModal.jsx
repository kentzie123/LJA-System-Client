"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useBranchStore } from "@/stores/useBranchStore";
import { useRoleStore } from "@/stores/useRoleStore"; // Import Role Store
import {
  X,
  User,
  Mail,
  Briefcase,
  MapPin,
  DollarSign,
  UserCog,
  Lock,
} from "lucide-react";

const EditEmployeeModal = ({ isOpen, onClose, employee }) => {
  const { updateUser, isUpdatingUser } = useUserStore();
  const { branches, fetchBranches, isLoadingBranches } = useBranchStore();
  const { roles, fetchRoles, isLoadingRoles } = useRoleStore(); // Get roles

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role_id: 3,
    branch: "",
    position: "",
    payrate: "",
  });

  // Fetch data on open
  useEffect(() => {
    if (isOpen) {
      fetchBranches();
      fetchRoles();
    }
  }, [isOpen, fetchBranches, fetchRoles]);

  // Load employee data
  useEffect(() => {
    if (employee) {
      setFormData({
        fullname: employee.fullname || "",
        email: employee.email || "",
        password: "",
        role_id: employee.role_id || 3,
        branch: employee.branch || "",
        position: employee.position || "",
        payrate: employee.payrate || "",
      });
    }
  }, [employee]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateUser(employee.id, formData);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-2xl rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh] scale-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h2 className="text-xl font-bold">Edit Employee</h2>
            <p className="text-sm text-base-content/60">
              Update details for{" "}
              <span className="font-medium text-base-content">
                {employee?.fullname}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="edit-employee-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Full Name, Email, Password (Unchanged) */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <User className="size-4 text-base-content/50" />
                <input
                  type="text"
                  className="grow"
                  required
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Mail className="size-4 text-base-content/50" />
                <input
                  type="email"
                  className="grow"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Change Password (Optional)
                </span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock className="size-4 text-base-content/50" />
                <input
                  type="password"
                  className="grow"
                  placeholder="Leave blank to keep current"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </label>
            </div>

            {/* Role (Dynamic) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Role</span>
              </label>
              <div className="relative">
                <UserCog className="z-1 absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
                <select
                  className="select select-bordered w-full pl-10"
                  value={formData.role_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role_id: parseInt(e.target.value),
                    })
                  }
                  disabled={isLoadingRoles}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Branch (Dynamic) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Branch</span>
              </label>
              <div className="relative">
                <MapPin className="z-1 absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50 pointer-events-none" />
                <select
                  className="select select-bordered w-full pl-10"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
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
            </div>

            {/* Position & Payrate (Unchanged) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Position</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Briefcase className="size-4 text-base-content/50" />
                <input
                  type="text"
                  className="grow"
                  required
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Daily Rate</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <DollarSign className="size-4 text-base-content/50" />
                <input
                  type="number"
                  className="grow"
                  required
                  value={formData.payrate}
                  onChange={(e) =>
                    setFormData({ ...formData, payrate: e.target.value })
                  }
                />
              </label>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-base-300 flex justify-end gap-3 bg-base-100 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isUpdatingUser}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-employee-form"
            className="btn btn-primary px-8"
            disabled={isUpdatingUser}
          >
            {isUpdatingUser ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
