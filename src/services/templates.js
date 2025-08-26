import { api } from "./api";

export const getTemplates = async () => {
    const response = await api.get("/users/templates");
    return response.templates;
};

export const createTemplate = async (data) => {
    const response = await api.post("/users/templates", {
        template: {
            ...data
        }
    });
    return response.template;
};

export const updateTemplate = async (templateId, data) => {
    const response = await api.put(`/users/templates`, {
        templateId: templateId,
        updates: {
            name: data.name,
            subject: data.subject,
            body: data.body,
            folder: data.folder
        }
    });
    return response.template;
};

export const updateTemplates = async (templateIds, updates) => {
    try {
        await Promise.all(
            templateIds.map((templateId) =>
                api.put("/users/templates", {
                    templateId,
                    updates
                })
            )
        );
    } catch (error) {
        console.error("Failed to update templates:", error);
        throw error;
    }
};


export const deleteTemplate = async (templateId) => {
    const response = await api.delete("/users/templates", {
        data: {
            templateId,
        },
    });

    return response;
};

export const deleteTemplates = async (templateIds) => {
    try {
        await Promise.all(
            templateIds.map((templateId) => api.delete("/users/templates", {
                data: {
                    templateId,
                }
            }))
        );
    } catch (error) {
        console.error("Failed to delete templates:", error);
    }
};