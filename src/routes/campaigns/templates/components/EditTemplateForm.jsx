import React, { useState, useEffect } from "react";
import { DropArrowIcon } from "../../../../components/Icons";

const variableTags = [
  "First Name",
  "Last Name",
  "Full Name",
  "Title",
  "Industry",
  "Tenure at Position",
  "Title Start Date",
  "Company Name",
  "Mutual Connections",
  "Custom Field 1",
  "Custom Field 2",
  "Custom Field 3",
  "Group Name",
];

const EditTemplateForm = ({ initialData, onCancel, onSave }) => {
  const [formValues, setFormValues] = useState(initialData);

  useEffect(() => {
    setFormValues(initialData);
  }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className=" mt-4  w-full">
      <input
        name="title"
        value={formValues.title}
        onChange={handleChange}
        placeholder="Title"
        className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] mb-4 rounded-[4px]"
      />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="relative h-fit">
          <select
            name="category"
            value={formValues.category}
            onChange={handleChange}
            className="appearance-none w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] pr-10 rounded-[4px]"
          >
            <option value="">Category</option>
            {["Invite", "Sequence Message", "InMail", "Email Sequence"].map(
              cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ),
            )}
          </select>
          <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
            <DropArrowIcon />
          </div>
        </div>

        <div className="relative h-fit">
          <select
            name="folder"
            value={formValues.folder}
            onChange={handleChange}
            className="appearance-none w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] pr-10 rounded-[4px]"
          >
            <option value="">Folder</option>
            {["Folder 1", "Folder 2", "Folder 3"].map(fold => (
              <option key={fold} value={fold}>
                {fold}
              </option>
            ))}
          </select>
          <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
            <DropArrowIcon />
          </div>
        </div>

        <div>
          <input
            name="tags"
            value={formValues.tags}
            onChange={handleChange}
            placeholder="Add Tags with #"
            className="border w-full border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] rounded-[4px]"
          />
          <div className="text-xs text-[#7E7E7E] mt-1">#invite #GDS</div>
        </div>
      </div>

      <textarea
        name="message"
        value={formValues.message}
        onChange={handleChange}
        placeholder="Message"
        rows={6}
        className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] resize-none"
      />

      <div className="mt-4">
        <div className="text-[#6D6D6D] text-base font-medium mb-2">
          Insert Variables
        </div>
        <div className="flex flex-wrap gap-2">
          {variableTags.map(tag => (
            <button
              key={tag}
              type="button"
              className="px-3 py-1 border border-[#7E7E7E] text-sm text-[#6D6D6D] bg-white cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          className="px-6 py-1 bg-[#7E7E7E] text-white text-sm cursor-pointer"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-6 py-1 bg-[#0387FF] text-white text-sm cursor-pointer"
          onClick={() => onSave(formValues)}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditTemplateForm;
