const NodeRow = ({ name, count, max }) => {
  const percentage = max > 0 ? (count / max) * 100 : 0;
  const progressBarColor =
    percentage === 100 ? "bg-[#0387ff]" : "bg-[#0387ff]"; // Keep blue for now, but could be conditional

  return (
    <div className="grid grid-cols-[350px_175px_175px_115px] font-normal text-base items-center py-2.5">
      <div className="text-left">{name}</div>
      <div className="text-center">{count}</div>
      <div className="text-center">{max}</div>
      <div className="flex justify-center items-center">
        <div className="w-[112px] h-5 bg-[#FFFFFF] overflow-hidden border border-[#7E7E7E]">
          <div
            className={`${progressBarColor} h-full transition-all duration-300 ease-in-out`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default NodeRow;
