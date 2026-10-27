import api from "./api.js";

export const placementsService = {
  async getPlacements(params = {}) {
    const res = await api.get("/placements", { params });
    return res.data;
  },

  async getMyPlacement() {
    const res = await api.get("/placements/mine");
    return res.data;
  },

  getExportUrl() {
    const base = api.defaults.baseURL || "http://localhost:8000/api/v1";
    return `${base}/placements/export.csv`;
  },
};

export default placementsService;
