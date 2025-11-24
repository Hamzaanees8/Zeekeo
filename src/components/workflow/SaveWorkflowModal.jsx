import { useState } from "react";

const SaveWorkflowModal = ({ isOpen, onClose, onSave }) => {
  const [workflowName, setWorkflowName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workflowName.trim()) {
      onSave(workflowName.trim());
      setWorkflowName(""); // Clear input after submission
    }
  };

  return (
    // Basic modal overlay and content structure
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "400px",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Save Workflow As...</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Enter workflow name"
            required
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                marginRight: "10px",
                backgroundColor: "#eee",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#0387FF] text-white cursor-pointer rounded-[6px]"
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveWorkflowModal;