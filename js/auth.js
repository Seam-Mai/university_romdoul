// js/auth.js
const API_BASE_URL = "http://206.189.155.117/api/api/auth";

export const AuthService = {
  // 1. REGISTER
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },

  // 2. LOGIN
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },

  // 3. LOGOUT
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  },
};
