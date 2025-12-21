import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`, // Change to http://localhost:5000/api if using localhost
  withCredentials: true,
});

export default api;
