import api from "./api.js";

export const notificationsService = {
  async getNotifications(unread = null) {
    const params = unread !== null ? { unread } : {};
    const res = await api.get("/notifications", { params });
    return res.data;
  },

  async markAllRead() {
    const res = await api.post("/notifications/read-all");
    return res.data;
  },
};

export default notificationsService;
