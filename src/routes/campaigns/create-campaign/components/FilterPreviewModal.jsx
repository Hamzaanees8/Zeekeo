import React from "react";
import { FilterProfile } from "../../../../components/Icons";
const FilterPreviewModal = ({ onClose, onCreate }) => {
  const mockProfiles = [
    {
      firstName: "Kelsey",
      lastName: "Joy",
      region: "London, Ontario",
      title: "Social Media Manager",
      company: "Google",
    },
    {
      firstName: "Bob",
      lastName: "Cardinal",
      region: "Calgary, Alberta",
      title: "Social Media Influencer",
      company: "Medisoo",
    },
    {
      firstName: "Dylan",
      lastName: "Crest",
      region: "Greater Vancouver Metropolitan Area",
      title: "Marketing Manager",
      company: "City of Vancouver",
    },
    {
      firstName: "Cressida",
      lastName: "Dejorden",
      region: "Greater Vancouver Metropolitan Area",
      title: "Marketing Manager",
      company: "City of Calgary",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center border border-[#7E7E7E]">
      <div className="bg-white w-full max-w-4xl shadow-lg p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#04479C] text-lg">Filter Preview</h2>
          <button
            onClick={onClose}
            className="text-xl  text-gray-600 cursor-pointer "
          >
            &times;
          </button>
        </div>

        <p className="flex text-[15px] text-[#6D6D6D] mb-4 gap-3 items-center">
          <FilterProfile />4 Profiles
        </p>

        <table className="w-full text-sm border-t border-[#7E7E7E]">
          <thead className="text-left text-[15px] text-[#6D6D6D]">
            <tr className="border-b ">
              <th className="py-2 px-2 font-normal">#</th>
              <th className="py-2 px-2 font-normal">Profile</th>
              <th className="py-2 px-2 font-normal">First Name</th>
              <th className="py-2 px-2 font-normal">Last Name</th>
              <th className="py-2 px-2 font-normal">Geo Region</th>
              <th className="py-2 px-2 font-normal">Title</th>
              <th className="py-2 px-2 font-normal">Company</th>
            </tr>
          </thead>
          <tbody>
            {mockProfiles.map((profile, idx) => (
              <tr
                key={idx}
                className="border-b border-[#7E7E7E] text-[#6D6D6D] hover:bg-[#f9f9f9] pt-1"
              >
                <td className="py-2 px-2">{idx + 1}</td>
                <td className="py-2 px-2 flex">
                  <span className="w-[35px] h-[35px] rounded-full bg-[#D9D9D9]"></span>
                </td>
                <td className="py-2 px-2">{profile.firstName}</td>
                <td className="py-2 px-2">{profile.lastName}</td>
                <td className="py-2 px-2">{profile.region}</td>
                <td className="py-2 px-2">{profile.title}</td>
                <td className="py-2 px-2">{profile.company}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-6">
          <button
            className="bg-[#7E7E7E] text-white px-6 py-2 text-sm cursor-pointer rounded-[4px]"
            onClick={onClose}
          >
            Back
          </button>
          <button
            className="bg-[#0387FF] text-white px-6 py-2 text-sm cursor-pointer rounded-[4px]"
            onClick={onCreate}
          >
            Create Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPreviewModal;
