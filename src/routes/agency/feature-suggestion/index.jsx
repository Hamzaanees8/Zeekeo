import { useRef, useState } from "react";
import {
  ArrowIcon,
  AttachmentIcon,
  CommentIcon,
  Cross,
  DownloadIcon,
  DropArrowIcon,
  FilterIcon,
  StepReview,
} from "../../../components/Icons";
const data = [
  {
    id: 1,
    title: "Improved Search Functionality",
    description:
      "Enhance the search bar to support natural language queries and provide instant, relevant suggestions as the user types.",
    status: "Featured",
    comments: 1,
  },
  {
    id: 2,
    title: "Add Dark Mode Option",
    description:
      "Introduce a system-wide dark mode to reduce eye strain and improve accessibility for users in low-light environments.",
    status: "Trending",
    comments: 1,
  },
  {
    id: 3,
    title: "Integrate with Calendar Apps",
    description:
      "Allow users to sync their tasks and deadlines with popular calendar applications like Google Calendar and Outlook.",
    status: "Most Liked",
    comments: 2,
  },
  {
    id: 4,
    title: "Enable Custom User Tags",
    description:
      "Give users the ability to create and manage custom tags for better organization of their content.",
    status: "New",
    comments: 4,
  },
  {
    id: 5,
    title: "Mobile App Notifications",
    description:
      "Develop a dedicated mobile app to provide push notifications for important updates and user interactions.",
    status: "Pending",
    comments: 1,
  },
];
const FeatureSuggestion = () => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [filter, setFilter] = useState("Trending");
  const options = ["Trending", "Popular", "Latest", "Most Liked"];
  const [attachments, setAttachments] = useState([]);
  const [open, setOpen] = useState(false);

  const handleSelect = opt => {
    setFilter(opt);
    setOpen(false);
  };
  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setAttachments(prev => [...prev, ...files]);
  };

  const removeFile = index => {
    setAttachments(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };
  const handleInput = e => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };
  return (
    <div className="flex flex-col gap-y-[56px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-[#6D6D6D] text-[44px] font-[300]">
          Feature Suggestion
        </h1>
        <div className="flex items-center gap-x-2">
          <div className="relative w-[225px] h-[40px]">
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full border border-[#7E7E7E] text-base h-[40px] rounded-[6px] text-[#7E7E7E] font-medium pl-3 pr-3 bg-white focus:outline-none"
            />
          </div>
          <button className="w-10 h-10 border rounded-full flex items-center justify-center bg-white !p-0 cursor-pointer">
            <DownloadIcon className="w-5 h-5 text-[#4D4D4D]" />
          </button>
          <button className="w-10 h-10 border border-grey-400 rounded-full flex items-center cursor-pointer justify-center bg-white">
            <FilterIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-y-[20px] px-[64px]">
        <div className="flex flex-col gap-y-[20px]">
          <p className="text-[#1E1E1E] font-semibold text-[16px]">
            Feature requests
          </p>
          <div className="flex flex-col border border-[#CCCCCC] rounded-[6px]">
            <div className="flex flex-col gap-y-[12px] border-b border-[#CCCCCC] p-4">
              <input
                type="text"
                placeholder="Short, descriptive title"
                className="outline-none focus:outline-none placeholder:text-[#5E5E5E] placeholder:font-medium placeholder:text-[16px] w-full text-[16px] font-semibold text-[#454545]"
              />

              <p className="text-[#1E1E1E] font-semibold text-[14px]">
                Details
              </p>

              <textarea
                ref={textareaRef}
                onInput={handleInput}
                placeholder="Any additional details..."
                className="min-h-[100px] outline-none focus:outline-none placeholder:text-[#5E5E5E] placeholder:font-normal placeholder:text-[14px] w-full font-normal text-[14px] text-[#454545]"
              />
              {attachments.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {attachments.map((att, index) => (
                    <div
                      key={index}
                      className="flex flex-col justify-center items-center w-[300px] h-[200px] gap-3 relative"
                    >
                      {att.file.type.startsWith("image/") ? (
                        <img
                          src={att.preview}
                          alt="preview"
                          className="w-[300px] h-[200px] object-cover rounded-md border"
                        />
                      ) : (
                        <span className="text-[13px] text-[#555]">
                          {att.file.name}
                        </span>
                      )}

                      <span className="flex-1 truncate text-[14px] text-[#333]">
                        {att.file.name}
                      </span>

                      <div
                        className="absolute top-1 right-[5px] text-[#333] cursor-pointer"
                        onClick={() => removeFile(index)}
                      >
                        <Cross />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end bg-[#ECECEC] rounded-[6px] py-3 px-4 gap-x-2.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <div
                onClick={handleAttachmentClick}
                className="flex items-center justify-center bg-[#EFEFEF] rounded-[6px] w-[40px] h-[40px] cursor-pointer border border-[#6D6D6D]"
              >
                <AttachmentIcon />
              </div>
              <button className="bg-[#EFEFEF] text-[#6D6D6D] rounded-[6px] w-[120px] h-[40px] cursor-pointer border border-[#6D6D6D]">
                Cancel
              </button>
              <button className="bg-[#37b4b7] text-white rounded-[6px] w-[140px] h-[40px] cursor-pointer">
                Add Feature
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col border border-[#CCCCCC] rounded-[6px]">
          <div className="flex justify-between items-center bg-[#ECECEC] rounded-[6px] py-3 px-4 gap-x-2.5">
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-medium text-[#6D6D6D]">Showing</p>
              <div className="border-b border-[#CCCCCC] pb-1 relative inline-block w-full">
                <button
                  onClick={() => setOpen(!open)}
                  className="w-full flex justify-between items-center outline-none text-[16px] text-[#454545] font-semibold cursor-pointer"
                >
                  {filter}
                  <DropArrowIcon className="h-[14px] w-[12px] ml-2" />
                </button>

                {/* Dropdown */}
                {open && (
                  <ul className="absolute left-0 mt-1 bg-white border border-[#7E7E7E] rounded-md shadow-md z-10 w-[150px] overflow-hidden">
                    {options.map(opt => (
                      <li
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        className="px-3 py-1.5 text-[14px] text-[#454545] font-normal hover:bg-gray-100 cursor-pointer"
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="text-[16px] font-medium text-[#6D6D6D]">Post</p>
            </div>
            <div className="relative w-[300px] h-[40px]">
              <input
                type="text"
                placeholder="Search"
                className="w-full border border-[#CCCCCC] rounded-[6px] text-base h-[40px] text-[#6D6D6D] font-medium pl-8 pr-3 bg-[#EFEFEF] focus:outline-none"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <StepReview className="w-5 h-5 fill-[#6D6D6D]" />
              </span>
            </div>
          </div>
          <div className="border-t border-[#CCCCCC]">
            <div className="">
              {data.map(item => (
                <div key={item.id} className="border-t border-[#CCCCCC]">
                  <div className="flex flex-col gap-y-[12px] p-4">
                    <div className="">
                      <p className="text-[#1E1E1E] font-semibold text-[14px]">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between gap-x-[20px]">
                        <p className="font-normal text-[14px] text-[#454545]">
                          {item.description}
                        </p>
                        <div className="flex flex-col gap-y-1 py-1 px-3 border border-[#CCCCCC] rounded-[6px]">
                          <ArrowIcon />
                          <p className="text-[12px] text-[#454545] text-center">
                            1
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-[10px]">
                      <CommentIcon />
                      <p className="text-[12px] text-[#454545]">
                        {item.comments}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSuggestion;
