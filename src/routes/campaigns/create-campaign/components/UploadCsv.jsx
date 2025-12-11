import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { isValidURL } from "../../../../utils/campaign-helper";
import useCampaignStore from "../../../stores/useCampaignStore";

const UploadCsv = () => {
  const { profileUrls, setProfileUrls, customFields, setCustomFields } =
    useCampaignStore();
  const [droppedFile, setDroppedFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedCustomColumns, setSelectedCustomColumns] = useState({
    custom1: "",
    custom2: "",
    custom3: "",
  });
  const [csvRows, setCsvRows] = useState([]);
  const [textareaValue, setTextareaValue] = useState("");
  const fileInputRef = useRef(null);

  // Track if we should show success messages
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);

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
    setSelectedCustomColumns({
      custom1: "",
      custom2: "",
      custom3: "",
    });
    setHasShownSuccess(false);
    setIsInitialLoad(true);
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
        setCsvRows(parsedData);
        setIsInitialLoad(false);
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
    setSelectedCustomColumns({
      custom1: "",
      custom2: "",
      custom3: "",
    });
    setCsvRows([]);
    setProfileUrls([]);
    setCustomFields([]);
    setHasShownSuccess(false);
    setIsInitialLoad(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    toast.success("File removed successfully");
  };

  const handleTextareaChange = e => {
    const value = e.target.value;
    setTextareaValue(value);

    const urls = value
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");

    if (urls.length > 0) {
      handleValidUrls(urls, [], "text");
    } else {
      // Clear data if textarea is empty
      setProfileUrls([]);
      setCustomFields([]);
    }
  };

  const handleValidUrls = (urls, customData = [], source = "csv") => {
    const validUrlsWithIndices = urls
      .map((url, index) => ({ url, index, isValid: isValidURL(url) }))
      .filter(item => item.isValid);

    if (validUrlsWithIndices.length === 0) {
      if (source === "text" && urls.length > 0) {
        toast.error("No valid URLs found in the text");
      } else if (source === "csv" && !isInitialLoad) {
        toast.error("No valid URLs found in the selected column");
      }
      return false;
    }

    const uniqueValidUrls = [
      ...new Set(validUrlsWithIndices.map(item => item.url)),
    ];

    const validCustomFields = validUrlsWithIndices.map(item => {
      const originalIndex = item.index;
      return customData[originalIndex] || null;
    });

    setProfileUrls(uniqueValidUrls);
    setCustomFields(validCustomFields);

    // Only show success message under certain conditions
    if (!hasShownSuccess || source === "text") {
      const customFieldsCount = validCustomFields.filter(
        f => f !== null,
      ).length;
      let message = `${uniqueValidUrls.length} valid URL(s) added`;

      if (customFieldsCount > 0) {
        message += ` with ${customFieldsCount} custom field${
          customFieldsCount === 1 ? "" : "s"
        }`;
      }

      toast.success(message);
      setHasShownSuccess(true);
    }

    return true;
  };

  const handleColumnSelect = e => {
    const column = e.target.value;
    setSelectedColumn(column);

    if (!column || !csvRows.length) return;

    const urls = csvRows.map(row => row[column]?.trim()).filter(url => !!url);

    // Extract custom field values
    const customData = csvRows.map(row => {
      const fields = {};

      if (
        selectedCustomColumns.custom1 &&
        row[selectedCustomColumns.custom1]?.trim()
      ) {
        fields["0"] = row[selectedCustomColumns.custom1].trim();
      }
      if (
        selectedCustomColumns.custom2 &&
        row[selectedCustomColumns.custom2]?.trim()
      ) {
        fields["1"] = row[selectedCustomColumns.custom2].trim();
      }
      if (
        selectedCustomColumns.custom3 &&
        row[selectedCustomColumns.custom3]?.trim()
      ) {
        fields["2"] = row[selectedCustomColumns.custom3].trim();
      }

      return Object.keys(fields).length > 0 ? fields : null;
    });

    const valid = handleValidUrls(urls, customData, "csv");
    if (valid) {
      setTextareaValue("");
    }
  };

  const handleCustomColumnSelect = (fieldName, column) => {
    const updatedSelections = {
      ...selectedCustomColumns,
      [fieldName]: column,
    };
    setSelectedCustomColumns(updatedSelections);

    // If profile URL column is already selected, update the data
    if (selectedColumn && csvRows.length > 0) {
      const urls = csvRows
        .map(row => row[selectedColumn]?.trim())
        .filter(url => !!url);

      // Extract custom field values with updated selections
      const customData = csvRows.map(row => {
        const fields = {};

        if (
          updatedSelections.custom1 &&
          row[updatedSelections.custom1]?.trim()
        ) {
          fields["0"] = row[updatedSelections.custom1].trim();
        }
        if (
          updatedSelections.custom2 &&
          row[updatedSelections.custom2]?.trim()
        ) {
          fields["1"] = row[updatedSelections.custom2].trim();
        }
        if (
          updatedSelections.custom3 &&
          row[updatedSelections.custom3]?.trim()
        ) {
          fields["2"] = row[updatedSelections.custom3].trim();
        }

        return Object.keys(fields).length > 0 ? fields : null;
      });

      handleValidUrls(urls, customData, "csv");
    } else {
      // If no profile URL selected yet, just show info
      if (column) {
        toast.success(
          `Custom Field ${fieldName.replace(
            "custom",
            "",
          )} selected: ${column}`,
          {
            duration: 2000,
          },
        );
      }
    }
  };

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

      {/* Column Selection Section */}
      {columns.length > 0 && (
        <div className="w-full max-w-md space-y-4 px-4">
          {/* Profile URL Selection */}
          <div className="flex items-center justify-between gap-3">
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

          {/* Custom Field 1 Selection */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-[#6D6D6D] text-sm min-w-fit">
              Custom Field 1
            </label>
            <select
              value={selectedCustomColumns.custom1}
              onChange={e =>
                handleCustomColumnSelect("custom1", e.target.value)
              }
              className="w-8/12 border border-[#C7C7C7] px-3 py-2 bg-white text-sm"
            >
              <option value="">-- Optional --</option>
              {columns.map((col, idx) => (
                <option key={`custom1-${idx}`} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Field 2 Selection */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-[#6D6D6D] text-sm min-w-fit">
              Custom Field 2
            </label>
            <select
              value={selectedCustomColumns.custom2}
              onChange={e =>
                handleCustomColumnSelect("custom2", e.target.value)
              }
              className="w-8/12 border border-[#C7C7C7] px-3 py-2 bg-white text-sm"
            >
              <option value="">-- Optional --</option>
              {columns.map((col, idx) => (
                <option key={`custom2-${idx}`} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Field 3 Selection */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-[#6D6D6D] text-sm min-w-fit">
              Custom Field 3
            </label>
            <select
              value={selectedCustomColumns.custom3}
              onChange={e =>
                handleCustomColumnSelect("custom3", e.target.value)
              }
              className="w-8/12 border border-[#C7C7C7] px-3 py-2 bg-white text-sm"
            >
              <option value="">-- Optional --</option>
              {columns.map((col, idx) => (
                <option key={`custom3-${idx}`} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadCsv;
