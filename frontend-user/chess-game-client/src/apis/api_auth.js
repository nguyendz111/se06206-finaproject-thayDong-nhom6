// import api from "./api_config";

// export const loginUser = async (email, password) => {
//   try {
//     const response = await api.post("/auth/login", { email, password });
//     return response.data;
//   } catch (error) {
//     console.error("Login error:", error.response?.data || error.message);
//     throw error;
//   }
// };


import axios from "axios";
import { URL } from "./api";

const API_BASE_URL = `${URL}/api/auth`;

/**
 * Sign up a new user.
 * @param {Object} userData - User information (email, password, firstName, lastName, birthDay, active, address).
 * @returns {Promise} API response.
 */
export const signUp = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sign-up`, userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Sign in an existing user.
 * @param {Object} credentials - User credentials (email, password).
 * @returns {Promise} API response with JWT token.
 */
export const signIn = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sign-in`, credentials);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

/**
 * Set authentication token for future API requests.
 * @param {string} token - JWT token.
 */
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};