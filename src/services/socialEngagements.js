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

export const uploadAttachmentToS3 = async (file, onProgress) => {
    // Get signed URL from API
    const filename = file.name;
    const type = file.type.startsWith('image/') ? 'image' : 'video';

    const response = await api.post("/users/posts/attachments", {
        files: [filename]
    });

    const signedUrl = response.signedUrls[filename];

    // Upload file to S3 with progress tracking using XMLHttpRequest
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const percentage = Math.round((e.loaded / e.total) * 100);
                onProgress(percentage);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                resolve({ filename, type });
            } else {
                reject(new Error('Upload failed'));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
        });

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
    });
};