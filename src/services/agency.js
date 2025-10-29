import { api } from "./api";

export const loginAsAgencyUser = async email => {
    const response = await api.post("/agency/login-as", { email });
    return response;
};

export const getAgencyUsers = async (params = {}) => {
    const response = await api.get("/agency/users", { params });
    return response;
};

export const updateAgencyUser = async (email, updates) => {
    const response = await api.put("/agency/users", { email, updates });
    return response;
};

export const getAgencyLogs = async (startDate, endDate, agencyUsername) => {
    const response = await api.get("/admin/agencies/logs", {
        params: { startDate, endDate, agencyUsername },
    });
    return response;
};

export const getSubAgencies = async (params = {}) => {
    const response = await api.get("/agency/sub-agencies", { params });
    return response;
};