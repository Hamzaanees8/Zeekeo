import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
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
import { campaignOptions } from "../../../utils/campaign-helper";
import { Helmet } from "react-helmet";
import useCampaignStore from "../../stores/useCampaignStore";
import ExistingConnectionsCampaign from "./components/ExistingConnectionsCampaign.jsx";

export const CreateCampaign = () => {
  const {
    campaignName,
    campaignType,
    setCampaignName,
    setCampaignType,
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
  const [showWorkflows, setShowWorkflows] = useState(true);
  const [totalSteps, setTotalSteps] = useState(6);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (Object.keys(workflow).length === 0) setShowWorkflows(true);
  }, [workflow]);

  const handleWorkflowSelect = async workflow => {
    setWorkflow(workflow);
  };

  const handleSelect = id => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name first.");
      return;
    }
    setCampaignType(id);
  };

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

          {showWorkflows && (
            <button
              className="px-6 py-1 w-[109px] text-[20px] bg-[#0387FF] text-white cursor-pointer "
              onClick={() => setShowWorkflows(false)}
            >
              Next
            </button>
          )}
        </div>

        {!showWorkflows && !campaignType && (
          <button
            className="my-2 px-6 py-1 w-[109px] text-[20px] bg-[#7E7E7E] text-white cursor-pointer"
            onClick={resetCampaign}
          >
            Back
          </button>
        )}

        {campaignType === "sales-navigator" ? (
          <SalesNavigatorCampaign
            campaignName={campaignName}
            goBack={() => setCampaignType("")}
            step={step}
            setStep={setStep}
            setTotalSteps={setTotalSteps}
            workflow={workflow}
            setWorkflow={setWorkflow}
          />
        ) : campaignType === "guided" ? (
          <GuidedCampaign
            campaignName={campaignName}
            goBack={() => setCampaignType("")}
            step={step}
            setStep={setStep}
            setTotalSteps={setTotalSteps}
          />
        ) : campaignType === "csv-upload" ? (
          <CsvUploadCampaign
            campaignName={campaignName}
            goBack={() => setCampaignType("")}
            step={step}
            setStep={setStep}
            setTotalSteps={setTotalSteps}
          />
        ) : campaignType === "existing-connections" ? (
          <ExistingConnectionsCampaign
            campaignName={campaignName}
            goBack={() => setCampaignType("")}
            step={step}
            setStep={setStep}
            setTotalSteps={setTotalSteps}
          />
        ) : campaignType === "custom-setup-linkedin-sales-navigator" ? (
          <LinkedInSalesNavigator
            campaignName={campaignName}
            goBack={() => setCampaignType("")}
            step={step}
            setStep={setStep}
            setTotalSteps={setTotalSteps}
          />
        ) : campaignType === "custom-setup-linkedin-premium" ? (
          <LinkedInPremium
            campaignName={campaignName}
            goBack={() => setCampaignType("")}
            step={step}
            setStep={setStep}
            setTotalSteps={setTotalSteps}
          />
        ) : (
          <>
            {showWorkflows ? (
              <div className="mt-6">
                <SelectWorkflow onSelect={handleWorkflowSelect} />
              </div>
            ) : (
              <div className="p-6 max-w-[500px] mx-auto">
                <div className="mb-7 relative">
                  <input
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    type="text"
                    id="campaignName"
                    className="w-full border border-[#7E7E7E] font-[urbanist] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0 placeholder-transparent"
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
                      className={`border border-[#7E7E7E] bg-white p-4 ${
                        option.subOptions ? "" : "cursor-pointer"
                      }`}
                      onClick={() => handleSelect(option.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-full">
                          <h2 className="text-[20px] font-urbanist font-semibold text-[#04479C]">
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
                                  <span className="text-[16px] text-[#04479C] font-normal">
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
