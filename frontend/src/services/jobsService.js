import api from "./api.js";

export const jobsService = {
  async getJobs(params = {}) {
    const res = await api.get("/jobs", { params });
    return res.data;
  },

  async getJobById(id) {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  },

  async createJob(data) {
    const res = await api.post("/jobs", data);
    return res.data;
  },

  async updateJob(id, data) {
    const res = await api.put(`/jobs/${id}`, data);
    return res.data;
  },

  async deleteJob(id) {
    const res = await api.delete(`/jobs/${id}`);
    return res.data;
  },

  async archiveJob(id) {
    const res = await api.patch(`/jobs/${id}/archive`);
    return res.data;
  },

  async closeExpiredJobs() {
    const res = await api.post("/jobs/close-expired");
    return res.data;
  },

  async getEligibleStudents(jobId) {
    const res = await api.get(`/jobs/${jobId}/eligible-students`);
    return res.data;
  },

  async getJobEligibility(jobId, studentId = null) {
    const params = studentId ? { student_id: studentId } : {};
    const res = await api.get(`/jobs/${jobId}/eligibility`, { params });
    return res.data;
  },
};

export default jobsService;
