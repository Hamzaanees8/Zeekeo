import { Helmet } from "react-helmet";
import Blacklist from "../settings/components/Blacklist";

export const AgencyBlacklist = () => {


    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Zeekeo Launchpad - Blacklists</title>
            </Helmet>
            <div className="p-6 w-full pt-[64px] bg-[#EFEFEF]">
                <h1 className="text-[48px] font-urbanist text-[#6D6D6D] font-medium mb-6">
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
