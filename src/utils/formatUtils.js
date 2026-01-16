export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return "--:--";
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// --- UI STYLING HELPERS ---

export const getAvatarColor = (name) => {
  if (!name) return "bg-gray-500";
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

export const getTypeColor = (type) => {
  switch (type) {
    case "Regular Day":
    case "Regular":
      return "text-info bg-info/10";
    case "Rest Day":
      return "text-warning bg-warning/10";
    case "Special Holiday":
      return "text-orange-500 bg-orange-500/10";
    case "Regular Holiday":
    case "Holiday":
      return "text-error bg-error/10";
    default:
      return "text-base-content/70 bg-base-300";
  }
};



