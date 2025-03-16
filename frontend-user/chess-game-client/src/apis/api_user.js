import api from "./api_config";

export const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Fetch user profile error:", error.response?.data || error.message);
    throw error;
  }
};
