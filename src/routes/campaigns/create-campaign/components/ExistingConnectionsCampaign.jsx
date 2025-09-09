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
  // StepWorkFlow,
  TargetAudience,
} from "../../../../components/Icons";
import DefineTargetAudience from "./DefineTargetAudience";
import useCampaignStore from "../../../stores/useCampaignStore";
import toast from "react-hot-toast";
import { areAllTemplatesAssigned } from "../../../../utils/campaign-helper";
import { useNavigate } from "react-router-dom";
import { createCampaign } from "../../../../services/campaigns";
import { getCurrentUser } from "../../../../utils/user-helpers";

const steps = [
  { label: "Define Target Audience", icon: <TargetAudience /> },
  { label: "Settings", icon: <StepSetting /> },
  { label: "Create Messages", icon: <StepMessages /> },
  { label: "Review", icon: <StepReview /> },
  { label: "Launch", icon: <StepRocket /> },
];
const ExistingConnectionsCampaign = ({
  campaign,
  goBack,
  step,
  setStep,
  setTotalSteps,
}) => {
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);

  const navigate = useNavigate();

  const { campaignName, filterFields, workflow, settings, resetCampaign } =
    useCampaignStore();

  const createCampaignHandler = async () => {
    const currentUser = getCurrentUser();
    const hasSchedule =
      currentUser?.settings?.schedule?.days &&
      Object.keys(currentUser.settings.schedule.days).length > 0;

    const campaignData = {
      campaign: {
        name: campaignName,
        source: {
          filter_api: "sales_navigator",
          filter_fields: filterFields,
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

  const hasAnySelection = Object.values(filterFields).some(val => {
    if (Array.isArray(val)) {
      return val.length > 0;
    }
    if (typeof val === "string") {
      return val.trim() !== "";
    }
    return false;
  });

  console.log("existing connection campaign...");
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

  useEffect(() => {
    setTotalSteps(steps.length);
  }, [setTotalSteps]);

  const handleToggle = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const [selectedActions, setSelectedActions] = useState([]);

  const handleAddAction = action => {
    setSelectedActions(prev => [...prev, action]);
  };

  return (
    <div className="p-6">
      <Stepper steps={steps} activeStep={step} />
      {!isEditingWorkflow && (
        <div className="flex justify-between mt-6">
          <button
            className="px-6 py-1 w-[109px] text-[20px] bg-[#7E7E7E] text-white cursor-pointer rounded-[6px]"
            onClick={step === 0 ? goBack : handleBack}
          >
            {step === 0 ? "Back" : "Back"}
          </button>
          <button
            className="px-6 py-1 w-[109px] text-[20px] bg-[#0387FF] text-white cursor-pointer rounded-[6px]"
            onClick={handleNext}
          >
            {step === 4 ? "Create" : "Next"}
          </button>
        </div>
      )}

      <div className="mt-6 ">
        {step === 0 && (
          <div className="w-full">
            <DefineTargetAudience product="existing_connections" />
          </div>
        )}
        {step === 1 && (
          <div className="w-[466px] place-self-center">
            <CampaignSetting />
          </div>
        )}

        {step === 2 && (
          <CreateMessages
            selectedActions={selectedActions}
            onAddAction={handleAddAction}
            isEditing={isEditingWorkflow}
            setIsEditing={setIsEditingWorkflow}
          />
        )}
        {step === 3 && <CreateReview />}
        {step === 4 && <Launch />}
      </div>
    </div>
  );
};

export default ExistingConnectionsCampaign;
