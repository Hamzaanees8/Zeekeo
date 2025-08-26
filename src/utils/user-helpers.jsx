export const getCurrentUser = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return null;

    try {
        return JSON.parse(userInfo);
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        return null;
    }
}

export const getUserFolders = () => {
    const user = getCurrentUser();
    if (!user || typeof user !== "object") {
        return [];
    }

    return Array.isArray(user.template_folders)
        ? user.template_folders
        : [];
};


export const getUserLabels = () => {
    const user = getCurrentUser();
    if (!user || typeof user !== "object") {
        return [];
    }

    return Array.isArray(user.labels)
        ? user.labels
        : [];
};
