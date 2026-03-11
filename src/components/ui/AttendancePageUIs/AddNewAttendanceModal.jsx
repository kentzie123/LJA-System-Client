"use client";

import { useState, useEffect, useRef } from "react";
import { useAttendanceStore } from "@/stores/useAttendanceStore";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  X,
  Calendar,
  Clock,
  Image as ImageIcon,
  Loader2,
  UserCheck
} from "lucide-react";

import UserSelectDropdown from "../Selections/UserSelectDropdown";
import CustomDatePicker from "../Selections/CustomDatePicker";

const AddNewAttendanceModal = ({ isOpen, onClose, users }) => {
  const { authUser } = useAuthStore();
  const {
    createManualEntry,
    adminClockOverride,
    isAddingAttendance,
    isCreating,
  } = useAttendanceStore();

  const modalRef = useRef(null);
  const isSuperAdmin = authUser?.role_id === 3;
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    userId: "",
    date: new Date().toLocaleDateString("en-CA"),
    timeIn: "08:00",
    timeOut: "17:00",
    status: "Present",
    type: "in",
    overrideTime: "",
    photo: null,
    workSummary: "",
  });

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
      setErrors({});
      setFormData({
        userId: "",
        date: new Date().toLocaleDateString("en-CA"),
        timeIn: "08:00",
        timeOut: "17:00",
        status: "Present",
        type: "in",
        overrideTime: "",
        photo: null,
        workSummary: "",
      });
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId) newErrors.userId = "Required";
    if (isSuperAdmin && !formData.overrideTime) newErrors.overrideTime = "Required";
    if (isSuperAdmin && formData.type === "out" && !formData.workSummary.trim()) {
        newErrors.workSummary = "Summary required for clock-out";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isSuperAdmin) {
      const payload = {
        targetUserId: formData.userId,
        type: formData.type,
        date: formData.date,
        overrideTime: formData.overrideTime,
        photo: formData.photo,
        workSummary: formData.type === "out" ? formData.workSummary : undefined,
      };
      await adminClockOverride(payload);
    } else {
      const payload = {
        userId: formData.userId,
        date: formData.date,
        timeIn: formData.timeIn,
        timeOut: formData.timeOut,
        status: formData.status,
        workSummary: formData.status !== "Absent" ? formData.workSummary : undefined,
      };
      await createManualEntry(payload);
    }
    onClose();
  };

  const isAbsent = formData.status === "Absent";
  const isProcessing = isAddingAttendance || isCreating;

  return (
    <dialog ref={modalRef} className={`modal modal-middle ${isOpen ? "modal-open" : ""}`} onClose={onClose}>
      <div className="modal-box p-0 bg-base-100 overflow-hidden w-11/12 max-w-[380px] border border-base-300 shadow-2xl rounded-xl flex flex-col max-h-[85vh]">
        
        {/* COMPACT HEADER */}
        <div className={`flex items-center justify-between py-3 px-5 border-b border-base-300 shrink-0 ${isSuperAdmin ? "bg-primary/5 text-primary" : "bg-base-200/50"}`}>
          <div>
            <div className="text-[14px] font-bold flex items-center gap-2">
              {isSuperAdmin ? <><Clock size={16} /> Admin Override</> : <><UserCheck size={16} /> Manual Entry</>}
            </div>
            <p className="text-[9px] font-semibold opacity-50 uppercase tracking-widest">
              {isSuperAdmin ? "Live System Override" : "Historical Record"}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-xs btn-circle btn-ghost opacity-50 hover:opacity-100">
            <X size={14} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Employee Selection */}
          <div className="form-control z-50">
            <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex justify-between">
              Employee {errors.userId && <span className="text-error font-bold">{errors.userId}</span>}
            </label>
            <UserSelectDropdown
              users={users}
              value={formData.userId}
              onChange={(id) => {
                setFormData({ ...formData, userId: id });
                if(errors.userId) setErrors({...errors, userId: ""});
              }}
            />
          </div>

          {isSuperAdmin ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="form-control">
                <div className="grid grid-cols-2 gap-1 bg-base-200 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "in" })}
                    className={`h-7 rounded-md text-[10px] font-bold uppercase transition-all ${formData.type === "in" ? "bg-base-100 text-primary shadow-sm" : "opacity-50 hover:opacity-100"}`}
                  >
                    Clock In
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "out" })}
                    className={`h-7 rounded-md text-[10px] font-bold uppercase transition-all ${formData.type === "out" ? "bg-base-100 text-error shadow-sm" : "opacity-50 hover:opacity-100"}`}
                  >
                    Clock Out
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Calendar size={10} /> Date
                  </label>
                  <CustomDatePicker 
                    value={formData.date}
                    onChange={(d) => setFormData({ ...formData, date: d })}
                  />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={10} /> Time {errors.overrideTime && <span className="text-error">•</span>}
                  </label>
                  <input
                    type="time"
                    className={`input input-bordered h-8 text-[12px] px-2 focus:outline-none focus:border-primary ${errors.overrideTime ? "border-error" : ""}`}
                    value={formData.overrideTime}
                    onChange={(e) => {
                        setFormData({ ...formData, overrideTime: e.target.value });
                        if(errors.overrideTime) setErrors({...errors, overrideTime: ""});
                    }}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <ImageIcon size={10} /> Evidence (Optional)
                </label>
                {!formData.photo ? (
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="file-input file-input-xs file-input-bordered h-8 text-[11px] w-full" />
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-base-300 aspect-video group">
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData({...formData, photo: null})} className="absolute top-1 right-1 btn btn-circle btn-xs btn-error shadow-lg">
                        <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              {formData.type === "out" && (
                <div className="form-control animate-in slide-in-from-top-1">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">
                    Work Summary {errors.workSummary && <span className="text-error ml-1">({errors.workSummary})</span>}
                  </label>
                  <textarea
                    placeholder="Tasks completed..."
                    className={`textarea textarea-bordered h-16 text-[12px] leading-snug w-full ${errors.workSummary ? "border-error" : ""}`}
                    value={formData.workSummary}
                    onChange={(e) => {
                        setFormData({ ...formData, workSummary: e.target.value });
                        if(errors.workSummary) setErrors({...errors, workSummary: ""});
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            /* STANDARD ADMIN COMPACT FIELDS */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Date</label>
                  <CustomDatePicker value={formData.date} onChange={(d) => setFormData({ ...formData, date: d })} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Status</label>
                  <select
                    className="select select-bordered select-sm h-8 min-h-0 py-0 text-[12px] w-full"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-3 transition-all duration-300 ${isAbsent ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-success uppercase tracking-widest mb-1">Time In</label>
                  <input type="time" className="input input-bordered h-8 text-[12px] px-2" value={formData.timeIn} onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })} disabled={isAbsent} />
                </div>
                <div className="form-control">
                  <label className="text-[9px] font-bold text-error uppercase tracking-widest mb-1">Time Out</label>
                  <input type="time" className="input input-bordered h-8 text-[12px] px-2" value={formData.timeOut} onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })} disabled={isAbsent} />
                </div>
              </div>

              {!isAbsent && (
                <div className="form-control">
                  <label className="text-[9px] font-bold text-base-content/50 uppercase tracking-widest mb-1">Work Summary</label>
                  <textarea
                    placeholder="Optional notes..."
                    className="textarea textarea-bordered h-16 text-[12px] leading-snug w-full"
                    value={formData.workSummary}
                    onChange={(e) => setFormData({ ...formData, workSummary: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 bg-base-200/50 border-t border-base-300 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="btn btn-ghost h-8 min-h-0 text-[11px] px-4 font-bold uppercase tracking-wider" disabled={isProcessing}>Cancel</button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className={`btn btn-sm h-8 min-h-0 px-5 rounded-md shadow-sm text-[11px] font-bold uppercase tracking-wider border-none ${isSuperAdmin && formData.type === 'out' ? 'bg-error text-white' : 'btn-primary text-white'}`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin size-3" />
            ) : isSuperAdmin ? (
              `Override ${formData.type}`
            ) : (
              "Save Record"
            )}
          </button>
        </div>
      </div>

      <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => !isCreating && onClose()}></div>
    </dialog>
  );
};

export default AddNewAttendanceModal;