import NodeRow from "./NodeRow";
const nodeData = [
  { name: "View #1", count: 0, max: 40 },
  { name: "Invite", count: 40, max: 40 },
  { name: "Like Post #1", count: 26, max: 40 },
  { name: "View #2", count: 9, max: 50 },
  { name: "Send InMail", count: 1, max: 40 },
  { name: "Send Message #1", count: 1, max: 294 },
  { name: "Like Post #2", count: 1, max: 37 },
  { name: "Send Message #2", count: 2, max: 285 },
  { name: "Send Message #3", count: 0, max: 242 },
  { name: "Like Post #3", count: 0, max: 50 },
];

const NodeTable = () => {
  return (
    <div className="font-normal text-[#7E7E7E] w-[800px]">
      <div className="grid grid-cols-[350px_175px_175px_115px] text-[24px]  mb-[11px]">
        <div className="text-left">Nodes</div>
        <div className="text-center">Count</div>
        <div className="text-center">Max</div>
        <div className="text-center">%</div>
      </div>
      {nodeData.map((node, index) => (
        <NodeRow
          key={index}
          name={node.name}
          count={node.count}
          max={node.max}
        />
      ))}
    </div>
  );
};

export default NodeTable;
