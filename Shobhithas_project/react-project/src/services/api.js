// src/api.js
import axios from "axios";

// ✅ Create a reusable axios instance
const API = axios.create({
  baseURL: "http://127.0.0.1:5000", // your Flask backend URL
});

// ✅ Optional global error interceptor (helps with debugging)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

//
// ------------------ AUTH ENDPOINTS ------------------
//

// 🔹 Signup
export const signupUser = (formData) => API.post("/signup", formData);

// 🔹 Login
export const loginUser = (formData) => API.post("/login", formData);

// 🔹 Update Profile
export const updateProfile = (formData) => API.put("/update_profile", formData);

//
// ------------------ ADMIN USER MANAGEMENT ------------------
//

// 🔹 Get all users
export const getUsers = () => API.get("/api/users");

// 🔹 Block user
export const blockUser = (userId) => API.put(`/api/users/block/${userId}`);

// 🔹 Unblock user
export const unblockUser = (userId) => API.put(`/api/users/unblock/${userId}`);

// 🔹 Delete user
export const deleteUser = (userId) => API.delete(`/api/users/delete/${userId}`);

export default API;
