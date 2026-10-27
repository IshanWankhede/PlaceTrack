import api from "./api.js";

export const applicationsService = {
  async getApplications(params = {}) {
    const res = await api.get("/applications", { params });
    return res.data;
  },

  async getMyApplications() {
    const res = await api.get("/applications/mine");
    return res.data;
  },

  async getApplicationById(id) {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },

  async applyToJob(jobId, studentId = null) {
    const body = { job_id: jobId };
    if (studentId) body.student_id = studentId;
    const res = await api.post("/applications", body);
    return res.data;
  },

  async updateStatus(applicationId, status) {
    const res = await api.patch(`/applications/${applicationId}/status`, { status });
    return res.data;
  },

  async bulkUpdateStatus(data) {
    // data: { job_id, from_status, to_status, department_id?, min_cgpa? }
    const res = await api.post("/applications/bulk-status", data);
    return res.data;
  },

  async withdrawApplication(applicationId) {
    const res = await api.post(`/applications/${applicationId}/withdraw`);
    return res.data;
  },

  async getStatusHistory(applicationId) {
    const res = await api.get(`/applications/${applicationId}/history`);
    return res.data;
  },

  async getInterviews(applicationId) {
    const res = await api.get(`/applications/${applicationId}/interviews`);
    return res.data;
  },

  async scheduleInterview(applicationId, data) {
    // data: { round_type, scheduled_at, meeting_link?, venue?, panelists?, reporting_time? }
    const res = await api.post(`/applications/${applicationId}/interviews`, data);
    return res.data;
  },

  async recordInterviewResult(applicationId, roundNumber, data) {
    // data: { result: 'CLEARED'|'REJECTED'|'PENDING'|'ABSENT', remarks? }
    const res = await api.patch(
      `/applications/${applicationId}/interviews/${roundNumber}`,
      data
    );
    return res.data;
  },
};

export default applicationsService;
