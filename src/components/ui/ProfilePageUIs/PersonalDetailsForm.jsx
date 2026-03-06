import { User, Pencil, Save, X, HeartPulse, MapPin, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect, useState } from "react";

const PersonalDetailsForm = () => {
  const { authUser } = useAuthStore();
  const { updateUserProfile, isUpdatingUser } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // New state for password toggle

  const [formData, setFormData] = useState({
    fullname: "", email: "", password: "", contact_number: "",
    date_of_birth: "", place_of_birth: "", gender: "", civil_status: "",
    residential_address: "", emergency_contact_name: "", emergency_contact_number: "", emergency_relationship: ""
  });

  // Helper to safely format DB date to HTML date input format
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullname || "",
        email: authUser.email || "",
        password: "", // Always empty initially
        contact_number: authUser.contact_number || "",
        date_of_birth: formatDateForInput(authUser.date_of_birth),
        place_of_birth: authUser.place_of_birth || "",
        gender: authUser.gender || "",
        civil_status: authUser.civil_status || "",
        residential_address: authUser.residential_address || "",
        emergency_contact_name: authUser.emergency_contact_name || "",
        emergency_contact_number: authUser.emergency_contact_number || "",
        emergency_relationship: authUser.emergency_relationship || "",
      });
    }
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCancel = () => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullname || "", email: authUser.email || "", password: "",
        contact_number: authUser.contact_number || "", date_of_birth: formatDateForInput(authUser.date_of_birth),
        place_of_birth: authUser.place_of_birth || "", gender: authUser.gender || "",
        civil_status: authUser.civil_status || "", residential_address: authUser.residential_address || "",
        emergency_contact_name: authUser.emergency_contact_name || "", emergency_contact_number: authUser.emergency_contact_number || "",
        emergency_relationship: authUser.emergency_relationship || "",
      });
    }
    setErrors({});
    setIsEditing(false);
    setShowPassword(false); // Reset password visibility on cancel
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname || formData.fullname.trim().length < 3) newErrors.fullname = "Name required (min 3 chars)";
    if (!formData.email || !formData.email.includes("@")) newErrors.email = "Valid email required";
    if (formData.password && formData.password.length < 6) newErrors.password = "Min 6 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const success = await updateUserProfile(formData);
    if (success) {
      setIsEditing(false);
      setShowPassword(false); // Reset password visibility on save
      setFormData((prev) => ({ ...prev, password: "" })); // Clear password field after successful save
    }
  };

  // UI Helper for Input Fields
  const renderField = (label, name, type = "text", placeholder = "", colSpan = 1, isSelect = false, options = []) => (
    <fieldset className={`fieldset ${colSpan === 2 ? "md:col-span-2" : ""}`}>
      <legend className="fieldset-legend text-xxs uppercase font-semibold opacity-60 flex justify-between w-full">
        <span>{label}</span>
        {name === "password" && isEditing && (
          <span className="text-base-content/40 lowercase font-normal italic">(leave blank to keep unchanged)</span>
        )}
      </legend>
      
      {isSelect ? (
        <select
          name={name}
          className={`select select-bordered w-full text-xs ${!isEditing ? "select-ghost px-0 border-transparent appearance-none pointer-events-none" : ""}`}
          value={formData[name]}
          onChange={handleChange}
          disabled={!isEditing}
        >
          <option value="" disabled>Select {label}</option>
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : name === "password" && isEditing ? (
        // SHOW/HIDE PASSWORD FIELD (Only rendered when editing)
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name={name}
            placeholder={placeholder}
            className={`input input-bordered w-full text-xs pr-10 ${errors[name] ? "input-error" : ""}`}
            value={formData[name]}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/50 hover:text-primary transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      ) : (
        // STANDARD TEXT FIELD
        <input
          type={type}
          name={name}
          placeholder={isEditing ? placeholder : "N/A"}
          className={`input input-bordered w-full text-xs ${!isEditing ? "input-ghost px-0 border-transparent" : errors[name] ? "input-error" : ""}`}
          value={name === "password" && !isEditing ? "••••••••" : formData[name]} // Fake bullets if not editing
          onChange={handleChange}
          readOnly={!isEditing}
        />
      )}
      {errors[name] && <p className="text-xs text-error mt-1">{errors[name]}</p>}
    </fieldset>
  );

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-6 md:p-8">
        
        {/* HEADER CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-base-200">
          <div>
            <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
              <User size={20} className="text-secondary" />
              Personal Profile
            </h2>
            <p className="text-xs text-base-content/60 mt-1">Keep your contact and emergency information up to date.</p>
          </div>

          <div className="flex gap-2 self-end sm:self-auto">
            {isEditing ? (
              <>
                <button className="btn btn-sm btn-ghost text-error" onClick={handleCancel} disabled={isUpdatingUser}>
                  <X size={16} /> Cancel
                </button>
                <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={isUpdatingUser}>
                  <Save size={16} /> {isUpdatingUser ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button className="btn btn-sm btn-outline border-base-300" onClick={() => setIsEditing(true)}>
                <Pencil size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* 1. ACCOUNT INFO */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderField("Full Name", "fullname", "text", "e.g. John Doe", 2)}
            {renderField("Email Address", "email", "email", "user@company.com")}
            {renderField("Password", "password", "password", "New password (optional)")}
          </div>

          <div className="divider text-xs uppercase font-bold opacity-40">Demographics & Contact</div>

          {/* 2. DEMOGRAPHICS & CONTACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderField("Contact Number", "contact_number", "text", "09xxxxxxxxx")}
            {renderField("Date of Birth", "date_of_birth", "date")}
            {renderField("Gender", "gender", "text", "", 1, true, ["Male", "Female", "Other"])}
            {renderField("Civil Status", "civil_status", "text", "", 1, true, ["Single", "Married", "Widowed", "Divorced"])}
            {renderField("Place of Birth", "place_of_birth", "text", "City, Province", 2)}
            {renderField("Residential Address", "residential_address", "text", "Full Address", 2)}
          </div>

          <div className="divider text-xs uppercase font-bold opacity-40 text-error">
            <HeartPulse size={14} className="inline mr-1" /> Emergency Contact
          </div>

          {/* 3. EMERGENCY CONTACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-error/5 p-4 rounded-xl border border-error/10">
            {renderField("Contact Name", "emergency_contact_name", "text", "Full Name", 2)}
            {renderField("Relationship", "emergency_relationship", "text", "e.g. Spouse, Parent")}
            {renderField("Contact Number", "emergency_contact_number", "text", "09xxxxxxxxx")}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalDetailsForm;