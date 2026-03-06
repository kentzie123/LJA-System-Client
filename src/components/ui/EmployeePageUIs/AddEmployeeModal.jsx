"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useRoleStore } from "@/stores/useRoleStore"; 
import { X, Eye, EyeOff } from "lucide-react"; 

// --- ADDED IMPORT ---
import CustomDatePicker from "@/components/ui/Selections/CustomDatePicker";

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const { addUser, isAddingUser } = useUserStore();
  const { roles, isLoadingRoles } = useRoleStore();

  const [formData, setFormData] = useState({
    // Account
    fullname: "",
    email: "",
    password: "",
    contact_number: "",
    // Employment
    employee_id: "",
    date_hired: "",
    employment_type: "",
    role_id: 2,
    position: "",
    daily_rate: "",
    // Personal
    date_of_birth: "",
    place_of_birth: "",
    gender: "",
    civil_status: "",
    residential_address: "",
    // Government & Bank
    sss_number: "",
    philhealth_number: "",
    pag_ibig_number: "",
    tin_number: "",
    bank_name: "",
    bank_account_number: "",
    // Emergency
    emergency_contact_name: "",
    emergency_contact_number: "",
    emergency_relationship: "",
  });

  // Error State
  const [errors, setErrors] = useState({});
  // Toggle State for Password
  const [showPassword, setShowPassword] = useState(false);

  // Handle Change for Standard Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === "role_id" ? parseInt(value) : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) newErrors.fullname = "Full Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format.";

    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 chars.";

    if (!formData.position.trim()) newErrors.position = "Position is required.";

    if (!formData.daily_rate) newErrors.daily_rate = "Daily rate is required.";
    else if (isNaN(formData.daily_rate) || Number(formData.daily_rate) < 0)
      newErrors.daily_rate = "Invalid amount.";

    if (!formData.employee_id.trim()) newErrors.employee_id = "Employee ID is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await addUser(formData);
    if (success) {
      // Reset form and UI states on success
      setFormData({
        fullname: "", email: "", password: "", contact_number: "",
        employee_id: "", date_hired: "", employment_type: "", role_id: 2, position: "", daily_rate: "",
        date_of_birth: "", place_of_birth: "", gender: "", civil_status: "", residential_address: "",
        sss_number: "", philhealth_number: "", pag_ibig_number: "", tin_number: "", bank_name: "", bank_account_number: "",
        emergency_contact_name: "", emergency_contact_number: "", emergency_relationship: "",
      });
      setShowPassword(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-3xl rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[95vh] overflow-hidden scale-in-95 duration-200">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between bg-base-200 py-4 px-6 border-b border-base-300">
          <div className="text-lg font-bold">Add New Employee</div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-error"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* --- FORM BODY --- */}
        <div className="py-4 px-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* 1. ACCOUNT DETAILS */}
            <div>
              <div className="text-sm font-bold text-primary mb-3">Account Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Full Name *</legend>
                  <input type="text" name="fullname" className={`input input-bordered w-full text-xs ${errors.fullname ? "input-error" : ""}`} placeholder="e.g. Juan Dela Cruz" value={formData.fullname} onChange={handleChange} />
                  {errors.fullname && <span className="text-error text-[10px] mt-1">{errors.fullname}</span>}
                </fieldset>
                
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Email Address *</legend>
                  <input type="email" name="email" className={`input input-bordered w-full text-xs ${errors.email ? "input-error" : ""}`} placeholder="user@company.com" value={formData.email} onChange={handleChange} />
                  {errors.email && <span className="text-error text-[10px] mt-1">{errors.email}</span>}
                </fieldset>
                
                <fieldset className="fieldset relative">
                  <legend className="fieldset-legend text-xs font-semibold">Password *</legend>
                  <div className="relative w-full">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      className={`input input-bordered w-full text-xs pr-10 ${errors.password ? "input-error" : ""}`} 
                      placeholder="••••••••" 
                      value={formData.password} 
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
                  {errors.password && <span className="text-error text-[10px] mt-1">{errors.password}</span>}
                </fieldset>
                
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Contact Number</legend>
                  <input type="text" name="contact_number" className="input input-bordered w-full text-xs" placeholder="09xxxxxxxxx" value={formData.contact_number} onChange={handleChange} />
                </fieldset>
              </div>
            </div>

            <div className="divider my-0"></div>

            {/* 2. EMPLOYMENT DETAILS */}
            <div>
              <div className="text-sm font-bold text-primary mb-3">Employment Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Employee ID *</legend>
                  <input type="text" name="employee_id" className={`input input-bordered w-full text-xs ${errors.employee_id ? "input-error" : ""}`} placeholder="e.g. 2025-001" value={formData.employee_id} onChange={handleChange} />
                  {errors.employee_id && <span className="text-error text-[10px] mt-1">{errors.employee_id}</span>}
                </fieldset>

                {/* --- UPDATED DATE HIRED --- */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Date Hired</legend>
                  <CustomDatePicker 
                    value={formData.date_hired}
                    onChange={(date) => setFormData(prev => ({ ...prev, date_hired: date }))}
                    placeholder="Select Date"
                  />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Employment Type</legend>
                  <select name="employment_type" className="select select-bordered w-full text-xs" value={formData.employment_type} onChange={handleChange}>
                    <option value="" disabled>Select Type</option>
                    <option value="Regular">Regular</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Contractual">Contractual</option>
                  </select>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Role *</legend>
                  <select name="role_id" className="select select-bordered w-full text-xs" value={formData.role_id} onChange={handleChange} disabled={isLoadingRoles}>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.role_name}</option>
                    ))}
                  </select>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Position *</legend>
                  <input type="text" name="position" className={`input input-bordered w-full text-xs ${errors.position ? "input-error" : ""}`} placeholder="e.g. Technical Staff" value={formData.position} onChange={handleChange} />
                  {errors.position && <span className="text-error text-[10px] mt-1">{errors.position}</span>}
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Daily Rate (PHP) *</legend>
                  <input type="number" name="daily_rate" className={`input input-bordered w-full text-xs ${errors.daily_rate ? "input-error" : ""}`} placeholder="0.00" value={formData.daily_rate} onChange={handleChange} />
                  {errors.daily_rate && <span className="text-error text-[10px] mt-1">{errors.daily_rate}</span>}
                </fieldset>
              </div>
            </div>

            <div className="divider my-0"></div>

            {/* 3. PERSONAL INFORMATION */}
            <div>
              <div className="text-sm font-bold text-primary mb-3">Personal Information</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* --- UPDATED DATE OF BIRTH --- */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Date of Birth</legend>
                  <CustomDatePicker 
                    value={formData.date_of_birth}
                    onChange={(date) => setFormData(prev => ({ ...prev, date_of_birth: date }))}
                    placeholder="Select Date"
                  />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Place of Birth</legend>
                  <input type="text" name="place_of_birth" className="input input-bordered w-full text-xs" placeholder="City, Province" value={formData.place_of_birth} onChange={handleChange} />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Gender</legend>
                  <select name="gender" className="select select-bordered w-full text-xs" value={formData.gender} onChange={handleChange}>
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Civil Status</legend>
                  <select name="civil_status" className="select select-bordered w-full text-xs" value={formData.civil_status} onChange={handleChange}>
                    <option value="" disabled>Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </fieldset>
                <fieldset className="fieldset md:col-span-2">
                  <legend className="fieldset-legend text-xs font-semibold">Residential Address</legend>
                  <input type="text" name="residential_address" className="input input-bordered w-full text-xs" placeholder="Full Address" value={formData.residential_address} onChange={handleChange} />
                </fieldset>
              </div>
            </div>

            <div className="divider my-0"></div>

            {/* 4. GOVERNMENT & BANKING */}
            <div>
              <div className="text-sm font-bold text-primary mb-3">Government & Bank IDs</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">SSS Number</legend>
                  <input type="text" name="sss_number" className="input input-bordered w-full text-xs" placeholder="00-0000000-0" value={formData.sss_number} onChange={handleChange} />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">PhilHealth Number</legend>
                  <input type="text" name="philhealth_number" className="input input-bordered w-full text-xs" placeholder="00-000000000-0" value={formData.philhealth_number} onChange={handleChange} />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Pag-IBIG Number</legend>
                  <input type="text" name="pag_ibig_number" className="input input-bordered w-full text-xs" placeholder="0000-0000-0000" value={formData.pag_ibig_number} onChange={handleChange} />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">TIN</legend>
                  <input type="text" name="tin_number" className="input input-bordered w-full text-xs" placeholder="000-000-000-000" value={formData.tin_number} onChange={handleChange} />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Bank Name</legend>
                  <input type="text" name="bank_name" className="input input-bordered w-full text-xs" placeholder="e.g. Unionbank" value={formData.bank_name} onChange={handleChange} />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Bank Account Number</legend>
                  <input type="text" name="bank_account_number" className="input input-bordered w-full text-xs" placeholder="Account No." value={formData.bank_account_number} onChange={handleChange} />
                </fieldset>
              </div>
            </div>

            <div className="divider my-0"></div>

            {/* 5. EMERGENCY CONTACT */}
            <div>
              <div className="text-sm font-bold text-primary mb-3">Emergency Contact</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Contact Name</legend>
                  <input type="text" name="emergency_contact_name" className="input input-bordered w-full text-xs" placeholder="Full Name" value={formData.emergency_contact_name} onChange={handleChange} />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-xs font-semibold">Contact Number</legend>
                  <input type="text" name="emergency_contact_number" className="input input-bordered w-full text-xs" placeholder="09xxxxxxxxx" value={formData.emergency_contact_number} onChange={handleChange} />
                </fieldset>
                <fieldset className="fieldset md:col-span-2">
                  <legend className="fieldset-legend text-xs font-semibold">Relationship</legend>
                  <input type="text" name="emergency_relationship" className="input input-bordered w-full text-xs" placeholder="e.g. Spouse, Parent" value={formData.emergency_relationship} onChange={handleChange} />
                </fieldset>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-base-300">
              <button type="button" onClick={onClose} className="btn text-xs" disabled={isAddingUser}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary text-xs" disabled={isAddingUser}>
                {isAddingUser ? "Creating..." : "Create Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;