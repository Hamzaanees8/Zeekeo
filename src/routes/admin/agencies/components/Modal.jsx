import { useEffect, useRef, useState } from "react";
import { DropArrowIcon } from "../../../../components/Icons";

const Modal = ({ onClose, onClick, type, title }) => {
  const moreOptionsRef = useRef(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        moreOptionsRef.current &&
        !moreOptionsRef.current.contains(event.target)
      ) {
        setShowMoreOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[620px] px-8 py-[24px] font-urbanist text-[#6D6D6D] font-normal rounded-[6px]">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            {title}
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>

        {/* Existing 'create' modal content */}
        {type === "create" && (
          <div>
            <div className="flex items-center gap-x-[14px] mb-[21px]">
              <div className="flex flex-col gap-y-2 w-[87px]">
                <p className="font-medium text-[16px]">Min User*</p>
                <div className="border border-[#6D6D6D] rounded-[6px]">
                  <input
                    type="number"
                    className="border border-[#6D6D6D] font-poppins text-[13px] appearance-none [::-webkit-outer-spin-button]:appearance-none [::-webkit-inner-spin-button]:appearance-none focus:outline-none rounded-[6px] px-2"
                    
                  />
                </div>
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <p className="font-medium text-[16px]">
                  Choose Plan* Create a price inside this product
                </p>
                <div
                  className="relative h-[40px] text-xs font-poppins w-full"
                  ref={moreOptionsRef}
                >
                  <div
                    className="cursor-pointer w-full h-[40px] justify-between border border-[#6D6D6D] px-4 py-2 text-base font-medium bg-white text-[#6D6D6D] flex items-center gap-x-2 rounded-[6px]"
                    onClick={() => setShowMoreOptions(prev => !prev)}
                  >
                    <span className="text-sm font-normal">
                      {selectedOption
                        ? `${selectedOption}`
                        : "Select a Plan...."}
                    </span>
                    <DropArrowIcon className="h-[16px] w-[14px]" />
                  </div>
                  {showMoreOptions && (
                    <div className="absolute top-[50px] w-full left-0 bg-white border border-[#6D6D6D] z-50 shadow-md text-[#6D6D6D] text-sm rounded-[6px] overflow-hidden">
                      {[
                        "100/mo user",
                        "Custom Agency Plan One Tier",
                        "Custom Quarterly Plan, Pricing Change",
                        "1 Tier Customs Agency Plan",
                        "Custom Agency Plan, Two Tier",
                        "Custom Agency Plan, Three Tier",
                        "Custom Agency Quarterly",
                        "100 Per Month Per User",
                        "Agency Quarterly",
                        "Multi-User Startup Plan",
                      ].map(val => (
                        <div
                          key={val}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedOption(val);
                            setShowMoreOptions(false);
                          }}
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-[21px]">
              <p className="text-[20px]">Plan name: {selectedOption}</p>
              <div className="text-[16px] mt-[40px]">
                <p>$384 up to 19 users</p>
                <p>$324 up to 49 users</p>
                <p>$300 up to 99 users</p>
                <p>$240 up to infinite users</p>
              </div>
            </div>
            <button className="px-4 py-1 w-[130px] text-[#FFFFFF] bg-[#0387FF] cursor-pointer border border-[#0387FF] mb-[21px] rounded-[6px]">
              Create
            </button>
            <hr className="mb-[21px] w-full text-[#6D6D6D]" />
            <div className="flex items-end mb-[21px] gap-x-[34px]">
              <div className="flex flex-col gap-y-2 w-[390px]">
                <p className="font-medium text-[16px]">
                  Link to create agency account
                </p>
                <input
                  type="text"
                  className="px-3 border border-[#6D6D6D] font-poppins h-[42px] text-[13px] appearance-none [::-webkit-outer-spin-button]:appearance-none [::-webkit-inner-spin-button]:appearance-none focus:outline-none rounded-[6px]"
                  
                />
              </div>
              <button className="px-4 py-1 w-[130px] text-[#FFFFFF] bg-[#0387FF] cursor-pointer border border-[#0387FF] rounded-[6px]">
                Copy
              </button>
            </div>
            <hr className="mb-[21px] w-full text-[#6D6D6D]" />
          </div>
        )}

        {/* New 'coupon' modal content */}
        {type === "coupon" && (
          <div>
            <div className="mb-[21px]">
              <p className="font-medium text-[16px] mb-2">
                Current Coupon: No current coupon
              </p>
              <p className="font-medium text-[16px]">Choose Coupon</p>
              <div
                className="relative h-[40px] text-xs font-poppins w-full"
                ref={moreOptionsRef}
              >
                <div
                  className="cursor-pointer w-full h-[40px] justify-between border border-[#6D6D6D] px-4 py-2 text-base font-medium bg-white text-[#6D6D6D] flex items-center gap-x-2 rounded-[6px]"
                  onClick={() => setShowMoreOptions(prev => !prev)}
                >
                  <span className="text-sm font-normal">
                    {selectedOption
                      ? `${selectedOption}`
                      : "Select a Coupon...."}
                  </span>
                  <DropArrowIcon className="h-[16px] w-[14px]" />
                </div>
                {showMoreOptions && (
                  <div className="absolute top-[50px] w-full left-0 bg-white border border-[#6D6D6D] z-50 shadow-md text-[#6D6D6D] text-sm rounded-[6px] overflow-hidden">
                    {[
                      "No Coupon",
                      "30poff3m",
                      "30poff3m",
                      "30poff3m",
                      "300OFF",
                      "25OFFTIME",
                      "medicalDiscount40%off3m",
                      "START50",
                      "Blueprint500",
                      "IGKAO2025",
                    ].map(val => (
                      <div
                        key={val}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedOption(val);
                          setShowMoreOptions(false);
                        }}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-[21px]">
              <p className="font-medium text-[16px]">
                Coupon: {selectedOption}
              </p>
              <p className="font-medium text-[16px]">Duration 3 months</p>
              <p className="font-medium text-[16px]">30% Off</p>
            </div>
          </div>
        )}

        {/* New 'invoice' modal content */}
        {type === "invoice" && (
          <div>
            <div className="flex flex-col gap-y-4 mb-[21px]">
              <div>
                <p className="font-medium text-[16px]">Email</p>
                <input
                  type="email"
                  className="px-3 border border-[#6D6D6D] font-poppins h-[42px] text-[13px] appearance-none focus:outline-none rounded-[6px] w-full"
                  value="dashboard.zapto.com"
                  readOnly
                />
              </div>
              <div className="flex gap-x-[14px]">
                <div className="w-1/2">
                  <p className="font-medium text-[16px]">Invoice Number</p>
                  <input
                    type="text"
                    className="px-3 border border-[#6D6D6D] font-poppins h-[42px] text-[13px] appearance-none focus:outline-none rounded-[6px] w-full"
                    placeholder="1244"
                  />
                </div>
                <div className="w-1/2">
                  <p className="font-medium text-[16px]">
                    Invoice ID (Ref/Charge ID)
                  </p>
                  <input
                    type="text"
                    className="px-3 border border-[#6D6D6D] font-poppins h-[42px] text-[13px] appearance-none focus:outline-none w-full rounded-[6px]"
                    placeholder="1244-AC-00023"
                  />
                </div>
              </div>
              <div>
                <p className="font-medium text-[16px]">Description</p>
                <input
                  type="text"
                  className="px-3 border border-[#6D6D6D] font-poppins h-[42px] text-[13px] appearance-none focus:outline-none w-full rounded-[6px]"
                />
              </div>
              <div>
                <p className="font-medium text-[16px]">Invoice URL</p>
                <input
                  type="text"
                  className="px-3 border border-[#6D6D6D] font-poppins h-[42px] text-[13px] appearance-none focus:outline-none w-full rounded-[6px]"
                  value="https://zapto.secure.com/id99930-283938euxx998-990"
                  readOnly
                />
              </div>
              <div>
                <p className="font-medium text-[16px]">Total Amount</p>
                <input
                  type="text"
                  className="px-3 border border-[#6D6D6D] font-poppins h-[42px] text-[13px] appearance-none focus:outline-none w-full rounded-[6px]"
                  value="$1235.50 CAD"
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons for all modal types */}
        {type !== "invoice" ? (
          <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
            <button
              onClick={onClose}
              className="px-4 py-1 w-[130px] text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[6px]"
            >
              Close
            </button>
            <button
              onClick={onClick}
              className="px-4 py-1 w-[130px] text-[#FFFFFF] bg-[#0387FF] cursor-pointer border border-[#0387FF] rounded-[6px]"
            >
              {type === "coupon" ? "Update" : "Create"}
            </button>
          </div>
        ) : (
          <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
            <button
              onClick={onClose}
              className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[6px]"
            >
              Close
            </button>
            <button
              onClick={onClick}
              className="px-4 py-1 text-[#FFFFFF] bg-[#0387FF] cursor-pointer border border-[#0387FF] rounded-[6px]"
            >
              Create
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
