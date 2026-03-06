import React, { useState, useEffect, useMemo, useRef } from "react";
import { Users, X, ChevronDown, Search } from "lucide-react";

const EmployeeFilterDropdown = ({ users, selectedEmployees, setSelectedEmployees }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) =>
      u.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleToggleUser = (userId) => {
    if (selectedEmployees.includes(userId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== userId));
    } else {
      setSelectedEmployees([...selectedEmployees, userId]);
    }
  };

  const selectAll = () => {
    const allFilteredIds = filteredUsers.map((u) => u.id);
    const newSelection = new Set([...selectedEmployees, ...allFilteredIds]);
    setSelectedEmployees(Array.from(newSelection));
  };

  const clearFilters = () => {
    setSelectedEmployees([]);
  };

  const hasSelection = selectedEmployees.length > 0;

  return (
    <div className="relative w-full sm:w-[260px] z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-base-100 border h-10 w-full rounded-lg px-3 flex justify-between items-center transition-all shadow-sm ${
          isOpen ? "border-primary ring-1 ring-primary/20" : "border-base-300 hover:border-primary/50"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Users size={16} className={hasSelection ? "text-primary" : "text-base-content/40"} />
          <span className={`text-sm font-medium truncate ${hasSelection ? "text-primary" : "text-base-content/70"}`}>
            {hasSelection ? `${selectedEmployees.length} Employee${selectedEmployees.length > 1 ? "s" : ""}` : "All Employees"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasSelection && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="p-1 rounded bg-error/10 hover:bg-error/20 text-error transition-colors cursor-pointer"
            >
              <X size={12} strokeWidth={3} />
            </div>
          )}
          <ChevronDown size={14} className={`text-base-content/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-[320px] bg-base-300/90 backdrop-blur-md border border-base-100 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[420px] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 pb-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name..."
                className="w-full pl-9 pr-4 py-2 bg-base-100/50 border border-base-content/10 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium placeholder:text-base-content/30"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto px-2 pb-2 flex-1 space-y-1 custom-scrollbar">
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-sm font-medium text-base-content/40">No employees found</div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedEmployees.includes(user.id);
                return (
                  <label key={user.id} className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors group ${isSelected ? "bg-base-100/40" : "hover:bg-base-100/30"}`}>
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className="w-9 h-9 rounded-full shrink-0 shadow-inner overflow-hidden bg-base-300 border border-base-content/10">
                        <img
                          src={user.profile_picture || "/images/default_profile.jpg"}
                          alt={user.fullname}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = "/images/default_profile.jpg"; }}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate text-base-content leading-tight mb-0.5">{user.fullname}</span>
                        <span className="text-[11px] text-base-content/50 font-medium truncate leading-none">{user.position || "Employee"}</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary rounded-[4px] border-base-content/20 shrink-0"
                      checked={isSelected}
                      onChange={() => handleToggleUser(user.id)}
                    />
                  </label>
                );
              })
            )}
          </div>

          <div className="p-3 flex justify-between items-center border-t border-base-content/5 bg-base-300 shrink-0">
            <button onClick={clearFilters} className="text-[13px] font-bold text-base-content/40 hover:text-base-content transition-colors px-2 py-1 rounded">Clear All</button>
            <button onClick={selectAll} className="text-[13px] font-bold text-primary hover:text-primary-focus transition-colors px-2 py-1 rounded">Select All</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeFilterDropdown;