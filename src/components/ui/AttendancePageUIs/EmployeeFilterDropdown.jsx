import React, { useState, useEffect, useMemo, useRef } from "react";
import { Users, X, ChevronDown, Search } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";

const EmployeeFilterDropdown = ({ users, selectedEmployees, setSelectedEmployees }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users
      .filter((u) => u.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.fullname.localeCompare(b.fullname)); // Added alphabetical sort
  }, [users, searchQuery]);

  const handleToggleUser = (userId) => {
    setSelectedEmployees(
      selectedEmployees.includes(userId)
        ? selectedEmployees.filter((id) => id !== userId)
        : [...selectedEmployees, userId]
    );
  };

  const hasSelection = selectedEmployees.length > 0;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* COMPACT TRIGGER (h-8) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-base-100 border h-8 w-full rounded-md px-2 flex justify-between items-center transition-all shadow-sm ${
          isOpen ? "border-primary ring-1 ring-primary/20" : "border-base-300 hover:border-primary/40"
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Users size={12} className={hasSelection ? "text-primary" : "opacity-40"} />
          <span className={`text-[11px] font-bold truncate ${hasSelection ? "text-primary" : "opacity-60"}`}>
            {hasSelection ? `${selectedEmployees.length} Selected` : "All Employees"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {hasSelection && (
            <div
              onClick={(e) => { e.stopPropagation(); setSelectedEmployees([]); }}
              className="p-0.5 rounded hover:bg-error/10 text-error/60 hover:text-error transition-colors cursor-pointer"
            >
              <X size={10} strokeWidth={3} />
            </div>
          )}
          <ChevronDown size={10} className={`opacity-40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* COMPACT DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full sm:w-[280px] bg-base-100 border border-base-300 shadow-xl rounded-lg overflow-hidden flex flex-col max-h-[350px] animate-in fade-in zoom-in-95 duration-150">
          {/* SEARCH BOX */}
          <div className="p-1.5 border-b border-base-200 bg-base-200/30">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name..."
                className="w-full pl-7 pr-2 py-1 bg-base-100 border border-base-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:opacity-50"
                autoFocus
              />
            </div>
          </div>

          {/* LIST AREA */}
          <div className="overflow-y-auto p-1 space-y-0.5 custom-scrollbar bg-base-100">
            {filteredUsers.length === 0 ? (
              <div className="py-4 text-center text-[10px] opacity-40 italic">No matches</div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedEmployees.includes(user.id);
                return (
                  <label 
                    key={user.id} 
                    className={`flex items-center justify-between p-1.5 rounded transition-colors cursor-pointer group ${isSelected ? "bg-primary/5" : "hover:bg-base-200/50"}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 relative rounded-full shrink-0 overflow-hidden bg-base-200 border border-base-content/5">
                        <Image
                          src={user.profile_picture ? getImageUrl(user.profile_picture) : "/images/default_profile.jpg"}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] truncate leading-none ${isSelected ? "font-bold text-primary" : "font-medium"}`}>
                          {user.fullname}
                        </span>
                        <span className="text-[9px] opacity-40 truncate leading-tight">{user.position || "Employee"}</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary rounded-[3px] opacity-60 group-hover:opacity-100 transition-opacity"
                      checked={isSelected}
                      onChange={() => handleToggleUser(user.id)}
                    />
                  </label>
                );
              })
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-1.5 flex justify-between items-center border-t border-base-200 bg-base-200/20 shrink-0">
            <button 
              onClick={() => setSelectedEmployees([])} 
              className="text-[10px] font-bold opacity-40 hover:opacity-100 px-2 py-1 transition-all"
            >
              Clear
            </button>
            <button 
              onClick={() => setSelectedEmployees(filteredUsers.map(u => u.id))} 
              className="text-[10px] font-bold text-primary hover:brightness-90 px-2 py-1 transition-all"
            >
              Select All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeFilterDropdown;