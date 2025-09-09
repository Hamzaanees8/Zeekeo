import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { isValidURL } from "../../../../utils/campaign-helper";
import useCampaignStore from "../../../stores/useCampaignStore";

const UploadCsv = () => {
  const { profileUrls, setProfileUrls } = useCampaignStore();
  const [droppedFile, setDroppedFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [textareaValue, setTextareaValue] = useState("");
  const fileInputRef = useRef(null);

  const handleDrop = e => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setDroppedFile(file);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleFileSelect = e => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      toast.error("Only CSV files are allowed.");
      return;
    }
    setSelectedColumn("");
    processCSVFile(selectedFile);
  };

  const processCSVFile = file => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const parsedData = results.data;
        if (parsedData.length === 0) {
          toast.error("CSV file is empty or invalid.");
          return;
        }
        setDroppedFile(file);

        const columnNames = Object.keys(parsedData[0]);
        setColumns(columnNames);
        setCsvRows(parsedData); // save entire data for column-based URL extraction
      },
      error: err => {
        toast.error("Error reading CSV file.");
        console.error(err);
      },
    });
  };

  const removeFile = () => {
    setDroppedFile(null);
    setColumns([]);
    setSelectedColumn("");
    setCsvRows([]);
    setProfileUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleTextareaChange = e => {
    const value = e.target.value;
    setTextareaValue(value);

    const urls = value
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");
    handleValidUrls(urls);
  };

  const handleValidUrls = urls => {
    const uniqueValidUrls = [...new Set(urls.filter(isValidURL))];
    if (uniqueValidUrls.length === 0) {
      toast.error("No valid URLs found");
      return false;
    }
    setProfileUrls(uniqueValidUrls);
    toast.success(`${uniqueValidUrls.length} valid URL(s) added`);
    return true;
  };

  const handleColumnSelect = e => {
    const column = e.target.value;
    setSelectedColumn(column);

    if (!column || !csvRows.length) return;

    const urls = csvRows.map(row => row[column]?.trim()).filter(url => !!url);

    const valid = handleValidUrls(urls);
    if (valid) setTextareaValue("");
  };

  useEffect(() => {
    // You can lift profileUrls up or sync it with a parent via props if needed
    console.log("Profile URLs updated: ", profileUrls);
  }, [profileUrls]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-[#6D6D6D] text-sm">
      {/* Paste URL Box */}
      <textarea
        type="text"
        placeholder="Paste URLs (one per line)"
        className="w-full max-w-md border border-[#C7C7C7] px-3 py-2 h-50 bg-white rounded-[4px]"
        value={textareaValue}
        onChange={handleTextareaChange}
      />

      <div className="text-[#6D6D6D] font-medium">Or</div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full max-w-md bg-[#D9EFFF] rounded-[4px] border border-dashed border-[#0387FF] flex flex-col items-center justify-center py-12 px-6 space-y-4"
      >
        <div className="text-[#6D6D6D] text-lg">Drop Files Here</div>
        <label className="bg-white border border-[#C7C7C7] px-4 py-1 text-[#6D6D6D] cursor-pointer rounded-[4px]">
          Select Files
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            ref={fileInputRef}
            accept=".csv"
          />
        </label>

        {droppedFile && (
          <ul className="text-xs mt-2 text-center space-y-1 w-full">
            <li className="flex justify-between items-center bg-white px-3 py-1 border border-[#C7C7C7] text-left">
              <span className="truncate w-full">{droppedFile.name}</span>
              <button
                onClick={() => removeFile()}
                className="ml-2 text-[#D80039] text-sm font-bold hover:text-red-700"
                title="Remove"
              >
                ✕
              </button>
            </li>
          </ul>
        )}
      </div>

      {/* Label and Select Dropdown */}
      {columns.length > 0 && (
        <div className="w-full max-w-md flex items-center justify-between gap-3 px-10">
          <label className="text-[#6D6D6D] text-sm min-w-fit">
            Profile URL
          </label>
          <select
            value={selectedColumn}
            onChange={handleColumnSelect}
            className="w-8/12 border border-[#C7C7C7] px-3 py-2 bg-white text-sm"
          >
            <option value="">-- Select --</option>
            {columns.map((col, idx) => (
              <option key={idx} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default UploadCsv;
