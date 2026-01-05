import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Cross, DeleteIcon, PencilIcon } from "../../../../components/Icons";
import DeleteModal from "./DeleteModal";
import "../index.css";

const InactiveSchedulerPopup = ({ onClose, ranges, onSave }) => {
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [inactiveRanges, setInactiveRanges] = useState(ranges || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState(null);


  const handleEdit = index => {
    const item = inactiveRanges[index];
    setTitle(item.title);
    setDateRange([
      {
        startDate: new Date(item.from),
        endDate: new Date(item.to),
        key: "selection",
      },
    ]);
    setEditingIndex(index);
  };

  const handleDeleteClick = index => {
    setIndexToDelete(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (indexToDelete !== null) {
      const updated = [...inactiveRanges];
      updated.splice(indexToDelete, 1);
      setInactiveRanges(updated);
      onSave(updated); // Save to backend
      onClose(); // Close the scheduler popup as requested
    }
  };


  

  return (
    <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 shadow-lg w-[500px] max-h-[95vh] border border-[#7E7E7E] overflow-y-auto rounded-[12px] custom-scroll1">
        <div className="flex justify-between items-center mb-4">
            
          <h2 className="text-[#04479C] font-semibold font-urbanist text-[20px]">
            Inactive Scheduler
          </h2>
          <button
            onClick={onClose}
            className="text-lg font-bold text-[#323232] cursor-pointer"
          >
            <Cross />
          </button>
        </div>
        <div className="font-urbanist text-[16px] text-[#7E7E7E] font-medium mb-2">
          {editingIndex !== null ? "Update Inactive Period" : "Add Inactive Period"}
        </div>
        <input
          className="w-full border border-[#7E7E7E] text-[#7E7E7E] px-3 py-2 mb-4 text-urbanist text-[16px] focus:outline-none"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="mb-6 flex justify-center w-full">
          <DateRange
            editableDateInputs={false}
            onChange={(item) => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            showMonthAndYearPickers={false}
            months={1}
            direction="horizontal"
            className="InactiveCalendar custom-date-range"
          />
        </div>

        <div className="mb-4">
          <h4 className="text-[#7E7E7E] font-urbanist text-[16px] mb-3">
            Inactive Ranges
          </h4>
          <table className="w-full text-[14px] text-[#323232] ">
            <thead className="bg-[#F8F9FA]">
              <tr className="">
                <th className="text-left py-2 px-3 font-[600]">Title</th>
                <th className="text-left py-2 font-[600]">Date From</th>
                <th className="text-left py-2 font-[600]">Date To</th>
                <th className="text-left py-2 font-[600]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inactiveRanges.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3">{item.title}</td>
                  <td className="py-2">{format(new Date(item.from), "yyyy-MM-dd")}</td>
                  <td className="py-2">{format(new Date(item.to), "yyyy-MM-dd")}</td>
                  <td className="py-2">
                    <button
                      className="hover:scale-110 transition-transform mr-2 cursor-pointer"
                      onClick={() => handleEdit(idx)}
                    >
                      <PencilIcon className="w-5 h-5 fill-[#12D7A8]" />
                    </button>
                    <button
                      className="hover:scale-110 transition-transform cursor-pointer"
                      onClick={() => handleDeleteClick(idx)}
                    >
                      <DeleteIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-[#7E7E7E] text-white px-4 py-1 cursor-pointer rounded-[4px]"
          >
            Close
          </button>
          <button
            onClick={() => {
              let updatedRanges = [...inactiveRanges];
              
              if (title.trim()) {
                const { startDate, endDate } = dateRange[0];
                const newEntry = {
                  title: title.trim(),
                  from: startDate.toISOString(),
                  to: endDate.toISOString(),
                };
                
                if (editingIndex !== null) {
                  updatedRanges[editingIndex] = newEntry;
                  setEditingIndex(null);
                } else {
                  updatedRanges.push(newEntry);
                }
                
                setInactiveRanges(updatedRanges);
                
                // Reset form for next entry
                setTitle("");
                setDateRange([
                  {
                    startDate: new Date(),
                    endDate: new Date(),
                    key: "selection",
                  },
                ]);
              }
              
              // Persist the entire list to the backend
              onSave(updatedRanges);
              // Modal stays open to allow adding more ranges
            }}
            className="bg-[#0387FF] text-white px-6 py-1 cursor-pointer rounded-[4px]"
          >
            Save
          </button>
        </div>
      </div>
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onClick={confirmDelete}
          message="Are you sure you want to delete this inactive period? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default InactiveSchedulerPopup;
