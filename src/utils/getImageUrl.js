export const getImageUrl = (path) => {
  if (!path) return "";
  
  if (path.startsWith("data:image") || path.startsWith("http")) {
    return path;
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${backendUrl}${path}`;
};