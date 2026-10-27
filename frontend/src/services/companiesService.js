import api from "./api.js";

export const companiesService = {
  async getCompanies(params = {}) {
    const res = await api.get("/companies", { params });
    return res.data;
  },

  async getCompanyById(id) {
    const res = await api.get(`/companies/${id}`);
    return res.data;
  },

  async createCompany(data) {
    const res = await api.post("/companies", data);
    return res.data;
  },

  async updateCompany(id, data) {
    const res = await api.put(`/companies/${id}`, data);
    return res.data;
  },

  async deleteCompany(id) {
    const res = await api.delete(`/companies/${id}`);
    return res.data;
  },

  async getContacts(companyId) {
    const res = await api.get(`/companies/${companyId}/contacts`);
    return res.data;
  },

  async createContact(companyId, data) {
    const res = await api.post(`/companies/${companyId}/contacts`, data);
    return res.data;
  },

  async updateContact(companyId, contactId, data) {
    const res = await api.put(`/companies/${companyId}/contacts/${contactId}`, data);
    return res.data;
  },

  async deleteContact(companyId, contactId) {
    const res = await api.delete(`/companies/${companyId}/contacts/${contactId}`);
    return res.data;
  },

  async getHistory(companyId) {
    const res = await api.get(`/companies/${companyId}/history`);
    return res.data;
  },
};

export default companiesService;
