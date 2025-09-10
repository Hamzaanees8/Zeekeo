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
import { createEngagement, deleteEngagement, getEngagement, getEngagements, updateEngagement } from "../../services/socialEngagements";
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
  const [postId, setPostId] = useState('');
  const [postDelId, setPostDelId] = useState('');
  const [postsData, setPostsData] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(false);
  const [errors, setErrors] = useState({});

  const dropdownRef = useRef(null);
  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);
  const dropdownRef3 = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  console.log('selectedOption', selectedOption);

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
          setPostsData(data)
        }
      } catch (error) {
        console.error("Failed to fetch persona:", error);
      }
    };

    fetchPersona();

  }, []);

  useEffect(() => {
    if (postId) {
      const selectedPost = postsData.find((post) => {
        return post.post_id == postId
      })

      setTitle(selectedPost?.text)

    }
  }, [postId]);

  const validate = () => {
    let newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
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
      attachments: [
        "file1.png"
      ],
      external_link: "https://example.com"
    }
    try {
      const updatedPost = await updateEngagement(engagementData, postId);

      setPostsData(prevPosts => {
        const filtered = prevPosts.filter(post => post.post_id !== postId);
        return [...filtered, updatedPost];
      });
      setTitle('')
      setPostId('')
      toast.success("Engagement saved successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving engagement:", error);
      toast.error("Failed to save engagement.");
    }
  };

  const handleSaveEngagement = async () => {
    if (!validate()) return;

    const engagementData = {
      text: title,
      attachments: [
        "file1.png"
      ],
      external_link: "https://example.com"
    }


    try {
      const newPost = await createEngagement(engagementData);
      setPostsData(prevPosts => {
        return [...prevPosts, newPost];
      });
      setTitle('')
      toast.success("Engagement saved successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.log('error', error);

      console.error("Error saving engagement:", error);
      toast.error("Failed to save engagement.");
    }
  };

  const handleDeleteEngagement = async (postId) => {
    try {
      await deleteEngagement(postId);
      toast.success('Engagement deleted successfully');
      setPostsData(prev => prev.filter(post => post.post_id !== postId));
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete engagement');
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
                setIsShowDropdown1(prev => !prev)
                setTitle('')
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
                  "Events and Webinars",
                  "Celebrations",
                  "Create a Poll",
                  "Find an Expert",
                  "Offer Help",
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
              setSelectedOption('Post');
              setIsShowDropdown1(false);
              setIsModalOpen(true);
            }} />
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 ">
            <div className="flex flex-col h-[95vh] overflow-y-auto gap-y-5 bg-white px-7 pt-[15px] pb-7 w-[460px] border border-[#7E7E7E] rounded-[6px]">
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
                      "Events and Webinars",
                      "Celebrations",
                      "Create a Poll",
                      "Find an Expert",
                      "Offer Help",
                    ].map(option => (
                      <div
                        key={option}
                        className={`px-3 py-1.5 text-[#7E7E7E] text-base font-medium cursor-pointer hover:bg-gray-100 ${selectedOption === option
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
              <div className="flex flex-col">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.title;
                      return newErrors;
                    });
                    setTitle(e.target.value)
                  }}
                  placeholder={`${selectedOption} Title (This is only visible to you)`}
                  className="h-[35px] border border-[#7E7E7E] px-3 py-1.5 text-base font-medium bg-white text-[#7E7E7E] focus:outline-none placeholder:text-[#c5c5c5] font-urbanist placeholder:font-urbanist rounded-[4px]"
                  style={{
                    border: errors.title ? "1px solid red" : "1px solid #7E7E7E",
                  }}
                />
                {errors.title && <p className={`${errors.title && 'text-red-500'} text-[11px]`}>Title is required</p>}
              </div>
              <div className="relative h-[35px] w-full">
                <div
                  className="appearance-none cursor-pointer h-[35px] border border-[#7E7E7E] px-3 py-1.5 text-base font-medium bg-white text-[#7E7E7E] focus:outline-none flex items-center justify-between rounded-[4px]"
                  onClick={() => setIsShowDropdown3(prev => !prev)}
                >
                  {selectedTarget || "Target"}
                  <div className="pointer-events-none">
                    <DropArrowIcon className="h-[14px] w-[12px]" />
                  </div>
                </div>

                {isShowDropdown3 && (
                  <div
                    className="absolute left-0 w-full bg-white text-[#7E7E7E] text-base font-medium border border-[#7E7E7E] z-50"
                    ref={dropdownRef2}
                  >
                    {["Public", "Connections", "Followers", "Private"].map(
                      option => (
                        <div
                          key={option}
                          className={`px-3 py-1.5 text-[#7E7E7E] text-base font-medium cursor-pointer hover:bg-gray-100 ${selectedOption === option
                            ? "bg-gray-100 font-semibold"
                            : ""
                            }`}
                          onClick={() => {
                            setSelectedTarget(option);
                            setIsShowDropdown3(false);
                          }}
                        >
                          {option}
                        </div>
                      ),
                    )}
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
                    {["All", "Connections", "Followers", "None"].map(
                      option => (
                        <div
                          key={option}
                          className={`px-3 py-1.5 text-[#7E7E7E] text-base font-medium cursor-pointer hover:bg-gray-100 ${selectedOption === option
                            ? "bg-gray-100 font-semibold"
                            : ""
                            }`}
                          onClick={() => {
                            setSelectedCommentOption(option);
                            setIsShowDropdown4(false);
                          }}
                        >
                          {option}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-y-1 items-end">
                <textarea
                  className="w-full h-[161px] border-[#7E7E7E] focus:outline-none border px-3 py-1.5 text-base font-medium bg-white text-[#7E7E7E] placeholder:text-[#c5c5c5] rounded-[4px]"
                  placeholder={`${selectedOption} Body`}
                />
                <button
                  type="button"
                  className="px-4 py-[3.5px] mt-2 bg-[#25C396] text-white text-sm font-normal cursor-pointer rounded-[4px]"
                >
                  Generate Using AI
                </button>
              </div>
              {/* <div className="flex items-center gap-x-2.5">
                <input
                  type="file"
                  accept="image/*"
                  ref={photoInputRef}
                  onChange={e => handleFileChange(e, "Photo")}
                  className="hidden"
                />
                <button
                  type="button"
                  className="px-2 cursor-pointer py-[6px] h-[35px] border border-[#7E7E7E] bg-white text-[#7E7E7E] text-[12px] font-normal leading-0"
                  onClick={() => photoInputRef.current.click()}
                >
                  Add Photos
                </button>
                <input
                  type="file"
                  accept="video/*"
                  ref={videoInputRef}
                  onChange={e => handleFileChange(e, "Video")}
                  className="hidden"
                />
                <button
                  type="button"
                  className="px-2 cursor-pointer py-[6px] h-[35px] border border-[#7E7E7E] bg-white text-[#7E7E7E] text-[12px] font-normal leading-0"
                  onClick={() => videoInputRef.current.click()}
                >
                  Add Videos
                </button>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  ref={documentInputRef}
                  onChange={e => handleFileChange(e, "Document")}
                  className="hidden"
                />
                <button
                  type="button"
                  className="px-2 cursor-pointer py-[6px] h-[35px] border border-[#7E7E7E] bg-white text-[#7E7E7E] text-[12px] font-normal leading-0"
                  onClick={() => documentInputRef.current.click()}
                >
                  Add Document
                </button>
              </div> */}
              <input
                type="text"
                placeholder="Hashtags"
                className="h-[35px] border border-[#7E7E7E] px-3 py-1.5 text-base font-medium bg-white text-[#7E7E7E] placeholder:text-[#c5c5c5] focus:outline-none rounded-[4px]"
              />
              <div className="flex items-center text-[#7E7E7E] px-1 py-1.5 text-base font-medium gap-x-5">
                <button
                  onClick={() => setEnabled(!enabled)}
                  className={`w-[34px] h-4 flex items-center cursor-pointer rounded-full p-1 duration-300 ${enabled ? "bg-[#0096C7]" : "bg-gray-300"
                    }`}
                >
                  <div
                    className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ${enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                  />
                </button>
                <p>Schedule Post</p>
              </div>
              {enabled &&
                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium text-[#7E7E7E]">Schedule Date</label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="border border-[#7E7E7E] px-2 py-1 text-sm h-[35px] text-[#7E7E7E] rounded-[4px]"
                  />
                </div>}

              <div className="flex justify-end">
                <button className="bg-[#0387FF] cursor-pointer text-white h-[30px] w-[100px] flex justify-center items-center rounded-[4px]" onClick={postId ? handleEditEngagement : handleSaveEngagement}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialEngagements;
