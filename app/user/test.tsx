import {
  Canvas,
  Line,
  Rect,
  Text,
  useFont,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, ScrollView } from "react-native";

const nodeWidth = 80;
const nodeHeight = 40;
const fontSize = 14;
const verticalSpacing = 100;
const horizontalSpacing = 120;

const tree = {
  label: "Root",
  children: [
    {
      label: "Person 1",
      children: [
        { label: "Child 1-1" },
        { label: "Child 1-2" },
        { label: "Child 1-3" },
        { label: "Child 1-4" },
      ],
    },
    { label: "Person 2",
      children: [
        { label: "Child 2-1" },
        { label: "Child 2-2" },
      ],
     },
    { label: "Person 3" },
    { label: "Person 4" },
    { label: "Person 5" },
  ],
};

const layoutTree = (node, depth = 0, xOffset = 0) => {
  const children = node.children || [];
  let width = 0;
  const positionedChildren = [];

  for (let child of children) {
    const childLayout = layoutTree(child, depth + 1, xOffset + width);
    width += childLayout.totalWidth;
    positionedChildren.push(childLayout);
  }

  if (children.length === 0) {
    width = nodeWidth + horizontalSpacing;
  }

  const x = xOffset + width / 2 - nodeWidth / 2;
  const y = depth * verticalSpacing;

  return {
    node,
    x,
    y,
    children: positionedChildren,
    totalWidth: width,
  };
};

const flattenTree = (treeNode, lines = [], nodes = []) => {
  const parentCenterX = treeNode.x + nodeWidth / 2;
  const parentBottomY = treeNode.y + nodeHeight;

  nodes.push({ x: treeNode.x, y: treeNode.y, label: treeNode.node.label });

  treeNode.children.forEach((child) => {
    const childCenterX = child.x + nodeWidth / 2;
    const childTopY = child.y;

    const midY = parentBottomY + (childTopY - parentBottomY) / 2;

    // Vertical down from parent
    lines.push({
      x1: parentCenterX,
      y1: parentBottomY,
      x2: parentCenterX,
      y2: midY,
    });

    // Horizontal to child x
    lines.push({
      x1: parentCenterX,
      y1: midY,
      x2: childCenterX,
      y2: midY,
    });

    // Vertical down to child
    lines.push({
      x1: childCenterX,
      y1: midY,
      x2: childCenterX,
      y2: childTopY,
    });

    flattenTree(child, lines, nodes);
  });

  return { nodes, lines };
};

export default function UserTest() {
  const font = useFont(require("../../assets/fonts/Roboto-Regular.ttf"), fontSize);
  const layout = layoutTree(tree);
  const { nodes, lines } = flattenTree(layout);

  const screenWidth = Dimensions.get("window").width;
  const canvasWidth = Math.max(screenWidth, layout.totalWidth);
  const canvasHeight = Math.max(400, nodes[nodes.length - 1].y + nodeHeight + 50);

  // Center the tree if it fits within screen width
  const xShift = Math.max((screenWidth - layout.totalWidth) / 2, 0);

  return (
    <ScrollView horizontal>
      <ScrollView>
        <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
          {lines.map((line, idx) => (
            <Line
              key={`line-${idx}`}
              p1={{ x: line.x1 + xShift, y: line.y1 }}
              p2={{ x: line.x2 + xShift, y: line.y2 }}
              color="#888"
              strokeWidth={2}
            />
          ))}

          {font &&
            nodes.map((node, idx) => (
              <React.Fragment key={`node-${idx}`}>
                <Rect
                  x={node.x + xShift}
                  y={node.y}
                  width={nodeWidth}
                  height={nodeHeight}
                  color="#222"
                />
                <Text
                  x={node.x + xShift + 10}
                  y={node.y + 25}
                  text={node.label}
                  font={font}
                  color="white"
                />
              </React.Fragment>
            ))}
        </Canvas>
      </ScrollView>
    </ScrollView>
  );
}
