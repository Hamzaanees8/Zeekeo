import React from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { CircleCross, Cross } from "../../../components/Icons";

const SignatureEditorModal = ({ onClose, data }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[700px] h-[457px] !pt-[76px] p-6 relative rounded-[8px] shadow-md">
        <button
          className="absolute top-5 right-5 text-2xl font-bold cursor-pointer"
          onClick={onClose}
        >
          <Cross />
        </button>
        {/* <h2 className="text-xl font-bold text-blue-700 mb-4">Edit Signature</h2> */}

        <label className="block mb-2 text-[16px] text-[#7E7E7E] font-urbanist">
          Sender Settings
        </label>

        <SunEditor
          defaultValue={data?.signature || "Custom Signature"}
          setOptions={{
            minHeight: "225px",
            buttonList: [
              ["undo", "redo"],
              ["formatBlock", "bold", "italic", "link", "align", "list"],
              ["list", "lineHeight"],
              ["link", "image", "video"],
              ["codeView"],
            ],
          }}
        />

        <div className="flex justify-end mt-4">
          <button
            className="bg-[#0387FF] text-white px-5 py-1 text-sm cursor-pointer rounded-[4px]"
            onClick={onClose}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureEditorModal;
