import { Helmet } from "react-helmet";
import Blacklist from "../settings/components/Blacklist";
import { useAgencySettingsStore } from "../../stores/useAgencySettingsStore";
import { isWhitelabelDomain } from "../../../utils/whitelabel-helper";

export const AgencyBlacklist = () => {
const { background, textColor } = useAgencySettingsStore();

    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{isWhitelabelDomain() ? "Blacklists" : "Zeekeo Launchpad - Blacklists"}</title>
            </Helmet>
            <div className="p-6 w-full pt-[64px]" style={{ backgroundColor: background || "#EFEFEF" }}>
                <h1 className="text-[48px] font-urbanist font-medium mb-6" style={{ color: textColor || "#6D6D6D" }}>
                    Blacklists
                </h1>
                <div className='h-[calc(100vh-190px)] min-h-[750px] max-h-[800px]'>
                    <Blacklist />
                </div>
            </div>
        </>
    );
};

export default AgencyBlacklist;
