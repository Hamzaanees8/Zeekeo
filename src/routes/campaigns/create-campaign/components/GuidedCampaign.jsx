import { useEffect, useState } from "react";
import Stepper from "../components/Stepper";
import CampaignSetting from "./CampaignSetting";
import CreateMessages from "./CreateMessages";
import CreateReview from "./CreateReview";
import Launch from "./Launch";
import {
  StepMessages,
  StepReview,
  StepRocket,
  StepSetting,
  TargetAudience,
} from "../../../../components/Icons";
import DefineTargetAudience from "./DefineTargetAudience";
import useCampaignStore from "../../../stores/useCampaignStore";
import toast from "react-hot-toast";
import { areAllTemplatesAssigned } from "../../../../utils/campaign-helper";
import { useNavigate } from "react-router-dom";
import { createCampaign } from "../../../../services/campaigns";
import { getCurrentUser } from "../../../../utils/user-helpers";

const GuidedCampaign = ({
  campaign,
  goBack,
  step,
  setStep,
}) => {
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);

  const navigate = useNavigate();

  const { campaignName, filterFields, workflow, settings, resetCampaign } =
    useCampaignStore();



  const handleNext = () => {
    if (!workflow || Object.keys(workflow).length === 0) {
      toast.error("Please select workflow first.");
      navigate("/campaigns", { replace: true });
    }

    if (!hasAnySelection) {
      toast.error("Please select at least one filter before proceeding.");
      return; // stop next step
    }

    if (step == 2 && !areAllTemplatesAssigned(workflow)) {
      toast.error("Please assign template for all action nodes.");
      return;
    }

    if (step == 4) {
      console.log("final workflow", workflow);
      createCampaignHandler();
      return;
    }

    setStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="p-6">

      <div className="mt-6 ">
        {step === 2 && (
          <div className="w-full">
            <DefineTargetAudience product="guided" />
          </div>
        )}
        {step === 3 && (
          <div className="w-[466px] place-self-center">
            <CampaignSetting />
          </div>
        )}

        {step === 4 && <CreateMessages />}
        {step === 5 && <CreateReview />}
        {step === 6 && <Launch />}
      </div>
    </div>
  );
};

export default GuidedCampaign;
