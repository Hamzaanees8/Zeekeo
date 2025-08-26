import { api } from "./api";

export const getEngagements = async () => {
    const response = await api.get("/users/posts");
    return response.posts;
};

export const getEngagement = async postId => {
    const response = await api.get(`/users/posts?postId=${postId}`);
    return response.posts?.[0] || null;
};

export const createEngagement = async (data) => {
    const response = await api.post("/users/posts", {
        post: {
            ...data
        }
    });
    return response.post;
};

export const updateEngagement = async (data, postId) => {
    const response = await api.put(`/users/posts`, {
        postId: postId,
        updates: {
            ...data
        }
    });
    return response.post;
};

export const deleteEngagement = async (postId) => {
    const response = await api.delete("/users/posts", {
        data: {
            postId,
        },
    });

    return response;
};

export const deleteEngagements = async (postIds) => {
    try {
        await Promise.all(
            postIds.map((postId) => api.delete("/users/posts", {
                data: {
                    postId,
                }
            }))
        );
    } catch (error) {
        console.error("Failed to delete templates:", error);
    }
};