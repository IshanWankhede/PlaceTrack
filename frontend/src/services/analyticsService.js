import api from "./api.js";

export const analyticsService = {
  async getOverview() {
    const res = await api.get("/analytics/overview");
    return res.data;
  },

  async getDepartments() {
    const res = await api.get("/analytics/departments");
    return res.data;
  },

  async getCompanies() {
    const res = await api.get("/analytics/companies");
    return res.data;
  },

  async getPackages() {
    const res = await api.get("/analytics/packages");
    return res.data;
  },

  async getFunnel() {
    const res = await api.get("/analytics/funnel");
    return res.data;
  },

  async getTopStudents() {
    const res = await api.get("/analytics/top-students");
    return res.data;
  },

  async refresh() {
    const res = await api.post("/analytics/refresh");
    return res.data;
  },

  getNirfReportUrl() {
    const base = api.defaults.baseURL || "http://localhost:8000/api/v1";
    return `${base}/analytics/nirf-report.csv`;
  },
};

export default analyticsService;
