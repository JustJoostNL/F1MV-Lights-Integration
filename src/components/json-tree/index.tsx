import { JSONTree, StylingValue } from "react-json-tree";

const getLabelStyle: StylingValue = ({ style }, nodeType, expanded) => ({
  style: {
    ...style,
    fontWeight: expanded ? 600 : style!.fontWeight,
    color: "#55afe9",
  },
});

const getValueLabelStyle: StylingValue = (
  { style },
  nodeType,
  keyPath,
  rawValue
) => ({
  style: {
    ...style,
    color: rawValue === null ? "#777" : style!.color,
  },
});

export default function JsonTree({ data }: { data: any }) {
  return (
    <JSONTree
      data={data}
      hideRoot={true}
      shouldExpandNodeInitially={() => false}
      theme={{
        nestedNodeLabel: getLabelStyle,
        valueLabel: getValueLabelStyle,
      }}
      invertTheme={false}
    />
  );
}