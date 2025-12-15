import { useEffect, useState } from "react";
import Stepper from "../components/Stepper";
import CampaignSetting from "./CampaignSetting";
import SelectWorkflow from "../../../../components/workflow/SelectWorkflow";
import CreateMessages from "./CreateMessages";
import Launch from "./Launch";
import {
  Filters,
  StepMessages,
  StepRocket,
  StepSetting,
  // StepWorkFlow,
} from "../../../../components/Icons";
import DefineTargetAudience from "./DefineTargetAudience";
import FilterPreviewModal from "./FilterPreviewModal";
import useCampaignStore from "../../../stores/useCampaignStore";
import toast from "react-hot-toast";
import { areAllTemplatesAssigned } from "../../../../utils/campaign-helper";
import { useNavigate } from "react-router-dom";
import { createCampaign } from "../../../../services/campaigns";
import { getCurrentUser } from "../../../../utils/user-helpers";

const LinkedInPremium = ({ campaign, goBack, step, setStep }) => {
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const navigate = useNavigate();

  const { campaignName, filterFields, workflow, settings, resetCampaign } =
    useCampaignStore();

  const [selectedActions, setSelectedActions] = useState([]);
  const handleAddAction = action => {
    setSelectedActions(prev => [...prev, action]);
  };
  const user = getCurrentUser();
  const linkedin = user?.accounts?.linkedin;
  const VALID_ACCOUNT_STATUSES = [
    "OK",
    "SYNC_SUCCESS",
    "RECONNECTED",
    "CREATION_SUCCESS",
  ];

  const hasSalesNavigator =
    VALID_ACCOUNT_STATUSES.includes(linkedin?.status) &&
    linkedin?.data?.sales_navigator?.contract_id;
  return (
    <div className="p-6">
      <div className="mt-6">
        {step === 2 && (
          <div className="w-full">
            <DefineTargetAudience
              product="classic"
              filterApi={hasSalesNavigator ? "sales_navigator" : "classic"}
            />
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
        {step === 5 && <Launch />}
      </div>
      {/* {showPreviewModal && (
        <FilterPreviewModal
          onClose={() => setShowPreviewModal(false)}
          onCreate={() => {
            setShowPreviewModal(false);
            handleNext();
          }}
        />
      )} */}
    </div>
  );
};

export default LinkedInPremium;
