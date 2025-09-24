import { useEffect, useState } from "react";
import {
  PencilIcon,
  WebsiteIcon,
  InstaIcon,
  FacebookIcon,
  TwitterIcon,
  Aibot,
  DropArrowIcon,
} from "../../../../components/Icons.jsx";
import {
  createPersona,
  getPersona,
  getPersonas,
  updatePersona,
} from "../../../../services/personas.js";
import toast from "react-hot-toast";

const PersonaForm = ({
  showOnlyGenerated = false,
  setPersonas,
  isNew = false,
  isEdit = false,
  id,
  onCancel,
}) => {
  const [openLength, setOpenLength] = useState(false);
  const [openTone, setOpenTone] = useState(false);
  const [personaName, setPersonaName] = useState("");
  const [checked, setChecked] = useState(false);
  const [selectedLength, setSelectedLength] = useState("short");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [calendarLink, setCalendarLink] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [facebookName, setFacebookName] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [problem, setProblem] = useState("");
  const [benefits, setBenefits] = useState("");
  const [valueProp, setValueProp] = useState("");
  const [socialProof, setSocialProof] = useState("");
  const [idea, setIdea] = useState("");
  const [errors, setErrors] = useState({});
  const isPart1Visible =
    (isNew && step === 2) ||
    (isEdit && step === 2) ||
    (!isNew && !isEdit && !showOnlyGenerated);
  const isPart2Visible =
    (isNew && step === 1) ||
    (isEdit && step === 1) ||
    (!isNew && !isEdit && showOnlyGenerated);
  useEffect(() => {
    if (id) {
      const fetchPersona = async () => {
        try {
          const data = await getPersona(id);

          if (data) {
            console.log("data", data);
            setPersonaName(data.name || "");
            setProblem(data.problems || "");
            setBenefits(data.benefits || "");
            setValueProp(data.value_proposition || "");
            setSocialProof(data.social_proof || "");
            setIdea(data.idea_or_question || "");
            setSelectedLength(data.length || "");
            setSelectedTone(data.tone || "");
            setChecked(data.typos || false);
            setFullName(data.person_name || "");
            setCompanyName(data.company || "");
            setCompanyEmail(data.company_email || "");
            setTitle(data.title || "");
            setIndustry(data.industry || "");
            setMobileNumber(data.phone_number || "");
            setCalendarLink(data.calendar_link || "");
            setCompanyWebsite(data.company_website || "");
            setInstagramHandle(data.instagram_handle || "");
            setFacebookName(data.facebook_handle || "");
            setXHandle(data.x_handle || "");
          }
        } catch (error) {
          console.error("Failed to fetch persona:", error);
        }
      };

      fetchPersona();
    }
  }, [id]);
  const validate = () => {
    const errs = {};
    if (!personaName) errs.personaName = "Persona Name is required";
    if (!fullName) errs.fullName = "Full Name is required";
    return errs;
  };
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = {
      name: personaName || "",
      problems: problem || "",
      benefits: benefits || "",
      value_proposition: valueProp || "",
      social_proof: socialProof || "",
      idea_or_question: idea || "",
      length: selectedLength || "",
      tone: selectedTone || "",
      typos: checked || false,
      person_name: fullName || "",
      company: companyName || "",
      company_email: companyEmail || "",
      title: title || "",
      industry: industry || "",
      phone_number: mobileNumber || "",
      calendar_link: calendarLink || "",
      company_website: companyWebsite || "",
      instagram_handle: instagramHandle || "",
      facebook_handle: facebookName || "",
      x_handle: xHandle || "",
    };

    try {
      const createdPersona = await createPersona(payload);
      const updatedData = await getPersonas();
      setPersonas(updatedData);
      toast.success("Persona created successfully");
      onCancel();
      console.log("Created persona:", createdPersona);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to create persona:", err);
      }
    }
  };
  const handleEdit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = {
      name: personaName || "",
      problems: problem || "",
      benefits: benefits || "",
      value_proposition: valueProp || "",
      social_proof: socialProof || "",
      idea_or_question: idea || "",
      length: selectedLength || "",
      tone: selectedTone || "",
      typos: checked || false,
      person_name: fullName || "",
      company: companyName || "",
      company_email: companyEmail || "",
      title: title || "",
      industry: industry || "",
      phone_number: mobileNumber || "",
      calendar_link: calendarLink || "",
      company_website: companyWebsite || "",
      instagram_handle: instagramHandle || "",
      facebook_handle: facebookName || "",
      x_handle: xHandle || "",
    };
    try {
      await updatePersona(id, payload);
      const updatedData = await getPersonas();
      setPersonas(updatedData);
      toast.success("Persona updated successfully");
      onCancel();
    } catch (err) {
      console.log("error", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to update persona:", err);
      }
    }
  };

  console.log("id", id);
  return (
    <div className="flex flex-col gap-4 p-4 ">
      {/* Persona Name */}
      <div className="">
        <input
          type="text"
          placeholder="Persona Name"
          value={personaName}
          onChange={e => setPersonaName(e.target.value)}
          readOnly={showOnlyGenerated}
          className="w-full border border-[#7E7E7E] px-3 py-2 text-sm pr-10 text-[#6D6D6D] bg-white rounded-[6px]"
        />
        {errors.personaName && (
          <p className="text-red-500 text-xs mt-1">{errors.personaName}</p>
        )}
      </div>
      {/* PART 1: Basic Persona Info */}
      {isPart1Visible && (
        <>
          {/* Length and Tone Section */}
          {/* Length */}
          {/* <div className="w-full flex border border-[#7E7E7E] p-3 bg-white rounded-[8px]">
            <div className="mb-2 text-[#6D6D6D] font-normal w-4/12">
              Length
            </div>
            <div className="flex flex-col gap-2">
              {["short", "medium", "long"].map(len => (
                <div key={len} className="flex items-center gap-2">
                  <div className="w-[18px] h-[18px] rounded border-[2px] border-[#6D6D6D] flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedLength(len)}
                      className={`w-[10px] h-[10px] ${
                        selectedLength === len ? "bg-[#0387FF]" : "bg-white"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-[#6D6D6D]">
                    {len.charAt(0).toUpperCase() + len.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div> */}
          

          {/* Tone */}
          {/* <div className="w-full flex border border-[#7E7E7E] p-3 bg-white rounded-[8px]">
            <div className="mb-2 text-[#6D6D6D] font-normal w-4/12">Tone</div>
            <div className="flex flex-col gap-2">
              {[
                "friendly",
                "formal",
                "persuasive",
                "informative",
                "confident",
                "humble",
                "professional",
              ].map(tone => (
                <div key={tone} className="flex items-center gap-2">
                  <div className="w-[18px] h-[18px] rounded border-[2px] border-[#6D6D6D] flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedTone(tone)}
                      className={`w-[10px] h-[10px] ${
                        selectedTone === tone ? "bg-[#0387FF]" : "bg-white"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-[#6D6D6D]">{tone}</span>
                </div>
              ))}
            </div>
          </div> */}

          
          <div className="flex gap-2 ">
            <div className=" flex flex-col rounded-[8px] w-5/12">
              <div className="mb-2 text-[#6D6D6D] font-normal">Length</div>

              {/* Dropdown instead of radio buttons */}
              <div className="relative ">
                <button
                  type="button"
                  onClick={() => setOpenLength(!openLength)}
                  className="w-full flex items-center justify-between border border-[#7E7E7E] bg-white rounded-[6px] px-3 py-2 text-sm text-[#6D6D6D]"
                >
                  {selectedLength.charAt(0).toUpperCase() + selectedLength.slice(1)}
                  <DropArrowIcon
                    className={`w-4 h-4 transition-transform ${
                      openLength ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openLength && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-[#7E7E7E] rounded-[6px] shadow-md">
                    {["short", "medium", "long"].map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => {
                          setSelectedLength(len);
                          setOpenLength(false);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm ${
                          selectedLength === len
                            ? "bg-[#0387FF] text-white"
                            : "text-[#6D6D6D] hover:bg-gray-100"
                        }`}
                      >
                        {len.charAt(0).toUpperCase() + len.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className=" flex flex-col rounded-[8px] w-5/12">
              <div className="mb-2 text-[#6D6D6D] font-normal ">Tone</div>

              {/* Dropdown */}
              <div className="relative ">
                <button
                  type="button"
                  onClick={() => setOpenTone(!openTone)}
                  className="w-full flex items-center justify-between border border-[#7E7E7E] bg-white rounded-[6px] px-3 py-2 text-sm text-[#6D6D6D]"
                >
                  {selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1)}
                  <DropArrowIcon
                    className={`w-4 h-4 transition-transform ${
                      openTone ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openTone && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-[#7E7E7E] rounded-[6px] shadow-md">
                    {[
                      "friendly",
                      "formal",
                      "persuasive",
                      "informative",
                      "confident",
                      "humble",
                      "professional",
                    ].map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => {
                          setSelectedTone(tone);
                          setOpenTone(false);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm ${
                          selectedTone === tone
                            ? "bg-[#0387FF] text-white"
                            : "text-[#6D6D6D] hover:bg-gray-100"
                        }`}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col w-2/12 self-center">
              <div className="mt-6 text-[#6D6D6D] font-normal"></div>
              <div
                className="flex items-center gap-2 cursor-pointer "
                onClick={() => setChecked(prev => !prev)}
              >
                <div className="w-[18px] h-[18px] border-2 border-[#6D6D6D] rounded-sm flex items-center justify-center">
                  {checked && <div className="w-[10px] h-[10px] bg-[#0387FF]" />}
                </div>
                <span className="text-sm text-[#6D6D6D]">Add Typos</span>
              </div>
            </div>
          </div>
          <hr />
          

          {/* Contact Fields */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Full Name",
                value: fullName,
                onChange: setFullName,
                key: "fullName",
              },
              {
                label: "Company Name",
                value: companyName,
                onChange: setCompanyName,
              },
              {
                label: "Company Email",
                value: companyEmail,
                onChange: setCompanyEmail,
              },
              {
                label: "Title",
                value: title,
                onChange: setTitle,
              },
              {
                label: "Industry",
                value: industry,
                onChange: setIndustry,
              },
              {
                label: "Mobile Number",
                value: mobileNumber,
                onChange: setMobileNumber,
              },
              {
                label: "Booking Link",
                value: calendarLink,
                onChange: setCalendarLink,
              },
              {
                label: "Company URL",
                value: companyWebsite,
                onChange: setCompanyWebsite,
                icon: <WebsiteIcon className="w-5 h-auto" />,
              },
              {
                label: "Instagram Handle",
                value: instagramHandle,
                onChange: setInstagramHandle,
                icon: <InstaIcon className="w-5 h-auto" />,
              },
              {
                label: "Facebook URL",
                value: facebookName,
                onChange: setFacebookName,
                icon: <FacebookIcon className="w-5 h-auto" />,
              },
              {
                label: "X/Twitter",
                value: xHandle,
                onChange: setXHandle,
                icon: <TwitterIcon className="w-5 h-auto" />,
              },
            ].map(({ label, icon, value, onChange, key = label }) => (
              <div key={label} className={label === "Full Name" ? "col-span-2" : ""}>
                <label className="text-[#6D6D6D] mb-1 block">{label}</label>

                <div className="relative w-full">
                  {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E7E7E]">
                      {icon}
                    </span>
                  )}

                  <input
                    type="text"
                    placeholder={label}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full border border-[#6D6D6D] py-2 bg-white text-[#6D6D6D] text-sm rounded-[6px] ${
                      icon ? "pl-10 pr-3" : "px-2"
                    }`}
                  />
                </div>

                {errors[key] && (
                  <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* PART 2: Generated AI Content */}
      {isPart2Visible && (
        <div className="space-y-4 mt-2">
          {[
            { label: "Describe your problem", value: problem, setter: setProblem },
            { label: "Benefits", value: benefits, setter: setBenefits },
            {
              label: "Value Proposition",
              value: valueProp,
              setter: setValueProp,
            },
            {
              label: "Social Proof",
              value: socialProof,
              setter: setSocialProof,
            },
            {
              label: "Engagement",
              value: idea,
              setter: setIdea,
            },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="text-[#6D6D6D] mb-1 block font-medium">
                {label}
              </label>
              <div className="relative">
                <Aibot className="absolute left-3 top-3 w-4 h-4 text-[#6D6D6D] pointer-events-none" />
                <textarea
                  placeholder="AI Writing..."
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full border border-[#7E7E7E] pl-10 pr-3 py-2 h-[130px] resize-none bg-[#F9F9F9] text-[#6D6D6D] text-sm rounded-[6px]"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER BUTTONS */}
      <div className="flex justify-between mt-2 mb-2">
        <button
          className="bg-[#7E7E7E] text-white text-sm py-2 w-[142px] rounded-[6px] cursor-pointer"
          onClick={onCancel}
        >
          Cancel
        </button>

        {/* Step 1: Show Next (for both isNew and isEdit) */}
        {(isNew || isEdit) && step === 1 && (
          <button
            className="bg-[#0387FF] text-white text-sm py-2 w-[175px] rounded-[6px] cursor-pointer"
            onClick={() => setStep(2)}
          >
            Next
          </button>
        )}

        {/* Step 2: Final CTA */}
        {(isNew || isEdit) && step === 2 && (
          <div className="flex gap-2">
            <button
            className="bg-[#0387FF] text-white text-sm py-2 w-[125px] rounded-[6px] cursor-pointer"
            onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              className="bg-[#0387FF] text-white text-sm py-2 w-[175px] rounded-[6px] cursor-pointer"
              onClick={isNew ? handleSubmit : handleEdit}
            >
              {isNew ? "Generate" : "Regenerate"}
            </button>
          </div>
        )}

        {/* View-only persona (non-edit, non-new) */}
        {!isNew && !isEdit && showOnlyGenerated && (
          <button className="bg-[#0387FF] text-white text-sm py-2 w-[175px] rounded-[6px] cursor-pointer">
            Regenerate
          </button>
        )}
      </div>
    </div>
  );
};

export default PersonaForm;
