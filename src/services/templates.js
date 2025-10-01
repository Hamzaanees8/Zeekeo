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
            folder: data.folder,
            attachments: data.attachments
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

export const getAttachmentLinks = async (templateId, files) => {
    const response = await api.post(`/users/templates/attachments`, {
        templateId,
        files: files.map(f => f.name),
    });
    return response.signedUrls;
};

export const uploadFileToSignedUrl = async (file, signedUrl) => {
    const res = await fetch(signedUrl, {
        method: "PUT",
        headers: {
            "Content-Type": file.type,
        },
        body: file,
    });

    if (!res.ok) {
        throw new Error(`Failed to upload ${file.name}, status: ${res.status}`);
    }

    return res;
};

