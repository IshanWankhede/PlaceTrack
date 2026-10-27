import api from "./api.js";

export const studentsService = {
  async getStudents(params = {}) {
    const res = await api.get("/students", { params });
    return res.data;
  },

  async getStudentById(id) {
    const res = await api.get(`/students/${id}`);
    return res.data;
  },

  async getMe() {
    const res = await api.get("/students/me");
    return res.data;
  },

  async updateMe(data) {
    const res = await api.patch("/students/me", data);
    return res.data;
  },

  async createStudent(data) {
    const res = await api.post("/students", data);
    return res.data;
  },

  async updateStudent(id, data) {
    const res = await api.put(`/students/${id}`, data);
    return res.data;
  },

  async deleteStudent(id) {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  },

  async updateStudentSkills(id, skills) {
    // skills: [{ skill_id: number, proficiency: string }]
    const res = await api.put(`/students/${id}/skills`, skills);
    return res.data;
  },

  async verifyCgpa(id) {
    const res = await api.patch(`/students/${id}/verify-cgpa`);
    return res.data;
  },

  async getStudentEligibleJobs(id) {
    const res = await api.get(`/students/${id}/eligible-jobs`);
    return res.data;
  },

  async getDepartments() {
    const res = await api.get("/departments");
    return res.data;
  },

  async getSkills() {
    const res = await api.get("/skills");
    return res.data;
  },

  getExportUrl(params = {}) {
    const base = api.defaults.baseURL || "http://localhost:8000/api/v1";
    const qs = new URLSearchParams(params).toString();
    return `${base}/students/export.csv${qs ? `?${qs}` : ""}`;
  },
};

export default studentsService;
