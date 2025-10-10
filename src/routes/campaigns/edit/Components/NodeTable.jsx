import { actions } from "../../../../utils/workflow-helpers";
import { useEditContext } from "../Context/EditContext";
import NodeRow from "./NodeRow";

const NodeTable = ({ activeTab, stats, getStats = () => 0 }) => {
  const { editId, workflow } = useEditContext();

  console.log(workflow);

  const actionNodes = workflow.nodes
    .filter(node => node.category === "action")
    .map(node => ({
      id: node.id,
      type: node.type,
      limit: node.properties?.limit ?? null,
    }));

  const typeCounters = {};

  const labeledNodes = actionNodes.map(node => {
    const baseLabel = actions[node.type]?.label || node.type;
    typeCounters[node.type] = (typeCounters[node.type] || 0) + 1;

    const label =
      typeCounters[node.type] > 1
        ? `${baseLabel} #${typeCounters[node.type]}`
        : baseLabel;

    return {
      ...node,
      label,
    };
  });

  console.log("with label", labeledNodes);

  return (
    <div className="font-normal text-[#7E7E7E] w-[800px]">
      <div className="grid grid-cols-[350px_175px_175px_115px] text-[24px]  mb-[11px]">
        <div className="text-left">Nodes</div>
        <div className="text-center">Count</div>
        <div className="text-center">Max</div>
        <div className="text-center">%</div>
      </div>
      {labeledNodes.map((node, index) => {
       // console.log('node...', node)
       // console.log('node stat', stats?.[node.id])
       // console.log('stats...', stats)
        return (
          <NodeRow
            key={index}
            name={node.label}
            count={getStats(stats?.[node.id], activeTab)}
            max={node.limit || '-'}
          />
        );
      })}
    </div>
  );
};

export default NodeTable;
