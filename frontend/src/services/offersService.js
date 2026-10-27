import api from "./api.js";

export const offersService = {
  async getOffers(params = {}) {
    const res = await api.get("/offers", { params });
    return res.data;
  },

  async getMyOffers() {
    const res = await api.get("/offers/mine");
    return res.data;
  },

  async updateBreakdown(offerId, data) {
    // data: { base_lpa, bonus_lpa, esop_lpa }
    const res = await api.patch(`/offers/${offerId}/breakdown`, data);
    return res.data;
  },

  async acceptOffer(offerId) {
    const res = await api.post(`/offers/${offerId}/accept`);
    return res.data;
  },

  async declineOffer(offerId) {
    const res = await api.post(`/offers/${offerId}/decline`);
    return res.data;
  },
};

export default offersService;
