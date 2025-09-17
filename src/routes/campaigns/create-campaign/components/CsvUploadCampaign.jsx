import { useEffect, useState } from "react";
import Stepper from "../components/Stepper";
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
import UploadCsv from "./UploadCsv";
import useCampaignStore from "../../../stores/useCampaignStore";
import toast from "react-hot-toast";
import { areAllTemplatesAssigned } from "../../../../utils/campaign-helper";
import { createCampaign } from "../../../../services/campaigns";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../../../utils/user-helpers";

const CsvUploadCampaign = ({
  campaign,
  goBack,
  step,
  setStep,
}) => {
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);

  const { campaignName, profileUrls, workflow, settings, resetCampaign } =
    useCampaignStore();


  const [selectedActions, setSelectedActions] = useState([]);

  const handleAddAction = action => {
    setSelectedActions(prev => [...prev, action]);
  };

  return (
    <div className="p-6">

      <div className="mt-6 ">
        {step === 2 && (
          <div className="w-full">
            <UploadCsv />
          </div>
        )}
        {step === 3 && (
          <div className="w-[466px] place-self-center">
            <CampaignSetting />
          </div>
        )}
        {step === 4 && (
          <CreateMessages
            selectedActions={selectedActions}
            onAddAction={handleAddAction}
            isEditing={isEditingWorkflow}
            setIsEditing={setIsEditingWorkflow}
          />
        )}
        {step === 5 && <CreateReview />}
        {step === 6 && <Launch />}
      </div>
    </div>
  );
};

export default CsvUploadCampaign;
