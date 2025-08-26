const InvoiceModal = ({ invoiceUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="w-[950px] bg-[#0077B6]">
        <div className="border-t border-[#000] border-x">
          <div className="flex justify-end items-center py-2 px-[14px] bg-white ">
            <button onClick={onClose} className="cursor-pointer">
              ✕
            </button>
          </div>
        </div>
        <div className="bg-[#0077B6] w-full flex items-center justify-center h-[80vh] overflow-y-auto">
          <div className="w-[560px] h-[490px] bg-white">
            <iframe
              src={invoiceUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
