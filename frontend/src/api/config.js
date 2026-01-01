import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.message || "Something went wrong";
    console.error("API Error:", errorMessage);
    return Promise.reject(errorMessage);
  }
);

export default axiosInstance;
