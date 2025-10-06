import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { RightArrowIcon } from "../../../components/Icons.jsx";
import SalesNavigatorCampaign from "./components/SalesNavigatorCampaign";
import GuidedCampaign from "./components/GuidedCampaign";
import CsvUploadCampaign from "./components/CsvUploadCampaign";
import LinkedInSalesNavigator from "./components/LinkedInSalesNavigator";
import LinkedInPremium from "./components/LinkedInPremium";
import { Link } from "react-router";
import Button from "../../../components/Button.jsx";
import SelectWorkflow from "../../../components/workflow/SelectWorkflow.jsx";
import { createCampaign } from "../../../services/campaigns";
import WorkFlowEdge from "../../../components/workflow/WorkFlowEdge.jsx";
import {
  areAllTemplatesAssigned,
  campaignOptions,
  campaignSteps,
  isValidURL,
  normalizeFilterFields,
} from "../../../utils/campaign-helper";
import { Helmet } from "react-helmet";
import useCampaignStore from "../../stores/useCampaignStore";
import ExistingConnectionsCampaign from "./components/ExistingConnectionsCampaign.jsx";
import Stepper from "./components/Stepper.jsx";
import { getCurrentUser } from "../../../utils/user-helpers.jsx";

export const CreateCampaign = () => {
  const {
    campaignName,
    campaignType,
    setCampaignName,
    setCampaignType,
    searchUrl,
    filterFields,
    profileUrls,
    workflow,
    setWorkflow,
    settings,
    resetCampaign,
  } = useCampaignStore();

  const [hoveredSub, setHoveredSub] = useState(null);
  //const [campaignName, setCampaignName] = useState("");
  const [campaign, setCampaign] = useState({});
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [step, setStep] = useState(0);
  const [steps, setSteps] = useState(campaignSteps["default"]);
  const [showWorkflows, setShowWorkflows] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  // Replace skeleton with real steps once type is chosen
  useEffect(() => {
    if (campaignType && campaignSteps[campaignType]) {
      setSteps(campaignSteps[campaignType]);
    } else {
      setSteps(campaignSteps["default"]);
    }
  }, [campaignType]);

  useEffect(() => {
    if (Object.keys(workflow).length === 0) setShowWorkflows(true);
  }, [workflow]);

  useEffect(() => {
    if (step == 0) resetCampaign();
  }, [step]);

  const handleWorkflowSelect = async workflow => {
    setWorkflow(workflow);
  };

  const handleSelect = id => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name first.");
      return;
    }
    setCampaignType(id);

    setStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const hasAnyFilterSelection = filterFields => {
    return Object.values(filterFields).some(val => {
      if (Array.isArray(val)) {
        return val.length > 0;
      }
      if (typeof val === "string") {
        return val.trim() !== "";
      }
      return false;
    });
  };

  const hasAnySalesNavigatorFilterSelection = filterFields => {
    return Object.values(filterFields).some(val => {
      if (Array.isArray(val)) {
        return (
          val.length > 0 &&
          val.some(v => {
            if (typeof v === "string") return v.trim() !== "";
            if (typeof v === "object" && v !== null)
              return hasAnySalesNavigatorFilterSelection(v); // in case array contains objects
            return false;
          })
        );
      }
      if (typeof val === "object" && val !== null) {
        return hasAnySalesNavigatorFilterSelection(val);
      }
      if (typeof val === "string") {
        return val.trim() !== "";
      }
      return false;
    });
  };

  const createCampaignHandler = async () => {
    const currentUser = getCurrentUser();
    const hasSchedule =
      currentUser?.settings?.schedule?.days &&
      Object.keys(currentUser.settings.schedule.days).length > 0;

    const hasSNAccount =
      currentUser.accounts?.linkedin?.data?.sales_navigator?.owner_seat_id ||
      null;

    let campaignData = {};

    const filterParams = normalizeFilterFields(filterFields);

    if (campaignType == "sales-navigator") {
      campaignData = {
        campaign: {
          name: campaignName,
          source: {
            filter_url: searchUrl,
          },
          settings,
          ...(hasSchedule && { schedule: currentUser.settings.schedule }),
          workflow: workflow.workflow,
        },
      };
    } else if (campaignType == "guided") {
      campaignData = {
        campaign: {
          name: campaignName,
          source: {
            filter_api: hasSNAccount ? "sales_navigator" : "classic",
            filter_fields: filterParams,
          },
          settings,
          ...(hasSchedule && { schedule: currentUser.settings.schedule }),
          workflow: workflow.workflow,
        },
      };
    } else if (campaignType == "csv-upload") {
      campaignData = {
        campaign: {
          name: campaignName,
          source: {
            profile_urls: true,
          },
          settings,
          ...(hasSchedule && { schedule: currentUser.settings.schedule }),
          workflow: workflow.workflow,
        },
        profile_urls: profileUrls,
      };
    } else if (campaignType === "custom-setup-linkedin-premium") {
      campaignData = {
        campaign: {
          name: campaignName,
          source: {
            filter_api: "classic",
            filter_fields: filterParams,
          },
          settings,
          ...(hasSchedule && { schedule: currentUser.settings.schedule }),
          workflow: workflow.workflow,
        },
      };
    } else if (campaignType === "custom-setup-linkedin-sales-navigator") {
      campaignData = {
        campaign: {
          name: campaignName,
          source: {
            filter_api: "sales_navigator",
            filter_fields: filterParams,
          },
          settings,
          ...(hasSchedule && { schedule: currentUser.settings.schedule }),
          workflow: workflow.workflow,
        },
      };
    } else if (campaignType === "existing-connections") {
      campaignData = {
        campaign: {
          name: campaignName,
          source: {
            filter_api: "sales_navigator",
            filter_fields: filterParams,
          },
          settings,
          ...(hasSchedule && { schedule: currentUser.settings.schedule }),
          workflow: workflow.workflow,
        },
      };
    }

    //  console.log(campaignData);
    //  return;

    try {
      await createCampaign(campaignData);
      resetCampaign();
      toast.success("Campaign created successfully!");
      navigate("/campaigns", { replace: true });
    } catch (err) {
      //console.log(err)
      const msg = err?.response?.data?.message || "Failed to save campaign.";
      if (err?.response?.status !== 401) {
        toast.error(msg);
      }
    }
  };

  const handleNext = () => {
    console.log(step);

    if (!workflow || Object.keys(workflow).length === 0) {
      toast.error("Please select workflow first.");
      navigate("/campaigns", { replace: true });
    }

    if (campaignType === "sales-navigator") {
      if (step === 2) {
        if (!searchUrl.trim()) {
          toast.error("Please enter the Search URL first.");
          return;
        } else if (!isValidURL(searchUrl)) {
          toast.error("Please enter valid Search URL.");
          return;
        }
      }

      if (step == 3 && !areAllTemplatesAssigned(workflow)) {
        toast.error("Please assign template for all action nodes.");
        return;
      }
    } else if (campaignType === "guided") {
      if (step == 2 && !hasAnyFilterSelection(filterFields)) {
        toast.error("Please select at least one filter before proceeding.");
        return; // stop next step
      }

      if (step == 4 && !areAllTemplatesAssigned(workflow)) {
        toast.error("Please assign template for all action nodes.");
        return;
      }
    } else if (campaignType === "csv-upload") {
      if (step == 2 && profileUrls.length == 0) {
        toast.error("Please enter the Profile URLs first.");
        return;
      }

      if (step == 4 && !areAllTemplatesAssigned(workflow)) {
        toast.error("Please assign template for all action nodes.");
        return;
      }
    } else if (campaignType === "custom-setup-linkedin-premium") {
      if (step == 2 && !hasAnyFilterSelection(filterFields)) {
        toast.error("Please select at least one filter before proceeding.");
        return;
      }

      if (step == 4 && !areAllTemplatesAssigned(workflow)) {
        toast.error("Please assign template for all action nodes.");
        return;
      }
    } else if (campaignType === "custom-setup-linkedin-sales-navigator") {
      if (step == 2 && !hasAnySalesNavigatorFilterSelection(filterFields)) {
        toast.error("Please select at least one filter before proceeding.");
        return; // stop next step
      }

      if (step == 4 && !areAllTemplatesAssigned(workflow)) {
        toast.error("Please assign template for all action nodes.");
        return;
      }
    } else if (campaignType === "existing-connections") {
      if (step == 2 && !hasAnyFilterSelection(filterFields)) {
        toast.error("Please select at least one filter before proceeding.");
        return; // stop next step
      }

      if (step == 4 && !areAllTemplatesAssigned(workflow)) {
        toast.error("Please assign template for all action nodes.");
        return;
      }
    }

    if (step === steps.length - 1) {
      createCampaignHandler();
      return;
    }

    setStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep(prev => {
      const newStep = Math.max(prev - 1, 0);

      // Reset campaignType when going back to step 1
      if (newStep === 1) {
        setCampaignType("");
      }

      return newStep;
    });
  };

  console.log(step);
  console.log(campaignType);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Zeekeo Launchpad - Create Campaign</title>
      </Helmet>
      <div className="p-6 border-b w-full relative pt-[64px] bg-[#EFEFEF]">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-[48px] font-urbanist text-grey-medium font-medium">
            Create a Campaign
          </h1>
        </div>

        <div className="w-full">
          <div className="max-w-7xl mx-auto bg-[#fff] rounded-[6px]">
            <Stepper steps={steps} activeStep={step} />
          </div>
        </div>

        <div className="p-2 w-full relative pt-[10px] bg-[#EFEFEF]">
          <div className="flex flex-wrap items-center justify-between w-full">
            <div>
              {step > 0 && (
                <button
                  className="my-2 px-6 py-1 w-[109px] text-[20px] bg-[#7E7E7E] text-white cursor-pointer rounded-[6px]"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
            </div>
            <div className="ml-auto">
              {steps.length > step &&
                step != 1 &&
                Object.keys(workflow).length > 0 && (
                  <button
                    className="px-6 py-1 w-[109px] text-[20px] bg-[#0387FF] text-white cursor-pointer rounded-[6px]"
                    onClick={handleNext}
                  >
                    {step === steps.length - 1 ? "Create" : "Next"}
                  </button>
                )}
            </div>
          </div>
        </div>

        {campaignType === "sales-navigator" ? (
          <SalesNavigatorCampaign
            campaignName={campaignName}
            step={step}
            setStep={setStep}
            workflow={workflow}
            setWorkflow={setWorkflow}
          />
        ) : campaignType === "guided" ? (
          <GuidedCampaign
            campaignName={campaignName}
            step={step}
            setStep={setStep}
          />
        ) : campaignType === "csv-upload" ? (
          <CsvUploadCampaign
            campaignName={campaignName}
            step={step}
            setStep={setStep}
          />
        ) : campaignType === "existing-connections" ? (
          <ExistingConnectionsCampaign
            campaignName={campaignName}
            step={step}
            setStep={setStep}
          />
        ) : campaignType === "custom-setup-linkedin-sales-navigator" ? (
          <LinkedInSalesNavigator
            campaignName={campaignName}
            step={step}
            setStep={setStep}
          />
        ) : campaignType === "custom-setup-linkedin-premium" ? (
          <LinkedInPremium
            campaignName={campaignName}
            step={step}
            setStep={setStep}
          />
        ) : (
          <>
            {step == 0 ? (
              <div className="mt-6">
                <SelectWorkflow
                  onSelect={handleWorkflowSelect}
                  onCreate={setWorkflow}
                />
              </div>
            ) : (
              <div className="p-6 max-w-[500px] mx-auto">
                <div className="mb-7 relative">
                  <input
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    type="text"
                    id="campaignName"
                    className="w-full border border-[#7E7E7E] rounded-[4px] font-[urbanist] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0 placeholder-transparent"
                    placeholder="Campaign Name *"
                  />
                  {!campaignName && (
                    <label
                      htmlFor="campaignName"
                      className="absolute left-3 top-2 text-sm pointer-events-none text-[#6D6D6D] font-[urbanist]"
                    >
                      Campaign Name <span className="text-[#D80039]">*</span>
                    </label>
                  )}
                </div>

                <div className="space-y-7">
                  {campaignOptions.map(option => (
                    <div
                      key={option.id}
                      className={`border border-[#7E7E7E]  rounded-[4px] bg-white p-4 ${
                        option.subOptions ? "" : "cursor-pointer"
                      }`}
                      onClick={() => handleSelect(option.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-full">
                          <h2 className="text-[20px] font-urbanist font-semibold text-[#0387ff]">
                            {option.title}
                          </h2>
                          <p className="text-[16px] text-[#6D6D6D] mt-1">
                            {option.description}
                          </p>

                          {option.subOptions && (
                            <div className="mt-4 grid grid-cols-1 gap-2">
                              {option.subOptions.map(sub => (
                                <div
                                  key={sub.id}
                                  className={`flex items-center justify-end gap-10 px-3 py-1 bg-white cursor-pointer transition-all ${
                                    hoveredSub === sub.id ? "bg-gray-50" : ""
                                  }`}
                                  onMouseEnter={() => setHoveredSub(sub.id)}
                                  onMouseLeave={() => setHoveredSub(null)}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSelect(sub.id);
                                  }}
                                >
                                  <span className="text-[16px] text-[#0387ff] font-normal">
                                    {sub.label}
                                  </span>
                                  <RightArrowIcon
                                    className={`w-4 h-4 ${
                                      hoveredSub === sub.id
                                        ? "fill-[#00B4D8]"
                                        : "fill-[#6D6D6D]"
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {!option.subOptions && (
                          <RightArrowIcon className="w-7 h-7 fill-[#6D6D6D] hover:fill-[#00B4D8]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
