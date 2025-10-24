import { useEffect, useState } from "react";
import Stepper from "./Stepper";
import CampaignSetting from "./CampaignSetting";
import SelectWorkflow from "../../../../components/workflow/SelectWorkflow";
import CreateMessages from "./CreateMessages";
import CreateReview from "./CreateReview";
import Launch from "./Launch";
import {
  StepMessages,
  StepReview,
  StepRocket,
  StepSetting,
  StepWorkFlow,
  // StepWorkFlow,
  Upload,
} from "../../../../components/Icons";
import useCampaignStore from "../../../stores/useCampaignStore";
import toast from "react-hot-toast";
import { areAllTemplatesAssigned } from "../../../../utils/campaign-helper";
import { createCampaign, getCampaigns } from "../../../../services/campaigns";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../../../utils/user-helpers";
import RetargetCampaignSettings from "./RetargetCampaignSettings";

const RetargetCampaign = ({
  campaign,
  goBack,
  step,
  setStep,
}) => {
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);

  const { campaignName, profileUrls, workflow, settings, resetCampaign } =
    useCampaignStore();
  const [campaigns, setCampaigns] = useState([]);

  const [selectedActions, setSelectedActions] = useState([]);
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getCampaigns();

        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
        if (err?.response?.status !== 401) {
          toast.error("Failed to fetch campaigns");
        }
      }
    };

    fetchCampaigns();
  }, []);

  console.log("campaigns...", campaigns);

  const handleAddAction = action => {
    setSelectedActions(prev => [...prev, action]);
  };

  return (
    <div className="p-6">

      <div className="mt-6 ">
        {step === 2 && (
          <div className="w-[496px] place-self-center">
            <RetargetCampaignSettings campaigns={campaigns} />
          </div>
        )}
        {step === 3 && (
          <CreateMessages
            selectedActions={selectedActions}
            onAddAction={handleAddAction}
            isEditing={isEditingWorkflow}
            setIsEditing={setIsEditingWorkflow}
          />
        )}
        {step === 4 && <CreateReview />}
        {step === 5 && <Launch />}
      </div>
    </div>
  );
};

export default RetargetCampaign;
