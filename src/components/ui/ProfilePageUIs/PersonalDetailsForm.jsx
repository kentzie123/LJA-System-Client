// Icons
import { User, Pencil, Save, X } from "lucide-react";

// Store
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";

// Hooks
import { useEffect, useState } from "react";

const PersonalDetailsForm = () => {
  const { authUser } = useAuthStore();
  const { updateUserProfile } = useUserStore();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({}); // initialized as empty object

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  // Sync form with authUser on load
  useEffect(() => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullname || "",
        email: authUser.email || "",
        password: "", // Password usually starts empty for security
      });
    }
  }, [authUser]);

  // Handle Input Change (Updates data & Clears errors)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this specific field as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle Cancel: Revert changes, clear errors, exit edit mode
  const handleCancel = () => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullname || "",
        email: authUser.email || "",
        password: "",
      });
    }
    setErrors({}); // Clear validation errors
    setIsEditing(false);
  };

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};

    // 1. Full Name Validation
    if (!formData.fullname || formData.fullname.trim().length < 3) {
      newErrors.fullname = "Name is required (min 3 chars)";
    }

    // 2. Email Validation
    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }

    // 3. Password Validation (OPTIONAL)
    // Only validate if the user has typed something
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // 1. Run Validation
    if (!validateForm()) return;

    // 2. Submit if valid
    await updateUserProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 card-title opacity-60">
            <User size={15} />
            <div className="uppercase tracking-wider text-xs font-bold">
              Personal Information
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  className="btn btn-xs btn-ghost text-error"
                  onClick={handleCancel}
                >
                  <X size={14} /> Cancel
                </button>
                <button className="btn btn-xs btn-primary" onClick={handleSave}>
                  <Save size={14} /> Save
                </button>
              </>
            ) : (
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* FORM GRID */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Full Name */}
          <fieldset className="fieldset md:col-span-2">
            <legend className="fieldset-legend text-xxs uppercase font-semibold opacity-60">
              Full Name
            </legend>
            <input
              type="text"
              name="fullname"
              placeholder="e.g. John Doe"
              className={`input input-bordered w-full text-xs ${
                !isEditing
                  ? "input-ghost px-0 border-transparent"
                  : errors.fullname
                    ? "input-error"
                    : ""
              }`}
              value={formData.fullname}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            {errors.fullname && (
              <p className="text-xs text-error mt-1">{errors.fullname}</p>
            )}
          </fieldset>

          {/* 2. Email */}
          <fieldset className="fieldset md:col-span-2">
            <legend className="fieldset-legend text-xxs uppercase font-semibold opacity-60">
              Email
            </legend>
            <input
              type="email"
              name="email"
              placeholder="e.g. mail@example.com"
              className={`input input-bordered w-full text-xs ${
                !isEditing
                  ? "input-ghost px-0 border-transparent"
                  : errors.email
                    ? "input-error"
                    : ""
              }`}
              value={formData.email}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            {errors.email && (
              <p className="text-xs text-error mt-1">{errors.email}</p>
            )}
          </fieldset>

          {/* 3. Password */}
          <fieldset className="fieldset md:col-span-2">
            <legend className="fieldset-legend text-xxs uppercase font-semibold opacity-60 flex justify-between w-full">
              <span>Password</span>
              {isEditing && (
                <span className="text-base-content/40 lowercase font-normal italic">
                  (leave blank to keep unchanged)
                </span>
              )}
            </legend>
            <input
              type="password"
              name="password"
              placeholder={isEditing ? "New password (optional)" : "••••••••••"}
              className={`input input-bordered w-full text-xs ${
                !isEditing
                  ? "input-ghost px-0 border-transparent"
                  : errors.password
                    ? "input-error"
                    : ""
              }`}
              value={formData.password}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            {errors.password && (
              <p className="text-xs text-error mt-1">{errors.password}</p>
            )}
          </fieldset>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;
