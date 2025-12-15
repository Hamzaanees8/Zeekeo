import React, { useEffect, useState } from "react";
import Stepper from "../components/Stepper";
import CampaignSetting from "./CampaignSetting";
import { useNavigate } from "react-router-dom";
import { div } from "framer-motion/client";
import CreateMessages from "./CreateMessages";
import Launch from "./Launch";
import {
  StepMessages,
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


const SalesNavigatorCampaign = ({
  workflow,
  setWorkflow,
  goBack,
  step,
  setStep,
}) => {
  const { campaignName, campaignType, searchUrl, settings, resetCampaign } =
    useCampaignStore();
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);

  return (
    <div className="p-6">

      <div className="mt-6 ">
        {step === 2 && (
          <div className="w-[466px] place-self-center">
            <CampaignSetting />
          </div>
        )}
        {step === 3 && <CreateMessages />}
        {step === 4 && (
          <Launch workflow={workflow} setWorkflow={setWorkflow} />
        )}
      </div>
    </div>
  );
};

export default SalesNavigatorCampaign;
