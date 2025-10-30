import React, { useState } from "react";
import {
  LoginIcon,
  DropArrowIcon,
  Cancel,
} from "../../../../../components/Icons";
import MoreClientInfoModal from "./MoreClientInfoModal";
import { useEditContext } from "../context/EditContext";
import toast from "react-hot-toast";
import { useParams } from "react-router";
import { updateUser } from "../../../../../services/admin";

const EditTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [dockersName, setDockersName] = useState("None");
  const [open, setOpen] = useState(false);
  const options = ["None", "Docker-1", "Docker-2"];
  const [openPlanType, setOpenPlanType] = useState(false);

  const {
    email,
    setEmail,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    company,
    setCompany,
    stripe,
    setStripe,
    agency,
    setAgency,
    plan,
    setPlan,
    planType,
    setPlanType,
    paidUntil,
    setPaidUntil,
    subPausedUntil,
    setSubPausedUntil,
    dockerVersion,
    setDockerVersion,
    devDockerName,
    setDevDockerName,
    profileViews,
    setProfileViews,
    invites,
    setInvites,
    twitterLikes,
    setTwitterLikes,
    inMails,
    setInMails,
    sequenceMsgs,
    setSequenceMsgs,
    globalEnrich,
    setGlobalEnrich,
    proxyCountry,
    setProxyCountry,
    city,
    setCity,
    region,
    setRegion,
    admin,
    setAdmin,
    userCreated,
    setUserCreated,
    address,
    setAddress,
    vat,
    setVat,
    linkedinEmail,
    setLinkedinEmail,
    linkedinName,
    setLinkedinName,
    linkedinDate,
    setLinkedinDate,
    linkedinUrl,
    setLinkedinUrl,
    linkedinCookiesUpdate,
    setLinkedinCookiesUpdate,
    linkedinCredUpdate,
    setLinkedinCredUpdate,
    twitterCookiesUpdate,
    setTwitterCookiesUpdate,
    twitterCredUpdate,
    setTwitterCredUpdate,
  } = useEditContext();
  const { id } = useParams();

  const handleSubmit = async () => {
    const payload = {
      // email: email,
      //enabled: false,
      first_name: firstName,
      last_name: lastName,
      company: company,
      // stripe: stripe,
      // agency: agency,
      // plan: plan,
      // plan_type: planType,
      // paid_until: paidUntil,
      // sub_paused_until: subPausedUntil,
      // docker_version: dockerVersion,
      // dev_docker_name: devDockerName,
      // profile_views: profileViews,
      // invites: invites,
      // twitter_likes: twitterLikes,
      // in_mails: inMails,
      // sequence_msgs: sequenceMsgs,
      // global_enrich: globalEnrich,
    };

    // Only include password if it's not empty
    if (password && password.trim() !== "") {
      payload.password = password;
    }

    try {
      await updateUser(id, payload);
      toast.success("User updated successfully");
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to update user:", error);
    }
  };

  //   const payload = {
  //     email,
  //     password,
  //     firstName,
  //     lastName,
  //     company,
  //     stripe,
  //     agency,
  //     plan,
  //     planType,
  //     paidUntil,
  //     subPausedUntil,
  //     dockerVersion,
  //     devDockerName,
  //     profileViews,
  //     invites,
  //     twitterLikes,
  //     inMails,
  //     sequenceMsgs,
  //     globalEnrich,
  //   };
  //   console.log("Form Data =>", payload);
  // };
  const handleOnboardingConfirm = () => {
    console.log("Onboarding confirmed for:", email);
    setIsOnboardingModalOpen(false);
  };

  // const handleSave = () => {
  //   console.log("Modal Saved =>", {
  //     email,
  //     admin,
  //     userCreated,
  //     address,
  //     vat,
  //     linkedin,
  //     stripe,
  //     subPausedUntil,
  //     linkedinCookiesUpdate,
  //     linkedinCredUpdate,
  //     twitterCookiesUpdate,
  //   });
  //   setIsModalOpen(false);
  // };

  return (
    <div className="w-[70%] m-auto">
      {/* Top Buttons */}
      <div className="flex gap-2 mb-6 justify-center">
        <button className="bg-[#16A37B] text-white px-4 py-2 cursor-pointer rounded-[6px]">
          View Browser
        </button>
        <button
          className="bg-[#00B4D8] text-white px-4 py-2 cursor-pointer rounded-[6px]"
          onClick={() => setIsModalOpen(true)}
        >
          More Client Info
        </button>
        <button className="bg-[#00B4D8] text-white px-4 py-2 cursor-pointer rounded-[6px]">
          Ban/Delay/Pause
        </button>
        <button className="bg-[#00B4D8] text-white px-4 py-2 cursor-pointer rounded-[6px]">
          Delete LinkedIn Data
        </button>
      </div>
      {isModalOpen && (
        <MoreClientInfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          email={email}
          setEmail={setEmail}
          admin={admin}
          setAdmin={setAdmin}
          userCreated={userCreated}
          setUserCreated={setUserCreated}
          address={address}
          setAddress={setAddress}
          vat={vat}
          setVat={setVat}
          linkedinEmail={linkedinEmail}
          setLinkedinEmail={setLinkedinEmail}
          linkedinName={linkedinName}
          setLinkedinName={setLinkedinName}
          linkedinDate={linkedinDate}
          setLinkedinDate={setLinkedinDate}
          linkedinUrl={linkedinUrl}
          setLinkedinUrl={setLinkedinUrl}
          stripe={stripe}
          setStripe={setStripe}
          subPausedUntil={subPausedUntil}
          setSubPausedUntil={setSubPausedUntil}
          linkedinCookiesUpdate={linkedinCookiesUpdate}
          setLinkedinCookiesUpdate={setLinkedinCookiesUpdate}
          linkedinCredUpdate={linkedinCredUpdate}
          setLinkedinCredUpdate={setLinkedinCredUpdate}
          twitterCookiesUpdate={twitterCookiesUpdate}
          setTwitterCookiesUpdate={setTwitterCookiesUpdate}
          twitterCredUpdate={twitterCredUpdate}
          setTwitterCredUpdate={setTwitterCredUpdate}
        />
      )}
      <div className="flex gap-2 mb-6 justify-end">
        <button className="bg-[#0077B6] text-white px-4 py-2 cursor-pointer rounded-[6px]">
          Add Invoice
        </button>
        <button
          className="bg-[#0077B6] text-white px-4 py-2 cursor-pointer rounded-[6px]"
          onClick={() => setIsOnboardingModalOpen(true)}
        >
          Add Onboarding
        </button>
        <button className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white">
          <LoginIcon className="w-4 h-4 text-[#7E7E7E]" />
        </button>
      </div>

      {/* Onboarding Modal */}
      {isOnboardingModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-[475px] text-[#7E7E7E]">
            <h2 className="text-[20px] font-semibold mb-4 text-[#6D6D6D]">
              Zopto.com says
            </h2>
            <div className=" text-[16px]">
              Add onboarding for user <span>{email}?</span>
            </div>
            <label className="block mb-4">
              <span className="">Please confirm the email:</span>
              <input
                className="w-full text-[12px] p-2 border border-[#6D6D6D] mt-1"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1 w-[130px] text-white bg-[#0387FF] border border-[#0387FF] rounded-[10px] cursor-pointer"
                onClick={handleOnboardingConfirm}
              >
                OK
              </button>
              <button
                className="px-4 py-1 w-[130px] text-[#v] border border-[#0387FF] rounded-[10px] cursor-pointer"
                onClick={() => setIsOnboardingModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <label>
          <span className="text-sm text-gray-600">Email</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-[#EFEFEF] text-[#7E7E7E] rounded-[6px]"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled
          />
        </label>
        <label>
          <span className="text-sm text-gray-600">Change Password</span>
          <input
            type="password"
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <label>
          <span className="text-sm text-gray-600">First Name</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
        </label>
        <label>
          <span className="text-sm text-gray-600">Last Name</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </label>
        <label>
          <span className="text-sm text-gray-600">Company</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
        </label>
        <label>
          <span className="text-sm text-gray-600">Stripe</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-[#EFEFEF] text-[#7E7E7E] rounded-[6px]"
            disabled
            value={stripe}
            onChange={e => setStripe(e.target.value)}
          />
        </label>

        {/* Agency field with button */}
        <label className="col-span-2">
          <span className="text-sm text-gray-600">
            Agency (Type ‘remove’ To Detach An Agency)
          </span>
          <div className="flex ">
            <input
              className="flex-1 p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-tl-[6px] rounded-bl-[6px]"
              value={agency}
              onChange={e => setAgency(e.target.value)}
            />
            <button className="px-4 py-2 bg-[#6D6D6D] text-white rounded-tr-[6px] rounded-br-[6px]">
              Open Agency
            </button>
          </div>
        </label>
      </div>

      {/* Plan / Dates */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <label>
          <span className="text-sm text-gray-600">Plan</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-[#EFEFEF] text-[#7E7E7E] rounded-[6px]"
            value={plan}
            onChange={e => setPlan(e.target.value)}
            disabled
          />
        </label>
        {/* <label>
          <span className="text-sm text-gray-600">Plan Type</span>
          <div className="relative">
            <select
              className="w-full appearance-none p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
              value={planType}
              onChange={e => setPlanType(e.target.value)}
            >
              <option value="Pro">Pro</option>
              <option value="Basic">Basic</option>
              <option value="Enterprise">Enterprise</option>
            </select>
            <DropArrowIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
          </div>
        </label> */}
        <label>
          <span className="text-sm text-gray-600">Plan Type</span>
          <div className="relative w-full">
            {/* Selected value */}
            <div
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px] cursor-pointer flex justify-between items-center"
              onClick={() => setOpenPlanType(!openPlanType)}
            >
              <span>{planType}</span>
              <DropArrowIcon
                className={`w-3 h-3 text-gray-600 transition-transform ${
                  openPlanType ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Options */}
            {openPlanType && (
              <div className="absolute mt-1 w-full bg-white border border-[#6D6D6D] rounded-[6px] overflow-hidden shadow-md z-10">
                {["Pro", "Basic", "Enterprise"].map(option => (
                  <div
                    key={option}
                    className={`p-2 cursor-pointer hover:bg-gray-100 text-[#6D6D6D] ${
                      planType === option ? "bg-gray-200 " : ""
                    }`}
                    onClick={() => {
                      setPlanType(option);
                      setOpenPlanType(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </label>

        <label>
          <span className="text-sm text-gray-600">Paid Until</span>
          <input
            type="date"
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={paidUntil}
            onChange={e => setPaidUntil(e.target.value)}
          />
        </label>
        <label>
          <span className="text-sm text-gray-600">Sub Paused Until</span>
          <input
            type="date"
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={subPausedUntil}
            onChange={e => setSubPausedUntil(e.target.value)}
          />
        </label>
      </div>

      {/* Docker Section */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <label>
          <span className="text-sm text-gray-600">Docker Version</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#16A37B] rounded-[6px]"
            value={dockerVersion}
            onChange={e => setDockerVersion(e.target.value)}
          />
        </label>
        <label>
          <span className="text-sm text-gray-600">Dev Docker Name</span>
          {/* <div className="relative">
            <select
              className="w-full appearance-none p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
              value={devDockerName}
              onChange={e => setDevDockerName(e.target.value)}
            >
              <option value="None">None</option>
              <option value="Docker-1">Docker-1</option>
              <option value="Docker-2">Docker-2</option>
            </select>
            <DropArrowIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
          </div> */}
          <div className="relative w-full">
            {/* Selected value */}
            <div
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px] cursor-pointer flex justify-between items-center"
              onClick={() => setOpen(!open)}
            >
              <span>{dockersName}</span>
              <DropArrowIcon
                className={`w-3 h-3 text-gray-600 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Options */}
            {open && (
              <div className="absolute mt-1 w-full bg-white border border-[#6D6D6D] rounded-[6px] overflow-hidden shadow-md z-10">
                {options.map(option => (
                  <div
                    key={option}
                    className={`p-2 cursor-pointer hover:bg-gray-100 text-[#6D6D6D] ${
                      dockersName === option ? "bg-gray-200 " : ""
                    }`}
                    onClick={() => {
                      setDockersName(option);
                      setOpen(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </label>
      </div>

      <hr className="mt-4 border-[#6D6D6D]" />

      {/* Campaign Limits */}
      <h3 className="mt-8 mb-2 text-gray-700 font-medium">
        Set the maximum values for campaigns / day
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Profile Views",
            value: profileViews,
            setter: setProfileViews,
            options: ["50", "100", "200"],
          },
          {
            label: "Invites",
            value: invites,
            setter: setInvites,
            options: ["50", "100", "200"],
          },
          {
            label: "Twitter Likes",
            value: twitterLikes,
            setter: setTwitterLikes,
            options: ["100", "150", "300"],
          },
          {
            label: "InMails",
            value: inMails,
            setter: setInMails,
            options: ["100", "150", "200"],
          },
          {
            label: "Sequence Msgs",
            value: sequenceMsgs,
            setter: setSequenceMsgs,
            options: ["50", "100", "200", "300"],
          },
          {
            label: "Global Enrich",
            value: globalEnrich,
            setter: setGlobalEnrich,
            options: ["100", "150", "300"],
          },
        ].map((field, i) => (
          <label key={i}>
            <span className="text-sm text-gray-600">{field.label}</span>
            <div className="relative">
              <select
                className="w-full appearance-none p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
                value={field.value}
                onChange={e => field.setter(e.target.value)}
              >
                {field.options.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <DropArrowIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
            </div>
          </label>
        ))}
      </div>
      <hr className="mt-4 border-[#6D6D6D]" />
      <div className="mt-2 text-[#7E7E7E]">
        <div>Proxy country: {proxyCountry}</div>
        <div>City: {city}</div>
        <div>Region: {region}</div>
      </div>

      <hr className="mt-4 border-[#6D6D6D]" />

      {/* Save Button */}
      <div className="mt-6">
        <button
          className="bg-[#0387FF] w-[130px] text-white px-6 py-2 border-[#6D6D6D] rounded-[6px]"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditTab;
