import { Cross, NotificationIcon } from "./Icons";

export default function NotificationModal({ onClose }) {
  const notifications = [
    {
      id: 1,
      title: "LinkedIn Post Scheduler",
      text: "We are very excited to announce our newest feature, which allows you to send and...",
    },
    {
      id: 2,
      title: "Create campaigns from LinkedIn Post Reactions!",
      text: "You can now create campaigns from profiles that have reacted to a LinkedIn Post...",
    },
    {
      id: 3,
      title: "Create campaigns from LinkedIn groups!",
      text: "Did you know you can message other LinkedIn group members providing that you are a...",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center "
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[450px] px-6 py-[8px] font-urbanist text-[#7E7E7E] font-normal rounded-[8px] shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-b-[#6D6D6D] py-2">
          <h2 className="text-[20px] font-semibold text-[#04479C] flex items-center gap-2">
            <NotificationIcon className="w-5 h-5" /> Notifications
          </h2>
          <button onClick={onClose}>
            <Cross className="w-6 h-6 text-[#04479C] fill-[#04479C] cursor-pointer" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto pt-1 pb-2 custom-scroll">
          {notifications.map(n => (
            <div
              key={n.id}
              className="border-b py-3 flex flex-col gap-1 last:border-none"
            >
              <div className="flex items-center gap-2">
                <span className="bg-[#16A37B] text-white text-[10px] font-[400] px-2 py-0.5 rounded-[4px]">
                  NEW
                </span>
                <span className="font-[600] text-[#7E7E7E]">{n.title}</span>
              </div>
              <p className="text-[#7E7E7E] text-[14px] leading-[130%]">
                {n.text}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t py-2 text-[11px] text-[#7E7E7E]">
          <span>Powered by Canny RSS</span>
          <a href="#" className="text-[#7E7E7E] cursor-pointer">
            See all changes
          </a>
        </div>
      </div>
    </div>
  );
}
