import React, { useState, useEffect, useRef } from "react";
import { DropArrowIcon } from "../../../../components/Icons";
import toast from "react-hot-toast";
import {
  createTemplate,
  updateTemplate,
} from "../../../../services/templates";
import {
  insertTextAtCursor,
  templateCategories,
  variableOptions,
} from "../../../../utils/template-helpers";

const AddTemplateForm = ({ initialData, onClose, onSave, folders = [] }) => {
  const textareaRef = useRef(null);
  const [formValues, setFormValues] = useState({
    name: "",
    category: "",
    folder: "",
    tags: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormValues({
        name: initialData.name || "",
        category: initialData.category || initialData.type || "",
        folder: initialData.folder || "",
        tags: initialData.tags || "",
        subject: initialData.subject || "",
        message: initialData.body || "",
        template_id: initialData.template_id || null, // for updates
      });
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" })); // Clear error
  };

  const validate = () => {
    const errs = {};
    if (!formValues.name) errs.name = "Title is required";
    if (!formValues.category) errs.category = "Category is required";
    if (
      (formValues.category === "linkedin_inmail" ||
        formValues.category === "email_message") &&
      !formValues.subject
    ) {
      errs.subject = "Subject is required";
    }
    if (!formValues.message) errs.message = "Message is required";
    return errs;
  };

  const clearForm = () => {
    setFormValues({
      name: "",
      category: "",
      folder: "",
      tags: "",
      subject: "",
      message: "",
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      name: formValues.name,
      type: formValues.category,
      folder: formValues.folder,
      subject: formValues.subject,
      body: formValues.message,
    };

    try {
      let savedTemplate;

      if (formValues.template_id) {
        //console.log(formValues)
        savedTemplate = await updateTemplate(formValues.template_id, payload);
        toast.success("Template updated successfully");
      } else {
        savedTemplate = await createTemplate(payload);
        toast.success("Template created successfully");
      }

      clearForm();
      if (onSave) onSave(savedTemplate);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save template.";
      toast.error(msg);
    }
  };

  const handleReplace = () => {
    // Replace logic here...
    setShowPopup(false);
    clearForm();
    alert("Template replaced successfully."); // placeholder
  };

  const handleVariableInsert = (variable, fieldRef, fieldVal) => {
    const updatedMessage = insertTextAtCursor({
      fieldRef,
      valueToInsert: variable,
      currentText: fieldVal,
    });
    setFormValues(prev => ({ ...prev, message: updatedMessage }));
  };

  return (
    <div className="w-full p-0 flex flex-col gap-6 relative">
      {/* Title */}
      <div>
        <input
          name="name"
          value={formValues.name || ""}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none placeholder:text-[#6D6D6D] mb-4"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Category, Folder, Tags */}
      <div className="grid grid-cols-3 gap-4">
        {/* Category */}

        <div className="relative w-full h-fit">
          <select
            name="category"
            value={formValues.category || ""}
            onChange={handleChange}
            className="appearance-none w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none pr-10"
            disabled={formValues?.template_id != null}
          >
            <option value="">Category</option>
            {Object.entries(templateCategories).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {formValues?.template_id == null && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
              <DropArrowIcon />
            </div>
          )}
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        {/* Folder */}
        <div className="relative w-full h-fit">
          <select
            name="folder"
            value={formValues.folder || ""}
            onChange={handleChange}
            className="appearance-none w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none pr-10"
          >
            <option value="">Folder</option>
            {folders.map(fold => (
              <option key={fold} value={fold}>
                {fold}
              </option>
            ))}
          </select>
          <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
            <DropArrowIcon />
          </div>
          {errors.folder && (
            <p className="text-red-500 text-xs mt-1">{errors.folder}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      {(formValues.category === "linkedin_inmail" ||
        formValues.category === "email_message") && (
        <div>
          <input
            name="subject"
            value={formValues.subject || ""}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none placeholder:text-[#6D6D6D] mb-4"
          />
          {errors.subject && (
            <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
          )}
        </div>
      )}

      {/* Message */}
      <div>
        <textarea
          name="message"
          ref={textareaRef}
          value={formValues.message || ""}
          onChange={handleChange}
          placeholder="Message"
          rows={8}
          className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none resize-none placeholder:text-[#6D6D6D]"
        />
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message}</p>
        )}
      </div>

      {/* Insert Variables */}
      <div>
        <div className="text-[#6D6D6D] text-base font-medium mb-2">
          Insert Variables
        </div>
        <div className="flex flex-wrap gap-2">
          {variableOptions.map(opt => (
            <button
              key={opt.value}
              className="text-[16px] text-[#6D6D6D] border border-[#7E7E7E] bg-white px-3 "
              onClick={() =>
                handleVariableInsert(
                  opt.value,
                  textareaRef,
                  formValues.message,
                )
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          className="px-6 py-1 bg-[#0387FF] text-white text-base"
          onClick={handleSubmit}
        >
          {formValues.template_id ? "Update Template" : "Create Template"}
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white w-[455px] p-6 relative border border-[#7E7E7E] shadow-2xl">
            {/* Cross Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 text-[#6D6D6D] text-[30px] leading-none hover:text-black cursor-pointer"
            >
              &times;
            </button>

            <h2 className="text-[20px] font-semibold text-urbanist text-[#04479C] mb-2">
              Add to Folder
            </h2>
            <p className="text-[#7E7E7E] text-urbanist  mb-6">
              Folder 1 already has an InMail message attached. Would you like
              to replace that message?
            </p>
            <div className="flex justify-between gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 text-white bg-[#7E7E7E] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReplace}
                className="px-4 py-2 text-white bg-[#0387FF] text-sm"
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTemplateForm;
