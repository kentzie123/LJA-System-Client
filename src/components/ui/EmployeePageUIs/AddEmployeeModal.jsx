"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useRoleStore } from "@/stores/useRoleStore"; 
import { X, Eye, EyeOff, Loader2, UserPlus } from "lucide-react"; 
import CustomDatePicker from "@/components/ui/Selections/CustomDatePicker";

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const { addUser, isAddingUser } = useUserStore();
  const { roles, isLoadingRoles } = useRoleStore();
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    fullname: "", email: "", password: "", contact_number: "",
    employee_id: "", date_hired: "", employment_type: "", role_id: 2, position: "", daily_rate: "",
    date_of_birth: "", place_of_birth: "", gender: "", civil_status: "", residential_address: "",
    sss_number: "", philhealth_number: "", pag_ibig_number: "", tin_number: "", bank_name: "", bank_account_number: "",
    emergency_contact_name: "", emergency_contact_number: "", emergency_relationship: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Sync native dialog
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === "role_id" ? parseInt(value) : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid";
    if (!formData.password) newErrors.password = "Required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 chars";
    if (!formData.position.trim()) newErrors.position = "Required";
    if (!formData.daily_rate) newErrors.daily_rate = "Required";
    else if (isNaN(formData.daily_rate) || Number(formData.daily_rate) < 0) newErrors.daily_rate = "Invalid";
    if (!formData.employee_id.trim()) newErrors.employee_id = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const success = await addUser(formData);
    if (success) {
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

  return (
    <dialog ref={modalRef} className={`modal modal-middle ${isOpen ? "modal-open" : ""}`} onClose={onClose}>
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-4xl border border-base-300 shadow-2xl rounded-xl flex flex-col max-h-[90vh] antialiased-text">
        
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-base-200 bg-base-200/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary"><UserPlus size={16} /></div>
            <h3 className="font-bold text-[14px] uppercase tracking-wider">New Employee Registration</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-base-content/50 hover:text-error" disabled={isAddingUser}>
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          <form id="add-employee-form" onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* 1. ACCOUNT DETAILS */}
            <section>
              <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-3 border-b border-base-200 pb-1">Account Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                    Full Name * {errors.fullname && <span className="text-error">{errors.fullname}</span>}
                  </label>
                  <input type="text" name="fullname" className={`input input-bordered h-8 text-[12px] px-2 w-full ${errors.fullname ? "border-error" : ""}`} value={formData.fullname} onChange={handleChange} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                    Email Address * {errors.email && <span className="text-error">{errors.email}</span>}
                  </label>
                  <input type="email" name="email" className={`input input-bordered h-8 text-[12px] px-2 w-full ${errors.email ? "border-error" : ""}`} value={formData.email} onChange={handleChange} />
                </div>
                <div className="form-control relative">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                    Password * {errors.password && <span className="text-error">{errors.password}</span>}
                  </label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" className={`input input-bordered h-8 text-[12px] pl-2 pr-8 w-full ${errors.password ? "border-error" : ""}`} value={formData.password} onChange={handleChange} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Contact Number</label>
                  <input type="text" name="contact_number" className="input input-bordered h-8 text-[12px] px-2 w-full" value={formData.contact_number} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* 2. EMPLOYMENT DETAILS */}
            <section>
              <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-3 border-b border-base-200 pb-1">Employment Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                    Employee ID * {errors.employee_id && <span className="text-error">{errors.employee_id}</span>}
                  </label>
                  <input type="text" name="employee_id" className={`input input-bordered h-8 text-[12px] px-2 w-full font-mono ${errors.employee_id ? "border-error" : ""}`} value={formData.employee_id} onChange={handleChange} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Date Hired</label>
                  <CustomDatePicker value={formData.date_hired} onChange={(date) => setFormData(prev => ({ ...prev, date_hired: date }))} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Employment Type</label>
                  <select name="employment_type" className="select select-bordered select-sm h-8 min-h-0 text-[11px] w-full" value={formData.employment_type} onChange={handleChange}>
                    <option value="" disabled>Select</option>
                    <option value="Regular">Regular</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Contractual">Contractual</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Role *</label>
                  <select name="role_id" className="select select-bordered select-sm h-8 min-h-0 text-[11px] w-full" value={formData.role_id} onChange={handleChange} disabled={isLoadingRoles}>
                    {roles.map((role) => <option key={role.id} value={role.id}>{role.role_name}</option>)}
                  </select>
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                    Position * {errors.position && <span className="text-error">{errors.position}</span>}
                  </label>
                  <input type="text" name="position" className={`input input-bordered h-8 text-[12px] px-2 w-full ${errors.position ? "border-error" : ""}`} value={formData.position} onChange={handleChange} />
                </div>
                <div className="form-control relative">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
                    Daily Rate * {errors.daily_rate && <span className="text-error">{errors.daily_rate}</span>}
                  </label>
                  <span className="absolute left-2.5 top-[22px] text-[12px] opacity-50">₱</span>
                  <input type="number" name="daily_rate" className={`input input-bordered h-8 text-[12px] pl-6 pr-2 w-full tabular-nums ${errors.daily_rate ? "border-error" : ""}`} value={formData.daily_rate} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* 3. PERSONAL INFORMATION */}
            <section>
              <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-3 border-b border-base-200 pb-1">Personal Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-3">
                <div className="form-control md:col-span-2">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Date of Birth</label>
                  <CustomDatePicker value={formData.date_of_birth} onChange={(date) => setFormData(prev => ({ ...prev, date_of_birth: date }))} />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Place of Birth</label>
                  <input type="text" name="place_of_birth" className="input input-bordered h-8 text-[12px] px-2 w-full" value={formData.place_of_birth} onChange={handleChange} />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Gender</label>
                  <select name="gender" className="select select-bordered select-sm h-8 min-h-0 text-[11px] w-full" value={formData.gender} onChange={handleChange}>
                    <option value="" disabled>Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-control md:col-span-2">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Civil Status</label>
                  <select name="civil_status" className="select select-bordered select-sm h-8 min-h-0 text-[11px] w-full" value={formData.civil_status} onChange={handleChange}>
                    <option value="" disabled>Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div className="form-control md:col-span-4">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Residential Address</label>
                  <input type="text" name="residential_address" className="input input-bordered h-8 text-[12px] px-2 w-full" value={formData.residential_address} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* 4. GOV & BANK */}
            <section>
              <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-3 border-b border-base-200 pb-1">Identifiers & Banking</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">SSS Number</label>
                  <input type="text" name="sss_number" className="input input-bordered h-8 text-[12px] px-2 w-full font-mono" value={formData.sss_number} onChange={handleChange} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">PhilHealth</label>
                  <input type="text" name="philhealth_number" className="input input-bordered h-8 text-[12px] px-2 w-full font-mono" value={formData.philhealth_number} onChange={handleChange} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Pag-IBIG</label>
                  <input type="text" name="pag_ibig_number" className="input input-bordered h-8 text-[12px] px-2 w-full font-mono" value={formData.pag_ibig_number} onChange={handleChange} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">TIN</label>
                  <input type="text" name="tin_number" className="input input-bordered h-8 text-[12px] px-2 w-full font-mono" value={formData.tin_number} onChange={handleChange} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Bank Name</label>
                  <input type="text" name="bank_name" className="input input-bordered h-8 text-[12px] px-2 w-full" value={formData.bank_name} onChange={handleChange} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Account Number</label>
                  <input type="text" name="bank_account_number" className="input input-bordered h-8 text-[12px] px-2 w-full font-mono" value={formData.bank_account_number} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* 5. EMERGENCY */}
            <section>
              <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-3 border-b border-base-200 pb-1">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Contact Name</label>
                  <input type="text" name="emergency_contact_name" className="input input-bordered h-8 text-[12px] px-2 w-full" value={formData.emergency_contact_name} onChange={handleChange} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Contact Number</label>
                  <input type="text" name="emergency_contact_number" className="input input-bordered h-8 text-[12px] px-2 w-full" value={formData.emergency_contact_number} onChange={handleChange} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Relationship</label>
                  <input type="text" name="emergency_relationship" className="input input-bordered h-8 text-[12px] px-2 w-full" value={formData.emergency_relationship} onChange={handleChange} />
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-base-200 bg-base-200/50 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="btn btn-sm h-8 min-h-0 btn-ghost text-[10px] uppercase font-bold px-4" disabled={isAddingUser}>Cancel</button>
          <button type="submit" form="add-employee-form" className="btn btn-sm h-8 min-h-0 btn-primary text-[10px] uppercase font-bold px-6 shadow-sm border-none text-white" disabled={isAddingUser}>
            {isAddingUser ? <Loader2 className="animate-spin size-4" /> : "Create Employee"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form>
    </dialog>
  );
};

export default AddEmployeeModal;