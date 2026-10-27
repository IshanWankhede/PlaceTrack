import api from "./api.js";

export const authService = {
  async login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  async requestSignupOtp(rollNumber, email) {
    const res = await api.post("/auth/signup/request-otp", {
      roll_number: rollNumber,
      email,
    });
    return res.data;
  },

  async verifySignup(email, otp, password) {
    const res = await api.post("/auth/signup/verify", {
      email,
      otp,
      password,
    });
    return res.data;
  },

  async forgotPassword(email) {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(email, otp, newPassword) {
    const res = await api.post("/auth/reset-password", {
      email,
      otp,
      new_password: newPassword,
    });
    return res.data;
  },

  async getMe() {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

export default authService;
