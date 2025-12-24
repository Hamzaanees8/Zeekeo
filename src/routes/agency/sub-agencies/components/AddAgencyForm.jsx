import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DropArrowIcon } from "../../../../components/Icons";
import { createSubAgency, updateSubAgency } from "../../../../services/agency";

const AddAgencyForm = ({ onClose, onSave, editData = null }) => {
    const isEditMode = Boolean(editData);
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        email: "",
        username: "",
        enabled: "true",
        role: "agency_admin",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editData) {
            setFormValues({
                email: editData.email || "",
                username: editData.username || "",
                enabled: editData.enabled ? "true" : "false",
                role: editData.role || "agency_admin",
            });
        }
    }, [editData]);

    const handleChange = e => {
        const { name, value } = e.target;
        // For username, only allow alphanumeric characters and underscores
        if (name === "username") {
            const sanitizedValue = value.replace(/[^a-zA-Z0-9_]/g, "");
            setFormValues(prev => ({ ...prev, [name]: sanitizedValue }));
        } else {
            setFormValues(prev => ({ ...prev, [name]: value }));
        }
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const errs = {};
        if (!formValues.email) errs.email = "Email is required";
        if (!formValues.username) {
            errs.username = "Username is required";
        } else if (!/^[a-zA-Z0-9_]+$/.test(formValues.username)) {
            errs.username = "Username can only contain letters, numbers, and underscores";
        }
        if (!formValues.enabled) errs.enabled = "Please select status";
        if (!formValues.role) errs.role = "Role is required";
        return errs;
    };

    const clearForm = () => {
        setFormValues({
            email: "",
            username: "",
            enabled: "true",
            role: "agency_admin",
        });
        setErrors({});
    };

    const handleSubmit = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);

            let payload;

            if (isEditMode) {
                payload = {
                    email: formValues.email,
                    enabled: formValues.enabled === "true" ? 1 : 0,
                };
            } else {
                payload = {
                    email: formValues.email,
                    username: formValues.username,
                    enabled: formValues.enabled === "true" ? 1 : 0,
                };
            }

            let res;
            if (isEditMode) {
                res = await updateSubAgency(formValues.username, payload);
                toast.success("Agency updated successfully");
            } else {
                res = await createSubAgency(payload);
                toast.success("Agency created successfully");
            }

            clearForm();
            if (onSave) onSave(res);
            onClose();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                (isEditMode ? "Failed to update agency." : "Failed to create agency.");
            if (err?.response?.status !== 401) {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="bg-white w-[455px] p-6 relative border border-[#7E7E7E] shadow-2xl rounded-[8px]">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[#6D6D6D] text-[30px] leading-none hover:text-black cursor-pointer"
                >
                    &times;
                </button>

                <h2 className="text-[20px] font-semibold text-[#04479C] mb-4">
                    {isEditMode ? "Edit Sub Agency" : "Create Sub Agency"}
                </h2>

                {/* Email */}
                <div className="mb-4">
                    <input
                        name="email"
                        type="email"
                        value={formValues.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full border border-[#7E7E7E] px-4 py-2 text-sm rounded-[6px] text-[#6D6D6D] focus:outline-none"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                </div>

                {/* Username */}
                <div className="mb-4">
                    <input
                        name="username"
                        value={formValues.username}
                        onChange={handleChange}
                        placeholder="Username"
                        disabled={isEditMode} // cannot change username on edit
                        className={`w-full border border-[#7E7E7E] px-4 py-2 text-sm rounded-[6px] text-[#6D6D6D] focus:outline-none ${isEditMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                            }`}
                    />
                    {!isEditMode && !errors.username && (
                        <p className="text-gray-400 text-xs mt-1">Only letters, numbers, and underscores allowed</p>
                    )}
                    {errors.username && (
                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                    )}
                </div>

                {/* Enabled */}
                <div className="relative mb-4">
                    <select
                        name="enabled"
                        value={formValues.enabled}
                        onChange={handleChange}
                        className="appearance-none w-full border border-[#7E7E7E] rounded-[6px] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none pr-10"
                    >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                    </select>
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
                        <DropArrowIcon />
                    </div>
                </div>

                {/* Role */}
                <div className="relative mb-6">
                    <select
                        name="role"
                        value={formValues.role}
                        onChange={handleChange}
                        className="appearance-none w-full border border-[#7E7E7E] rounded-[6px] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none pr-10"
                    >
                        <option value="agency_child">Sub Agency</option>
                        <option value="agency_admin">Agency Admin</option>
                    </select>
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
                        <DropArrowIcon />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        className="px-6 h-[36px] py-1 bg-[#7E7E7E] text-white"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={loading}
                        className={`px-6 h-[36px] py-1 text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0387FF]"
                            }`}
                        onClick={handleSubmit}
                    >
                        {loading
                            ? isEditMode
                                ? "Updating..."
                                : "Creating..."
                            : isEditMode
                                ? "Update Agency"
                                : "Create Agency"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAgencyForm;
