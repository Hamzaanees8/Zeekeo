import React, { useState } from "react";
import { sampleVariablesList, sampleRecipients } from "../../../../utils/Preview-helpers";
import { CrossIcon, Ellipsis, Minimize } from "../../../../components/Icons";

const PreviewMessage = ({ open, onClose, message = "", subject = "", category = "" }) => {
  if (!open) return null;

  const [selectedIndex, setSelectedIndex] = useState(0);

  const replaceVariablesForRecipient = (text, idx) => {
    if (!text) return "";
    const replacements = sampleVariablesList[idx] || sampleVariablesList[0] || {};

    let replaced = text;
    Object.keys(replacements).forEach((token) => {
      const value = replacements[token] ?? "";
      replaced = replaced.split(token).join(value);
    });
    return replaced;
  };

  const recipient = sampleRecipients[selectedIndex] || {};

  const rendered = (() => {
    if (!message) return <div className="text-[#6D6D6D]">No message to preview.</div>;

    const replaced = replaceVariablesForRecipient(message, selectedIndex);

    if (category === "email_message") {
      return (
        <div
          className="prose max-w-full text-[#6D6D6D]"
          dangerouslySetInnerHTML={{ __html: replaced }}
        />
      );
    }

    return (
      <div className="whitespace-pre-wrap text-[14px] break-words text-[#000000e6]">{replaced}</div>
    );
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" >
      <div className="absolute inset-0  opacity-40" onClick={onClose} style={{ backgroundColor: 'rgba(69, 69, 69, 0.4)' }} />
      <div className="relative bg-white  max-w-5xl p-4 rounded shadow-lg border border-[#7E7E7E]">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-[#0387FF]">Preview Sequence</h3>
          <button onClick={onClose} className="text-2xl text-[#6D6D6D] leading-none">&times;</button>
        </div>

        <div className="flex gap-6">
          <div className=" flex-shrink-0">
            {sampleRecipients.map((r, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-full text-left mb-2 px-3 py-2 rounded-2xl border-[#ccc] flex items-center gap-3 ${idx === selectedIndex ? 'bg-[#ccc]' : 'bg-white'} border`}
              >
                <div className="w-10 h-10 rounded-full bg-[#E8E8E8] flex items-center justify-center text-sm">
                  {r.name.split(' ')[0][0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#0387FF]">{r.name}</div>
                  <div className="text-xs text-[#6D6D6D]">{r.company}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="border rounded-[8px] border-[#ccc] w-[400px]" >
            <div className="flex justify-between px-4 py-2">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-[#E8E8E8] flex items-center justify-center text-sm text-[#0387FF] font-semibold">
                  {recipient.name ? recipient.name.split(" ")[0][0] : "R"}
                </div>

                <div className="flex flex-col">
                  <div className="text-base text-[14px]  text-[#0A66C2]">{recipient.name || "Recipient"}</div>
                  <div className="mb-2 text-xs text-[#6D6D6D]"> 1 hour</div>
                </div>
              </div>
              <div className="flex gap-0 items-center">
                <Ellipsis className="w-8 h-8 p-2 rounded-full text-[#000000BF] hover:bg-[#8c8c8c1a]" />
                <Minimize className="w-8 h-8 p-2 rounded-full text-[#000000BF]  hover:bg-[#8c8c8c1a]" />
                <CrossIcon className="w-8 h-8 p-2 rounded-full text-[#000000BF]  hover:bg-[#8c8c8c1a]" />
              </div>
            </div>
            <div className="overflow-y-scroll max-h-[50vh] custom-scroll1">
              <div className="flex flex-col items-start gap-2 p-4 border-t border-[#ccc]">
                <div className="w-18 h-18 rounded-full bg-[#E8E8E8] flex items-center justify-center text-sm text-[#0387FF] font-semibold">
                  {recipient.name ? recipient.name.split(" ")[0][0] : "R"}
                </div>

                <div className="flex flex-col pl-2">
                  <div className="text-base text-[14px]  text-[#0A66C2]">{recipient.name || "Recipient"}</div>
                  <div className="mb-2 text-xs text-[#6D6D6D]">Experience | Role</div>
                </div>
              </div>

              <div className=" min-h-[48vh] border-t border-[#ccc] p-4  relative">
                <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-10 px-4 text-[12px] text-[#00000099] bg-white rounded">Feb 24</div>
                <div className="mx-0  bg-white ">
                  <div className=" text-[#172b4d] ">
                    {rendered}
                  </div>
                </div>
              </div></div>
          </div>
        </div>

        {/* <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-[#0387FF] text-white rounded">Close</button>
        </div> */}
      </div>
    </div>
  );
};

export default PreviewMessage;
