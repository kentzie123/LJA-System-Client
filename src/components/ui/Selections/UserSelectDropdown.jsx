import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, Check, User } from "lucide-react";

const UserSelectDropdown = ({ users = [], value, onChange, placeholder = "Select Employee", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter((u) =>
      u.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Find the currently selected user object to display in the trigger button
  const selectedUser = users.find((u) => u.id === (typeof value === "object" ? value?.id : Number(value)));

  const handleSelect = (user) => {
    // Return both the ID (for easy form state) and the full user object (in case the parent needs it)
    onChange(user.id, user);
    setIsOpen(false);
    setSearchQuery(""); // Reset search on select
  };

  return (
    <div className="relative w-full z-50" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-base-100 border h-10 w-full rounded-lg px-3 flex justify-between items-center transition-all shadow-sm ${
          isOpen ? "border-primary ring-1 ring-primary/20" : "border-base-300 hover:border-primary/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedUser ? (
            <>
              <div className="w-6 h-6 rounded-full overflow-hidden bg-base-300 border border-base-content/10 shrink-0">
                <img
                  src={selectedUser.profile_picture || "/images/default_profile.jpg"}
                  alt={selectedUser.fullname}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/images/default_profile.jpg"; }}
                />
              </div>
              <span className="text-sm font-medium text-base-content truncate">
                {selectedUser.fullname}
              </span>
            </>
          ) : (
            <>
              <User size={16} className="text-base-content/40" />
              <span className="text-sm font-medium text-base-content/50">
                {placeholder}
              </span>
            </>
          )}
        </div>
        <ChevronDown size={16} className={`text-base-content/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-base-100 border border-base-300 shadow-xl rounded-xl overflow-hidden flex flex-col max-h-64 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Search Bar */}
          <div className="p-2 border-b border-base-200">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name..."
                className="w-full pl-8 pr-3 py-1.5 bg-base-200/50 border-none rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-base-content/40"
                autoFocus
              />
            </div>
          </div>

          {/* User List */}
          <div className="overflow-y-auto custom-scrollbar p-1">
            {filteredUsers.length === 0 ? (
              <div className="py-4 text-center text-xs font-medium text-base-content/40">
                No employees found
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-left ${
                      isSelected ? "bg-primary/10 text-primary" : "hover:bg-base-200/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-base-300 shrink-0">
                        <img
                          src={user.profile_picture || "/images/default_profile.jpg"}
                          alt={user.fullname}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = "/images/default_profile.jpg"; }}
                        />
                      </div>
                      <span className={`text-sm truncate ${isSelected ? "font-semibold" : "font-medium text-base-content"}`}>
                        {user.fullname}
                      </span>
                    </div>
                    {isSelected && <Check size={16} className="text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelectDropdown;