import React, { useState } from "react";

const FolderForm = () => {
  const [formValues, setFormValues] = useState({
    title: "",
    tags: "",
    message: "",
  });

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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  return (
    <div className="w-full space-y-4">
      <input
        name="title"
        value={formValues.title}
        onChange={handleChange}
        placeholder="Title"
        className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] mb-4"
      />

      <input
        name="tags"
        value={formValues.tags}
        onChange={handleChange}
        placeholder="Add Tags with #"
        className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] mb-4"
      />

      <textarea
        name="message"
        value={formValues.message}
        onChange={handleChange}
        placeholder="Message"
        rows={6}
        className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] resize-none"
      />
      <div className="flex justify-end items-center">
        <button className="px-3 py-1  text-white bg-[#25C396] cursor-pointer">
          Generate Using AI
        </button>
      </div>

      {/* Variables */}
      <div>
        <div className="text-[#6D6D6D] text-base font-medium mb-2">
          Insert Variables
        </div>
        <div className="flex flex-wrap gap-2">
          {variableTags.map(tag => (
            <button
              key={tag}
              type="button"
              className="px-3 py-1 border border-[#7E7E7E] text-sm text-[#6D6D6D] bg-white rounded"
              onClick={() =>
                setFormValues(prev => ({
                  ...prev,
                  message: prev.message + " " + tag,
                }))
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FolderForm;
