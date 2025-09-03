import React, { useEffect, useState } from "react";
import Stepper from "../components/Stepper";
import CampaignSetting from "./CampaignSetting";
import { useNavigate } from "react-router-dom";
import { div } from "framer-motion/client";
import CreateMessages from "./CreateMessages";
import CreateReview from "./CreateReview";
import Launch from "./Launch";
import {
  StepMessages,
  StepReview,
  StepRocket,
  StepSetting,
  // StepWorkFlow,
} from "../../../../components/Icons";
import toast from "react-hot-toast";
import { createCampaign } from "../../../../services/campaigns";
import {
  areAllTemplatesAssigned,
  isValidURL,
  templateNodeTypes,
} from "../../../../utils/campaign-helper";
import useCampaignStore from "../../../stores/useCampaignStore";
import { getCurrentUser } from "../../../../utils/user-helpers";

const steps = [
  { label: "Settings", icon: <StepSetting /> },
  { label: "Create Messages", icon: <StepMessages /> },
  { label: "Review", icon: <StepReview /> },
  { label: "Launch", icon: <StepRocket /> },
];
const SalesNavigatorCampaign = ({
  workflow,
  setWorkflow,
  goBack,
  step,
  setStep,
  setTotalSteps,
}) => {
  const { campaignName, campaignType, searchUrl, settings, resetCampaign } =
    useCampaignStore();
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);

  const navigate = useNavigate();

  const createCampaignHandler = async () => {
    const currentUser = getCurrentUser();
    const hasSchedule =
      currentUser?.settings?.schedule?.days &&
      Object.keys(currentUser.settings.schedule.days).length > 0;
    const campaignData = {
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
    if (!searchUrl.trim()) {
      toast.error("Please enter the Search URL first.");
      return;
    } else if (!isValidURL(searchUrl)) {
      toast.error("Please enter valid Search URL.");
      return;
    }

    if (step == 1 && !areAllTemplatesAssigned(workflow)) {
      toast.error("Please assign template for all action nodes.");
      return;
    }

    if (step == 3) {
      console.log("final workflow", workflow);
      //      return;
      //console.log('creating campaign...')
      createCampaignHandler();
      return;
    }

    setStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

  useEffect(() => {
    setTotalSteps(steps.length);
  }, [setTotalSteps]);

  return (
    <div className="p-6">
      <Stepper steps={steps} activeStep={step} />

      {!isEditingWorkflow && (
        <div className="flex justify-between mt-6">
          <button
            className="px-6 py-1 w-[109px] text-[20px] bg-[#7E7E7E] text-white cursor-pointer"
            onClick={step === 0 ? goBack : handleBack}
          >
            {step === 0 ? "Back" : "Back"}
          </button>
          <button
            className="px-6 py-1 w-[109px] text-[20px] bg-[#0387FF] text-white cursor-pointer"
            onClick={handleNext}
          >
            {step === 3 ? "Create" : "Next"}
          </button>
        </div>
      )}

      <div className="mt-6 ">
        {step === 0 && (
          <div className="w-[466px] place-self-center">
            <CampaignSetting />
          </div>
        )}
        {step === 1 && <CreateMessages />}
        {step === 2 && (
          <CreateReview workflow={workflow} setWorkflow={setWorkflow} />
        )}
        {step === 3 && (
          <Launch workflow={workflow} setWorkflow={setWorkflow} />
        )}
      </div>
    </div>
  );
};

export default SalesNavigatorCampaign;
