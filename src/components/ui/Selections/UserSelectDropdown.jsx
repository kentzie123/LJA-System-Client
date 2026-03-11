import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, Check, User } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";

const UserSelectDropdown = ({ users = [], value, onChange, placeholder = "Select Employee", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // 1. SORT USERS ALPHABETICALLY (A-Z)
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.fullname.localeCompare(b.fullname));
  }, [users]);

  // 2. FILTER SORTED LIST BASED ON SEARCH
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return sortedUsers;
    return sortedUsers.filter(u => 
      u.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedUsers, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedUser = users.find(u => u.id === (typeof value === "object" ? value?.id : Number(value)));

  return (
    <div className="relative w-full z-50 text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-base-100 border h-8 w-full rounded-md px-2 flex justify-between items-center transition-all shadow-sm text-[12px] ${
          isOpen ? "border-primary ring-1 ring-primary/20" : "border-base-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedUser ? (
            <>
              <div className="w-5 h-5 relative rounded-full overflow-hidden bg-base-300 border border-base-content/5 shrink-0">
                <Image src={getImageUrl(selectedUser.profile_picture) || "/images/default_profile.jpg"} alt="" fill className="object-cover" />
              </div>
              <span className="font-medium text-base-content truncate">{selectedUser.fullname}</span>
            </>
          ) : (
            <>
              <User size={12} className="text-base-content/40" />
              <span className="opacity-50">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown size={12} className={`text-base-content/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-base-100 border border-base-300 shadow-xl rounded-lg overflow-hidden flex flex-col max-h-56 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1.5 border-b border-base-200">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1 bg-base-200/50 border-none rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto p-1 custom-scrollbar">
            {filteredUsers.length === 0 ? (
              <div className="py-2 text-center text-[10px] opacity-40 italic">No matches</div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => { 
                      onChange(user.id, user); 
                      setIsOpen(false); 
                      setSearchQuery(""); 
                    }}
                    className={`w-full flex items-center justify-between p-1.5 rounded transition-colors text-left ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-base-200/50"}`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div className="w-6 h-6 relative rounded-full overflow-hidden bg-base-300 shrink-0">
                        <Image src={getImageUrl(user.profile_picture) || "/images/default_profile.jpg"} alt="" fill className="object-cover" />
                      </div>
                      <span className={`text-[12px] truncate ${isSelected ? "font-bold" : "font-medium"}`}>{user.fullname}</span>
                    </div>
                    {isSelected && <Check size={12} className="text-primary shrink-0" />}
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