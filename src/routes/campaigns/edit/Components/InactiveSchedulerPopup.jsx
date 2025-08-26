import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { addMonths, subMonths } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Cross, DeleteIcon, PencilIcon } from "../../../../components/Icons";
import "../index.css";

const InactiveSchedulerPopup = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date("2025-07-24"),
      endDate: new Date("2025-07-24"),
      key: "selection",
    },
  ]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [inactiveRanges, setInactiveRanges] = useState([
    {
      title: "Summer Break",
      from: "2025-07-24",
      to: "2025-07-24",
    },
  ]);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleSave = () => {
    const { startDate, endDate } = dateRange[0];
    if (title && startDate && endDate) {
      const newEntry = {
        title,
        from: startDate.toISOString().split("T")[0],
        to: endDate.toISOString().split("T")[0],
      };

      if (editingIndex !== null) {
        const updated = [...inactiveRanges];
        updated[editingIndex] = newEntry;
        setInactiveRanges(updated);
        setEditingIndex(null);
      } else {
        setInactiveRanges([...inactiveRanges, newEntry]);
      }

      // Reset form
      setTitle("");
      setDateRange([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: "selection",
        },
      ]);
    }
  };
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

  const handleDelete = index => {
    const updated = [...inactiveRanges];
    updated.splice(index, 1);
    setInactiveRanges(updated);
  };

  const handleMonthChange = direction => {
    setCurrentMonth(prev =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1),
    );
  };
  

  return (
    <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 shadow-lg w-[500px] max-h-[95vh] border border-[#7E7E7E] overflow-auto">
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
        <div className="flex flex-col">
          <div className="font-urbanist text-[16px] text-[#7E7E7E] font-medium mb-2">
            Add Inactive Period
          </div>
          <input
            className="w-full border border-[#7E7E7E] text-[#7E7E7E] px-3 py-2 mb-4 text-urbanist text-[16px]"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-6 justify-center text-center">
          <DateRange
            editableDateInputs={false}
            onChange={item => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            showMonthAndYearPickers={false}
            months={1}
            direction="horizontal"
            showDateDisplay={false}
            staticRanges={[]}
            inputRanges={[]}
            calendarFocus="forwards"
            shownDate={currentMonth}
            className="InactiveCalendar"
          />
        </div>

        <div className="mb-4">
          <h4 className="text-[#7E7E7E] font-urbanist text-[16px] mb-3">
            Inactive Ranges
          </h4>
          <table className="w-full text-[12px] text-[#7E7E7E] ">
            <thead>
              <tr className="">
                <th className="text-left py-1 font-[400]">Title</th>
                <th className="text-left font-[400]">Date From</th>
                <th className="text-left font-[400]">Date To</th>
                <th className="text-left font-[400]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inactiveRanges.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1">{item.title}</td>
                  <td>{item.from}</td>
                  <td>{item.to}</td>
                  <td>
                    <button
                      className="border border-[#12D7A8] mr-2 p-[2px]"
                      onClick={() => handleEdit(idx)}
                    >
                      <PencilIcon className="w-4 h-4 fill-[#12D7A8]" />
                    </button>
                    <button
                      className="border border-[#D80039] p-[2px]"
                      onClick={() => handleDelete(idx)}
                    >
                      <DeleteIcon className="w-4 h-4" />
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
            className="bg-[#7E7E7E] text-white px-4 py-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#0387FF] text-white px-6 py-1"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactiveSchedulerPopup;
