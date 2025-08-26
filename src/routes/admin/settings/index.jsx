import { useState } from "react";

const AdminSettings = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    <div className="flex flex-col gap-y-[18px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]">
      <div className="flex flex-col gap-y-[35px]">
        <h1 className="text-[#6D6D6D] text-[44px] font-[300]">Settings</h1>
        <div className="flex flex-col gap-y-[39px] px-[200px] text-[#6D6D6D] font-urbanist w-[750]">
          <div className="flex flex-col gap-y-[24px] w-full">
            <p className="text-[20px] font-[500]">Account Details</p>
            <div className="flex items-center gap-x-[18px]">
              <div>
                <p className="text-base font-normal">First Name*</p>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-[366px] h-[40px] font-poppins border border-[#6D6D6D] bg-[#FFFFFF] px-4 py-2 font-normal text-[13px] text-[#7E7E7E] focus:outline-none"
                />
              </div>
              <div>
                <p className="text-base font-normal">Last Name*</p>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-[366px] h-[40px] font-poppins border border-[#6D6D6D] bg-[#FFFFFF] px-4 py-2 font-normal text-[13px] text-[#7E7E7E]  focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-x-[18px]">
              <div>
                <p className="text-base font-normal">Password</p>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-[366px] h-[40px] font-poppins border border-[#6D6D6D] bg-[#FFFFFF] px-4 py-2 font-normal text-[13px] text-[#7E7E7E] focus:outline-none"
                />
              </div>
              <div>
                <p className="text-base font-normal">Confirm Password</p>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-[366px] h-[40px] font-poppins border border-[#6D6D6D] bg-[#FFFFFF] px-4 py-2 font-normal text-[13px] text-[#7E7E7E]  focus:outline-none"
                />
              </div>
            </div>
            <button className="px-4 py-1 h-9 w-[130px] text-white bg-[#0387FF] cursor-pointer border border-[#0387FF]">
              Save
            </button>
          </div>
          <div className="flex flex-col gap-y-[39px] w-full">
            <p className="text-[20px] font-[500]">Phone Numbers</p>
            <div className="flex items-start gap-x-[30px]">
              <div className="text-base font-[500] w-[590px]">
                <p>
                  {" "}
                  Add an extra layer of security to your account by using a
                  one-time security code.
                </p>
                <p>
                  {" "}
                  Each time you sign into Zopto admin panel account, you'll
                  need your password and your security code.
                </p>
              </div>
              <button className="px-4 py-1 h-9 w-[130px] text-white bg-[#00B4D8] cursor-pointer border border-[#00B4D8]">
                + Phone
              </button>
            </div>
            <hr className="text-[#6D6D6D] w-full" />
            <p className="text-[20px] font-[500]">System Down</p>
            <div className="flex items-start justify-between">
              <div className="text-base font-[500]">
                <p>
                  {" "}
                  System Down is a setting to temporarily pause all activity
                  connections for
                </p>
                <p> troubleshooting.</p>
              </div>
              <button className="px-4 py-1 h-9 w-[130px] text-white bg-[#7E7E7E] cursor-pointer border border-[#7E7E7E]">
                Disabled
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
