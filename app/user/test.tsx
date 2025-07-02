import {
  Canvas,
  Line,
  Rect,
  Text,
  useFont,
} from "@shopify/react-native-skia";
import React, { useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

// ─────────────────────────────────────────
// 🔠 Types
// ─────────────────────────────────────────
type TreeNode = {
  label: string;
  spouse?: string;
  children?: TreeNode[];
};

type LayoutNode = {
  node: TreeNode;
  x: number;
  y: number;
  totalWidth: number;
  children: LayoutNode[];
};

type FlattenedNode = {
  x: number;
  y: number;
  label: string;
};

type LineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

// ─────────────────────────────────────────
// 📦 Data
// ─────────────────────────────────────────
const tree: TreeNode = {
  label: "Root",
  spouse: "Root Spouse",
  children: [
    {
      label: "Person 1",
      spouse: "Spouse 1",
      children: [
        { label: "Child 1-1" },
        { label: "Child 1-2" },
        { label: "Child 1-3" },
        { label: "Child 1-4" },
      ],
    },
    {
      label: "Person 2",
      spouse: "Spouse 2",
      children: [{ label: "Child 2-1" }],
    },
  ],
};

// ─────────────────────────────────────────
// ⚙️ Constants
// ─────────────────────────────────────────
const nodeWidth = 80;
const nodeHeight = 40;
const fontSize = 14;
const verticalSpacing = 100;
const horizontalSpacing = 120;

// ─────────────────────────────────────────
// 📐 Tree Layout
// ─────────────────────────────────────────
const layoutTree = (
  node: TreeNode,
  expandedMap: Record<string, boolean>,
  depth = 0,
  xOffset = 0
): LayoutNode => {
  const isExpanded = expandedMap[node.label] ?? true;
  const hasSpouse = !!node.spouse;
  const children = isExpanded ? node.children || [] : [];

  let width = 0;
  const positionedChildren: LayoutNode[] = [];

  for (const child of children) {
    const childLayout = layoutTree(child, expandedMap, depth + 1, xOffset + width);
    width += childLayout.totalWidth;
    positionedChildren.push(childLayout);
  }

  if (children.length === 0) {
    width = hasSpouse ? nodeWidth * 2 + 20 + horizontalSpacing : nodeWidth + horizontalSpacing;
  }

  const centerOffset = hasSpouse ? (nodeWidth * 2 + 20) : nodeWidth;
  const x = xOffset + width / 2 - centerOffset / 2;
  const y = depth * verticalSpacing;

  return {
    node,
    x,
    y,
    children: positionedChildren,
    totalWidth: width,
  };
};

const flattenTree = (
  treeNode: LayoutNode,
  lines: LineSegment[] = [],
  nodes: FlattenedNode[] = [],
  expandedMap: Record<string, boolean> = {}
) => {
  const isExpanded = expandedMap[treeNode.node.label] ?? true;
  const hasSpouse = !!treeNode.node.spouse;

  const personX = treeNode.x;
  const spouseX = treeNode.x + nodeWidth + 20;
  const y = treeNode.y;

  nodes.push({ x: personX, y, label: treeNode.node.label });

  if (hasSpouse) {
    nodes.push({ x: spouseX, y, label: treeNode.node.spouse! });

    lines.push({
      x1: personX + nodeWidth,
      y1: y + nodeHeight / 2,
      x2: spouseX,
      y2: y + nodeHeight / 2,
    });
  }

  const coupleCenterX = hasSpouse
    ? personX + (nodeWidth + 20) / 2 + nodeWidth / 2
    : personX + nodeWidth / 2;
  const parentBottomY = y + nodeHeight;

  if (!isExpanded) return { nodes, lines };

  treeNode.children.forEach((child) => {
    const childCenterX = child.x + nodeWidth / 2;
    const childTopY = child.y;
    const midY = parentBottomY + (childTopY - parentBottomY) / 2;

    lines.push({ x1: coupleCenterX, y1: parentBottomY, x2: coupleCenterX, y2: midY });
    lines.push({ x1: coupleCenterX, y1: midY, x2: childCenterX, y2: midY });
    lines.push({ x1: childCenterX, y1: midY, x2: childCenterX, y2: childTopY });

    flattenTree(child, lines, nodes, expandedMap);
  });

  return { nodes, lines };
};

const flattenAllNodes = (treeNode: LayoutNode, list: FlattenedNode[] = []): FlattenedNode[] => {
  list.push({ x: treeNode.x, y: treeNode.y, label: treeNode.node.label });
  for (const child of treeNode.children) {
    flattenAllNodes(child, list);
  }
  return list;
};

const findNodeByLabel = (node: TreeNode, label: string): TreeNode | null => {
  if (node.label === label || node.spouse === label) return node;
  for (const child of node.children || []) {
    const result = findNodeByLabel(child, label);
    if (result) return result;
  }
  return null;
};

export default function UserTest() {
  const font = useFont(require("../../assets/fonts/Roboto-Regular.ttf"), fontSize);
  const screenWidth = Dimensions.get("window").width;
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const layout = layoutTree(tree, expandedMap);
  const { nodes, lines } = flattenTree(layout, [], [], expandedMap);
  const allNodes = flattenAllNodes(layout);

  const canvasWidth = Math.max(screenWidth, layout.totalWidth);
  const canvasHeight = Math.max(400, layout.y + 3 * verticalSpacing);
  const xShift = Math.max((screenWidth - layout.totalWidth) / 2, 0);

  const handleTap = (x: number, y: number) => {
    for (const node of allNodes) {
      const left = node.x + xShift;
      const right = left + nodeWidth;
      const top = node.y;
      const bottom = top + nodeHeight;

      if (x >= left && x <= right && y >= top && y <= bottom) {
        const target = findNodeByLabel(tree, node.label);
        if (target?.children?.length) {
          setExpandedMap((prev) => ({
            ...prev,
            [target.label]: !(prev[target.label] ?? true),
          }));
        }
        break;
      }
    }
  };

  const gesture = Gesture.Tap().onEnd((e) => {
    runOnJS(handleTap)(e.x, e.y);
  });

  const canvasKey = JSON.stringify(expandedMap);

  return font ? (
    <GestureDetector gesture={gesture}>
      <ScrollView horizontal>
        <ScrollView>
          <Canvas key={canvasKey} style={{ width: canvasWidth, height: canvasHeight }}>
            {lines.map((line, idx) => (
              <Line
                key={`line-${idx}`}
                p1={{ x: line.x1 + xShift, y: line.y1 }}
                p2={{ x: line.x2 + xShift, y: line.y2 }}
                color="#888"
                strokeWidth={2}
              />
            ))}
            {nodes.map((node, idx) => (
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
    </GestureDetector>
  ) : null;
}
