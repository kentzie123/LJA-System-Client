// --- DATE HELPERS ---

export const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);
  if (isNaN(date)) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (timeValue) => {
  if (!timeValue) return "--:--";

  const date = new Date(timeValue);

  // If invalid date, try parsing HH:mm
  if (isNaN(date)) {
    const [hours, minutes] = timeValue.split(":");
    const temp = new Date();
    temp.setHours(hours || 0, minutes || 0, 0);
    return temp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// --- MONEY ---

export const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!value || isNaN(value)) {
    return "₱0.00";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

  // simple string hash
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return colors[hash % colors.length];
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