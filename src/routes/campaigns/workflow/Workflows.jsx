import React from "react";
import { Helmet } from "react-helmet";
import SelectWorkflow from "../../../components/workflow/SelectWorkflow";
import { isWhitelabelDomain } from "../../../utils/whitelabel-helper";

const Workflows = () => {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{isWhitelabelDomain() ? "Workflows" : "Zeekeo Launchpad - Workflows"}</title>
      </Helmet>
      <div className="w-full px-[30px] py-[70px]" style={{ backgroundColor: 'var(--page-bg-color, #EFEFEF)' }}>
        <p className="text-[48px] font-urbanist text-grey-medium font-medium mb-[60px]">
          Workflows
        </p>
        <SelectWorkflow />
      </div>
    </>
  );
};

export default Workflows;
