import { useEffect, useRef, useState } from "react";
import SideBar from "../../components/SideBar";
import {
  ArchiveIcon,
  Cross,
  DropArrowIcon,
  FilterIcon,
  StepReview,
} from "../../components/Icons";
import Table from "./components/Table";
import {
  createEngagement,
  deleteEngagement,
  getEngagement,
  getEngagements,
  updateEngagement,
  uploadAttachmentToS3,
} from "../../services/socialEngagements";
import toast from "react-hot-toast";

const SocialEngagements = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [title, setTitle] = useState(null);
  const [selectedCommentOption, setSelectedCommentOption] = useState(null);
  const [isShowDropdown1, setIsShowDropdown1] = useState(false);
  const [isShowDropdown2, setIsShowDropdown2] = useState(false);
  const [isShowDropdown3, setIsShowDropdown3] = useState(false);
  const [isShowDropdown4, setIsShowDropdown4] = useState(false);
  const [postId, setPostId] = useState("");
  const [postDelId, setPostDelId] = useState("");
  const [postsData, setPostsData] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [errors, setErrors] = useState({});
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const dropdownRef = useRef(null);
  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);
  const dropdownRef3 = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  console.log("selectedOption", selectedOption);

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsShowDropdown1(false);
      }
      if (dropdownRef1.current && !dropdownRef1.current.contains(e.target)) {
        setIsShowDropdown2(false);
      }
      if (dropdownRef2.current && !dropdownRef2.current.contains(e.target)) {
        setIsShowDropdown3(false);
      }
      if (dropdownRef3.current && !dropdownRef3.current.contains(e.target)) {
        setIsShowDropdown4(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchPersona = async () => {
      try {
        const data = await getEngagements();

        if (data) {
          setPostsData(data);
        }
      } catch (error) {
        console.error("Failed to fetch persona:", error);
      }
    };

    fetchPersona();
  }, []);

  useEffect(() => {
    if (postId) {
      const selectedPost = postsData.find(post => {
        return post.post_id == postId;
      });

      setTitle(selectedPost?.text);
    }
  }, [postId]);

  // Reset comment option if it becomes invalid when visibility changes
  useEffect(() => {
    if (
      selectedTarget === "Connections only" &&
      selectedCommentOption === "All"
    ) {
      setSelectedCommentOption(null);
    }
  }, [selectedTarget, selectedCommentOption]);

  // Initialize schedule date with today's date and next available time when scheduling is enabled
  useEffect(() => {
    if (enabled && !scheduleDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      // Calculate next available 15-minute interval (skip the immediate next one)
      const currentMinutes = now.getMinutes();
      const nextInterval = Math.ceil(currentMinutes / 15) * 15;
      let nextHours = now.getHours();
      let nextMinutes = nextInterval + 15; // Add 15 minutes to skip the next interval

      if (nextMinutes >= 60) {
        nextHours = now.getHours() + Math.floor(nextMinutes / 60);
        nextMinutes = nextMinutes % 60;
      }

      const timeStr = `${nextHours.toString().padStart(2, "0")}:${nextMinutes
        .toString()
        .padStart(2, "0")}`;
      setScheduleDate(`${todayStr}T${timeStr}`);
    }
  }, [enabled]);

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = "";
  };

  const validate = () => {
    let newErrors = {};

    if (!title || !title.trim()) {
      newErrors.text = "Post text is required";
    }

    if (!selectedTarget) {
      newErrors.visibility = "Visibility is required";
    }

    if (!selectedCommentOption) {
      newErrors.comment = "Comment permission is required";
    }

    setErrors(newErrors);

    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      toast.error(newErrors[firstErrorKey]);
      return false;
    }
    return true;
  };

  const handleEditEngagement = async () => {
    if (!validate()) return;

    const engagementData = {
      text: title,
      attachments: ["file1.png"],
      external_link: "https://example.com",
    };
    try {
      const updatedPost = await updateEngagement(engagementData, postId);

      setPostsData(prevPosts => {
        const filtered = prevPosts.filter(post => post.post_id !== postId);
        return [...filtered, updatedPost];
      });
      setTitle("");
      setPostId("");
      toast.success("Engagement saved successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving engagement:", error);
      toast.error("Failed to save engagement.");
    }
  };

  const handleSaveEngagement = async () => {
    if (!validate()) return;

    setIsCreating(true);

    try {
      // Map visibility label to API value
      const visibilityMap = {
        Anyone: "ANYONE",
        "Connections only": "CONNECTIONS_ONLY",
      };

      // Map comment option label to API value
      const commentMap = {
        All: "ALL",
        "Connections only": "CONNECTIONS_ONLY",
        None: "NONE",
      };

      const engagementData = {
        text: title,
        type: selectedOption?.toLowerCase() || "post", // Future-proof: supports "post", "event", "celebration", etc.
        visibility: visibilityMap[selectedTarget] || "ANYONE",
        allowed_commenters_scope: commentMap[selectedCommentOption] || "ALL",
      };

      // Upload attachment if present
      if (attachedFile) {
        try {
          setIsUploading(true);
          setUploadProgress(0);

          const { filename } = await uploadAttachmentToS3(
            attachedFile,
            progress => {
              setUploadProgress(progress);
            },
          );

          setIsUploading(false);
          engagementData.attachments = [filename]; // Backend gets size/type from S3
        } catch (error) {
          console.error("Error uploading attachment:", error);
          setIsUploading(false);
          setIsCreating(false);
          toast.error("Failed to upload attachment");
          return; // Stop post creation if upload fails
        }
      }

      // Add scheduled_at if scheduling is enabled
      if (enabled && scheduleDate) {
        // Convert YYYY-MM-DDTHH:MM to timestamp in milliseconds
        const scheduledTimestamp = new Date(scheduleDate).getTime();
        engagementData.scheduled_at = scheduledTimestamp;
      }

      const newPost = await createEngagement(engagementData);
      setPostsData(prevPosts => {
        return [...prevPosts, newPost];
      });
      setTitle("");
      setSelectedTarget(null);
      setSelectedCommentOption(null);
      setEnabled(false);
      setScheduleDate("");
      setAttachedFile(null);
      setUploadProgress(0);
      toast.success("Engagement created successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving engagement:", error);
      toast.error("Failed to save engagement.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEngagement = async postId => {
    try {
      await deleteEngagement(postId);
      toast.success("Engagement deleted successfully");
      setPostsData(prev => prev.filter(post => post.post_id !== postId));
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete engagement");
    }
  };
  return (
    <div className="flex bg-[#EFEFEF]">
      <SideBar />
      <div className="w-full flex flex-col gap-y-[45px] py-[67px] px-[30px] font-urbanist">
        <h1 className="font-medium text-[#6D6D6D] text-[48px] ">
          Social Engagements
        </h1>
        <div className="flex justify-between items-center w-full">
          <div className="relative w-[390px] py-[7.5] h-[35px]">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
            </span>
            <input
              type="text"
              placeholder="Search"
              //   value={searchTerm}
              //   onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-[#7E7E7E] text-base h-[35px] text-[#7E7E7E]  font-medium pl-8 pr-3  bg-white focus:outline-none rounded-[4px]"
            />
          </div>
          <div className=" flex items-center justify-between gap-x-2">
            <FilterIcon className="w-5 h-5 cursor-pointer pr-1" />
            <div className="relative h-[35px] ">
              <select
                name="type"
                className="appearance-none cursor-pointer h-[35px] border border-[#7E7E7E] px-5  text-base font-medium bg-white text-[#7E7E7E] focus:outline-none pr-10 leading-6 rounded-[4px]"
              >
                <option value="">Type</option>
                <option value="">Type 1</option>
                <option value="">Type 2</option>
              </select>
              <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none ">
                <DropArrowIcon className="h-[14px] w-[12px]" />
              </div>
            </div>
            <div className="relative cursor-pointer h-[35px] gap-x-2.5 flex items-center justify-between  border border-[#7E7E7E] px-3.5 py-2 text-base font-medium bg-white text-[#7E7E7E] rounded-[4px]">
              <ArchiveIcon className="stroke-[#7E7E7E]" />
              <p>Go to Archive</p>
            </div>
          </div>
          <div className="relative inline-block">
            <div
              className="cursor-pointer h-[35px] gap-x-2.5 flex items-center justify-between border border-[#7E7E7E] px-3.5 py-2 text-base font-medium bg-white text-[#7E7E7E] rounded-[4px]"
              onClick={() => {
                setIsShowDropdown1(prev => !prev);
                setTitle("");
              }}
            >
              <p>
                <span className="text-[20px]">+</span> Create Engagement
              </p>
            </div>

            {isShowDropdown1 && (
              <div
                ref={dropdownRef}
                className="w-full absolute left-0 bg-white text-[#7E7E7E] text-base font-medium border border-[#7E7E7E] z-50"
              >
                {[
                  "Post",
                  // "Events and Webinars",
                  // "Celebrations",
                  // "Create a Poll",
                  // "Find an Expert",
                  // "Offer Help",
                ].map(option => (
                  <div
                    key={option}
                    className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedOption(option);
                      setIsShowDropdown1(false);
                      setIsModalOpen(true);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3">
          <Table
            data={postsData}
            setPostId={setPostId}
            setPostDelId={setPostDelId}
            handleDeleteEngagement={handleDeleteEngagement}
            open={() => {
              setSelectedOption("Post");
              setIsShowDropdown1(false);
              setIsModalOpen(true);
            }}
          />
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 ">
            <div className="flex flex-col max-h-[85vh] overflow-y-auto gap-y-5 bg-white px-7 pt-[15px] pb-7 w-[460px] border border-[#7E7E7E] rounded-[6px]">
              <div className="flex items-center justify-between">
                <h1 className="text-[#04479C] text-[20px] font-[600]">
                  Create Engagement
                </h1>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsShowDropdown2(false);
                  }}
                >
                  <Cross />
                </div>
              </div>
              <div className="relative h-[35px] w-[270px]">
                <div
                  className="appearance-none cursor-pointer h-[35px] border border-[#7E7E7E] px-3 py-1.5 text-base font-medium bg-white text-[#7E7E7E] focus:outline-none flex items-center justify-between rounded-[4px]"
                  onClick={() => setIsShowDropdown2(prev => !prev)}
                >
                  {selectedOption || "Select Engagement Type"}
                  <div className="pointer-events-none">
                    <DropArrowIcon className="h-[14px] w-[12px]" />
                  </div>
                </div>

                {isShowDropdown2 && (
                  <div
                    className="absolute left-0 w-[270px] bg-white text-[#7E7E7E] text-base font-medium border border-[#7E7E7E] z-50 "
                    ref={dropdownRef1}
                  >
                    {[
                      "Post",
                      // "Events and Webinars",
                      // "Celebrations",
                      // "Create a Poll",
                      // "Find an Expert",
                      // "Offer Help",
                    ].map(option => (
                      <div
                        key={option}
                        className={`px-3 py-1.5 text-[#7E7E7E] text-base font-medium cursor-pointer hover:bg-gray-100 ${
                          selectedOption === option
                            ? "bg-gray-100 font-semibold"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedOption(option);
                          setIsShowDropdown2(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative h-[35px] w-full">
                <div
                  className="appearance-none cursor-pointer h-[35px] border border-[#7E7E7E] px-3 py-1.5 text-base font-medium bg-white text-[#7E7E7E] focus:outline-none flex items-center justify-between rounded-[4px]"
                  onClick={() => setIsShowDropdown3(prev => !prev)}
                >
                  {selectedTarget || "Visibility"}
                  <div className="pointer-events-none">
                    <DropArrowIcon className="h-[14px] w-[12px]" />
                  </div>
                </div>

                {isShowDropdown3 && (
                  <div
                    className="absolute left-0 w-full bg-white text-[#7E7E7E] text-base font-medium border border-[#7E7E7E] z-50"
                    ref={dropdownRef2}
                  >
                    {[
                      { label: "Anyone", value: "ANYONE" },
                      { label: "Connections only", value: "CONNECTIONS_ONLY" },
                    ].map(option => (
                      <div
                        key={option.value}
                        className={`px-3 py-1.5 text-[#7E7E7E] text-base font-medium cursor-pointer hover:bg-gray-100 ${
                          selectedTarget === option.label
                            ? "bg-gray-100 font-semibold"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedTarget(option.label);
                          setIsShowDropdown3(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative h-[35px] w-full">
                <div
                  className="appearance-none cursor-pointer h-[35px] border border-[#7E7E7E] px-3 py-1.5 text-base font-medium bg-white text-[#7E7E7E] focus:outline-none flex items-center justify-between rounded-[4px]"
                  onClick={() => setIsShowDropdown4(prev => !prev)}
                >
                  {selectedCommentOption || "Who Can Comment"}
                  <div className="pointer-events-none">
                    <DropArrowIcon className="h-[14px] w-[12px]" />
                  </div>
                </div>

                {isShowDropdown4 && (
                  <div
                    className="absolute left-0 w-full bg-white text-[#7E7E7E] text-base font-medium border border-[#7E7E7E] z-50"
                    ref={dropdownRef3}
                  >
                    {(() => {
                      const allOptions = [
                        { label: "All", value: "ALL" },
                        {
                          label: "Connections only",
                          value: "CONNECTIONS_ONLY",
                        },
                        { label: "None", value: "NONE" },
                      ];

                      // Filter options based on visibility
                      const filteredOptions =
                        selectedTarget === "Connections only"
                          ? allOptions.filter(opt => opt.value !== "ALL") // Only show "Connections only" and "None"
                          : allOptions; // Show all options if visibility is "Anyone"

                      return filteredOptions.map(option => (
                        <div
                          key={option.value}
                          className={`px-3 py-1.5 text-[#7E7E7E] text-base font-medium cursor-pointer hover:bg-gray-100 ${
                            selectedCommentOption === option.label
                              ? "bg-gray-100 font-semibold"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedCommentOption(option.label);
                            setIsShowDropdown4(false);
                          }}
                        >
                          {option.label}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-y-1 items-end">
                <textarea
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-[161px] border-[#7E7E7E] focus:outline-none border px-3 py-1.5 text-base font-medium bg-white text-[#7E7E7E] placeholder:text-[#c5c5c5] rounded-[4px]"
                  placeholder="Post text"
                />
                <button
                  type="button"
                  className="px-4 py-[3.5px] mt-2 bg-[#25C396] text-white text-sm font-normal cursor-pointer rounded-[4px]"
                >
                  Generate Using AI
                </button>
              </div>

              {/* File Upload Section */}
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-2.5">
                  <input
                    type="file"
                    accept="image/*"
                    ref={photoInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    className="px-2 cursor-pointer py-[6px] h-[35px] border border-[#7E7E7E] bg-white text-[#7E7E7E] text-[12px] font-normal leading-0 rounded-[4px]"
                    onClick={() => photoInputRef.current.click()}
                    disabled={attachedFile || isUploading}
                  >
                    Add Photo
                  </button>
                  <input
                    type="file"
                    accept="video/*"
                    ref={videoInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    className="px-2 cursor-pointer py-[6px] h-[35px] border border-[#7E7E7E] bg-white text-[#7E7E7E] text-[12px] font-normal leading-0 rounded-[4px]"
                    onClick={() => videoInputRef.current.click()}
                    disabled={attachedFile || isUploading}
                  >
                    Add Video
                  </button>
                </div>

                {/* Show attached file */}
                {attachedFile && (
                  <div className="flex items-center justify-between p-2 bg-gray-100 rounded-[4px]">
                    <div className="flex items-center gap-x-2">
                      <span className="text-sm text-[#7E7E7E]">
                        {attachedFile.type.startsWith("image/") ? "📷" : "🎥"}{" "}
                        {attachedFile.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    {!isUploading && (
                      <button
                        onClick={() => setAttachedFile(null)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}

                {/* Upload progress bar */}
                {isUploading && (
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-[#7E7E7E] mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0096C7] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center text-[#7E7E7E] px-1 py-1.5 text-base font-medium gap-x-5">
                <button
                  onClick={() => setEnabled(!enabled)}
                  className={`w-[34px] h-4 flex items-center cursor-pointer rounded-full p-1 duration-300 ${
                    enabled ? "bg-[#0096C7]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ${
                      enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <p>Schedule Post</p>
              </div>
              {enabled && (
                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium text-[#7E7E7E]">
                    Schedule Date & Time
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={scheduleDate?.split("T")[0] || ""}
                      min={(() => {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = String(today.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const day = String(today.getDate()).padStart(2, "0");
                        return `${year}-${month}-${day}`;
                      })()}
                      max={(() => {
                        const maxDate = new Date();
                        maxDate.setMonth(maxDate.getMonth() + 3);
                        const year = maxDate.getFullYear();
                        const month = String(maxDate.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const day = String(maxDate.getDate()).padStart(2, "0");
                        return `${year}-${month}-${day}`;
                      })()}
                      onChange={e => {
                        const time = scheduleDate?.split("T")[1] || "00:00";
                        setScheduleDate(`${e.target.value}T${time}`);
                      }}
                      className="border border-[#7E7E7E] px-2 py-1 text-sm h-[35px] text-[#7E7E7E] rounded-[4px] flex-1"
                    />
                    <select
                      value={scheduleDate?.split("T")[1] || "00:00"}
                      onChange={e => {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = String(today.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const day = String(today.getDate()).padStart(2, "0");
                        const todayStr = `${year}-${month}-${day}`;
                        const date = scheduleDate?.split("T")[0] || todayStr;
                        setScheduleDate(`${date}T${e.target.value}`);
                      }}
                      className="border border-[#7E7E7E] px-2 py-1 text-sm h-[35px] text-[#7E7E7E] rounded-[4px]"
                    >
                      {Array.from({ length: 96 }, (_, i) => {
                        const hours = Math.floor(i / 4)
                          .toString()
                          .padStart(2, "0");
                        const minutes = ((i % 4) * 15)
                          .toString()
                          .padStart(2, "0");
                        return `${hours}:${minutes}`;
                      })
                        .filter(time => {
                          const selectedDate = scheduleDate?.split("T")[0];
                          const now = new Date();
                          const year = now.getFullYear();
                          const month = String(now.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const day = String(now.getDate()).padStart(2, "0");
                          const today = `${year}-${month}-${day}`;

                          // If selected date is not today, show all times
                          if (selectedDate !== today) return true;

                          // If selected date is today, skip the immediate next 15-minute interval
                          const currentMinutes = now.getMinutes();
                          const currentHours = now.getHours();

                          // Calculate the immediate next 15-minute interval
                          const nextInterval = Math.ceil(currentMinutes / 15) * 15;
                          let nextIntervalHours = currentHours;
                          let nextIntervalMinutes = nextInterval;

                          if (nextInterval === 60) {
                            nextIntervalHours = currentHours + 1;
                            nextIntervalMinutes = 0;
                          }

                          const nextIntervalTime = `${nextIntervalHours
                            .toString()
                            .padStart(2, "0")}:${nextIntervalMinutes
                            .toString()
                            .padStart(2, "0")}`;

                          // Show times after the immediate next interval
                          return time > nextIntervalTime;
                        })
                        .map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  className={`bg-[#0387FF] text-white h-[30px] w-[100px] flex justify-center items-center rounded-[4px] ${
                    isCreating ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={
                    postId ? handleEditEngagement : handleSaveEngagement
                  }
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    postId ? "Save" : "Create"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialEngagements;
