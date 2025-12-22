import React, { useState, useEffect, useRef } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css"; // Import SunEditor styles
import { AttachFile, DropArrowIcon } from "../../../../components/Icons";
import toast from "react-hot-toast";
import {
  createTemplate,
  getAttachmentLinks,
  updateTemplate,
  uploadFileToSignedUrl,
} from "../../../../services/templates";
import {
  insertTextAtCursor,
  templateCategories,
  variableOptions,
} from "../../../../utils/template-helpers";
import PreviewMessage from "./PreviewMessage";

// SunEditor configuration
const sunEditorOptions = {
  mode: "classic",
  rtl: false,
  katex: "window.katex",
  videoFileInput: false,
  tabDisable: false,
  buttonList: [
    ["undo", "redo"],
    ["formatBlock"], // Headers
    ["bold", "underline", "italic", "strike"],
    ["list", "align"],
    ["link"],
    ["removeFormat"],
    ["fullScreen", "codeView"],
  ],
  minHeight: "200px",
  height: "auto",
};

const AddTemplateForm = ({ initialData, onClose, onSave, folders = [] }) => {
  const [loading, setLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  
  // Refs
  const textareaRef = useRef(null);
  const editorRef = useRef(null); // Ref to hold SunEditor instance

  const [formValues, setFormValues] = useState({
    name: "",
    category: "",
    folder: "",
    tags: "",
    subject: "",
    message: "",
  });
  const [attachments, setAttachments] = useState([]);
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
        template_id: initialData.template_id || null,
        attachments: initialData.attachments,
      });
    }
  }, [initialData]);

  // Capture the editor instance when it mounts
  const getSunEditorInstance = (sunEditor) => {
    editorRef.current = sunEditor;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handler for SunEditor change
  const handleEditorChange = (content) => {
    const cleanContent = content === '<p><br></p>' ? '' : content;
    setFormValues((prev) => ({ ...prev, message: cleanContent }));
    setErrors((prev) => ({ ...prev, message: "" }));
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
    
    // Validate message
    const isMessageEmpty = !formValues.message || formValues.message === "<p><br></p>";
    if (isMessageEmpty) errs.message = "Message is required";
    
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
    setAttachments([]);
    setErrors({});
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setShowProgress(true);
    setProgress(0);
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 300);

    const payload = {
      name: formValues.name,
      type: formValues.category,
      folder: formValues.folder,
      subject: formValues.subject,
      body: formValues.message,
    };

    try {
      setLoading(true);
      let savedTemplate;

      if (formValues.template_id) {
        const templateId = formValues.template_id;
        let uploadedFiles = [];

        if (attachments?.length > 0) {
          const signedUrls = await getAttachmentLinks(templateId, attachments);

          for (const file of Array.from(attachments)) {
            const signedUrl = signedUrls[file.name];
            if (!signedUrl) continue;
            uploadedFiles.push(file.name);
            try {
              await uploadFileToSignedUrl(file, signedUrl);
            } catch (err) {
              console.error("Upload failed for", file.name, err);
            }
          }
        }
        const finalPayload = {
          ...payload,
          attachments: [...(formValues.attachments || []), ...uploadedFiles],
        };

        savedTemplate = await updateTemplate(templateId, finalPayload);
        toast.success("Template updated successfully");
      } else {
        savedTemplate = await createTemplate(payload);
        const templateId = savedTemplate.template_id;

        if (attachments?.length > 0) {
          let uploadedFiles = [];
          const signedUrls = await getAttachmentLinks(templateId, attachments);

          for (const file of Array.from(attachments)) {
            const signedUrl = signedUrls[file.name];
            if (!signedUrl) continue;

            uploadedFiles.push(file.name);
            try {
              await uploadFileToSignedUrl(file, signedUrl);
            } catch (err) {
              console.error("Upload failed for", file.name, err);
            }
          }

          if (uploadedFiles.length > 0) {
            const finalPayload = {
              ...payload,
              attachments: uploadedFiles,
            };
            savedTemplate = await updateTemplate(templateId, finalPayload);
          }
        }

        toast.success("Template created successfully");
      }

      clearForm();
      if (onSave) onSave(savedTemplate);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save template.";
      if (err?.response?.status !== 401) {
        toast.error(msg);
      }
    } finally {
      clearInterval(progressTimer);
      setProgress(100);
      setTimeout(() => setShowProgress(false), 100);
      setLoading(false);
    }
  };

  const handleReplace = () => {
    setShowPopup(false);
    clearForm();
    alert("Template replaced successfully.");
  };

  const handleVariableInsert = (variable) => {
    if (formValues.category === 'email_message') {
      // Logic for SunEditor
      if (editorRef.current) {
        // insertHTML inserts at the current cursor position
        editorRef.current.insertHTML(variable);
      }
    } else {
      // Logic for Standard Textarea
      const updatedMessage = insertTextAtCursor({
        fieldRef: textareaRef,
        valueToInsert: variable,
        currentText: formValues.message,
      });
      setFormValues((prev) => ({ ...prev, message: updatedMessage }));
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 3;
    const maxSizeMB = 20;
    const newFiles = [];

    for (let file of files) {
      if (attachments.length + newFiles.length >= maxFiles) {
        toast.error(`You can upload up to ${maxFiles} attachments.`);
        break;
      }
      if (file.size / 1024 / 1024 > maxSizeMB) {
        toast.error(`${file.name} exceeds the 20MB limit.`);
        continue;
      }
      newFiles.push(file);
    }
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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
          className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white rounded-[6px] text-[#6D6D6D] focus:outline-none placeholder:text-[#6D6D6D] mb-4"
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
            className="appearance-none w-full border border-[#7E7E7E] rounded-[6px] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none pr-10"
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
            className="appearance-none w-full rounded-[6px] border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none pr-10"
          >
            <option value="">Folder</option>
            {folders.map((fold) => (
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
            className="w-full border rounded-[6px] border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none placeholder:text-[#6D6D6D] mb-4"
          />
          {errors.subject && (
            <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
          )}
        </div>
      )}

      {/* Message Area */}
      <div className="relative">
        {formValues.category === "email_message" ? (
          // SUN EDITOR
          <div className="w-full">
            <style>
              {`
                .sun-editor {
                  border: 1px solid #7E7E7E !important;
                  border-radius: 6px !important;
                  overflow: hidden;
                  font-family: inherit !important;
                }
                .sun-editor .se-toolbar {
                  background-color: #f9f9f9;
                  outline: none;
                }
                .sun-editor .se-wrapper .se-placeholder {
                   color: #6D6D6D !important;
                   font-family: inherit !important;
                   font-size: 0.875rem !important;
                }
                .sun-editor .se-wrapper .sun-editor-editable {
                   font-family: inherit !important;
                   font-size: 0.875rem !important;
                   color: #6D6D6D !important;
                }
              `}
            </style>
            <SunEditor
              getSunEditorInstance={getSunEditorInstance}
              setContents={formValues.message || ""}
              onChange={handleEditorChange}
              setOptions={sunEditorOptions}
              placeholder="Compose your email message here..."
              height="200px"
            />
          </div>
        ) : (
          // STANDARD TEXTAREA
          <textarea
            name="message"
            ref={textareaRef}
            value={formValues.message || ""}
            onChange={handleChange}
            placeholder="Message"
            rows={8}
            className="w-full border rounded-[6px] border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none resize-none placeholder:text-[#6D6D6D]"
          />
        )}
        
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message}</p>
        )}

        <div className="absolute bottom-4 right-2 group z-10">
          <label htmlFor="file-upload" className="cursor-pointer relative">
            <AttachFile className="w-5 h-5 fill-[#7E7E7E]" />
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileSelect}
          />

          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-2/3 w-[45vw] text-xs text-white bg-black p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            You can add up to 3 attachments on a template. The maximum size for
            an attachment is 20mb. Attachments can be used for LinkedIn Premium
            and Sales Navigator, the Recruiter platform is not supported
            currently.
          </div>
        </div>
      </div>

      <div className="w-full">
        {formValues.attachments?.length > 0 && (
          <div className="flex flex-col gap-2">
            {formValues.attachments.map((fileName, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border rounded px-3 py-1 bg-[#f9f9f9]"
              >
                <span className="text-sm text-[#6D6D6D]">{fileName}</span>
                <button
                  type="button"
                  className="text-red-500 text-sm cursor-pointer"
                  onClick={() => {
                    setFormValues((prev) => ({
                      ...prev,
                      attachments: prev.attachments.filter(
                        (_, i) => i !== idx
                      ),
                    }));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border rounded px-3 py-1 bg-[#f9f9f9]"
              >
                <span className="text-sm text-[#6D6D6D]">{file.name}</span>
                <button
                  type="button"
                  className="text-red-500 text-sm cursor-pointer"
                  onClick={() => removeAttachment(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insert Variables */}
      <div>
        <div className="text-[#6D6D6D] text-base font-medium mb-2">
          Insert Variables
        </div>
        <div className="flex flex-wrap gap-2">
          {variableOptions
            .filter((opt) => {
              if (formValues.category === "inbox") {
                return ![
                  "{{CUSTOM_FIELD_1}}",
                  "{{CUSTOM_FIELD_2}}",
                  "{{CUSTOM_FIELD_3}}",
                ].includes(opt.value);
              }
              return true;
            })
            .map((opt) => (
            <button
              key={opt.value}
              className="text-[16px] text-[#6D6D6D] border border-[#7E7E7E] bg-white px-3 rounded-[4px] cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleVariableInsert(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4">
        <div className="flex flex-col items-start">
          <button
            className="px-6 py-1 text-white bg-[#0387FF] text-base rounded-[6px] cursor-pointer"
            disabled={loading}
            onClick={() => setShowPreview(true)}
          >
            Preview
          </button>
        </div>
        <div className="flex flex-col items-end">
          <button
            disabled={loading}
            className={`px-6 py-1 text-white text-base rounded-[6px] cursor-pointer ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0387FF]"
            }`}
            onClick={handleSubmit}
          >
            {loading
              ? formValues.template_id
                ? "Saving..."
                : "Creating..."
              : formValues.template_id
              ? "Update Template"
              : "Create Template"}
          </button>
          {showProgress && (
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2 transition-all">
              <div
                className="h-2 bg-[#0387FF] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        {formValues.template_id ? (
          <button
            className="px-6 py-1 bg-[#7E7E7E] text-white text-base rounded-[6px] cursor-pointer"
            onClick={() => onClose()}
            disabled={loading}
          >
            Cancel
          </button>
        ) : null}
      </div>

      {showPreview && (
        <PreviewMessage
          open={showPreview}
          onClose={() => setShowPreview(false)}
          message={formValues.message}
          subject={formValues.subject}
          category={formValues.category}
        />
      )}

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white w-[455px] p-6 relative border border-[#7E7E7E] shadow-2xl rounded-[8px]">
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
                className="px-4 py-2 text-white bg-[#7E7E7E] text-sm rounded-[4px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReplace}
                className="px-4 py-2 text-white bg-[#0387FF] text-sm rounded-[4px] cursor-pointer"
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