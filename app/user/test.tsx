import { Canvas, Circle, Group, Image, Line, Mask, RoundedRect, Text, useFont, useImage } from "@shopify/react-native-skia";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

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

const tree: TreeNode = { "label": "Mbah Suratmi", "spouse": "Mbah Masri", "children": [{ "label": "Arif", "spouse": "Siti", "children": [{ "label": "Muhammad Alfa Rizqi", "children": [] }] }, { "label": "Noor", "spouse": "Ghulam Mubarok", "children": [{ "label": "Daffa", "children": [] }] }, { "label": "Yanti", "spouse": "Sahuri", "children": [{ "label": "Ahmad Dilan Alfarisky", "children": [] }, { "label": "Adit", "children": [] }] }, { "label": "Khamdan Purwadi", "spouse": "Dwi", "children": [{ "label": "Askal", "children": [] }, { "label": "Heni", "children": [] }, { "label": "Dini", "children": [] }] }, { "label": "Sri", "spouse": "Masnan", "children": [{ "label": "Falah", "children": [] }, { "label": "Ulya", "children": [] }] }, { "label": "Eni", "spouse": "Mundakir", "children": [{ "label": "Muhammad Abdul Mukhlis", "spouse": "Noor Aidha Amilia", "children": [{ "label": "Muhammad Daffin Atharrazka", "children": [] }] }, { "label": "Ikha Sri Rahayu", "spouse": ". ", "children": [{ "label": "Habibah Qidzama Latifah", "children": [] }] }] }, { "label": "Noor Taufiq", "spouse": "Mul", "children": [{ "label": "Nanda", "children": [] }, { "label": "Nurul", "children": [] }] }, { "label": "Endang", "spouse": "Solikhul Hadi", "children": [{ "label": "Anang", "children": [] }, { "label": "Ana", "spouse": "Aris", "children": [{ "label": "Nabil Sakha Alfarizi", "children": [] }] }, { "label": "Dewi", "spouse": "Tain", "children": [{ "label": "Daffin", "children": [] }, { "label": "Faruq", "children": [] }] }, { "label": "Hanik", "spouse": "Arif", "children": [{ "label": "Hasna", "children": [] }, { "label": "Muham", "children": [] }] }] }] }

// const tree: TreeNode = {
//   label: "Root",
//   spouse: "Root Spouse",
//   children: [
//     {
//       label: "Person 1",
//       spouse: "Spouse 1",
//       children: [
//         { label: "Child 1-1" },
//         { label: "Child 1-2" },
//       ],
//     },
//     {
//       label: "Person 2",
//       spouse: "Spouse 2",
//       children: [
//         { label: "Child 2-1" },
//         { label: "Child 2-2" },
//         { label: "Child 2-3" },
//       ],
//     },
//   ],
// };

const nodeWidth = 80;
const nodeHeight = 90;
const fontSize = 12;
const verticalSpacing = 120;
const horizontalSpacing = 120;

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

type RawPerson = {
  id: string;
  name: string;
  gender: string;
  par_rel: string[];
  rel_id?: string[];
  created: any
};

function parseFamilyData(data: RawPerson[]): TreeNode | null {
  const peopleMap = new Map<string, RawPerson>();
  const spouseMap = new Map<string, string>();
  const childrenMap = new Map<string, string[]>();

  data.forEach((item) => peopleMap.set(item.id, item));

  for (const item of data) {
    const rel_id = item.rel_id;
    if (rel_id && rel_id.length === 2) {
      spouseMap.set(rel_id[0], rel_id[1]);
      spouseMap.set(rel_id[1], rel_id[0]);
    }
  }

  for (const item of data) {
    const par = item.par_rel;
    if (par && par.length === 2 && par[0] !== "undefined" && par[1] !== "undefined") {
      const key = [par[0], par[1]].sort().join("-");
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(item.id);
    }
  }

  const root = data.find((item) => item.par_rel.includes("0"));
  if (!root) return null;

  function buildTree(personId: string, visited = new Set<string>()): TreeNode | null {
    if (visited.has(personId)) return null;
    visited.add(personId);

    const person = peopleMap.get(personId);
    if (!person) return null;

    const node: TreeNode = { label: person.name };

    const spouseId = spouseMap.get(personId);
    if (spouseId) {
      const spouse = peopleMap.get(spouseId);
      if (spouse) node.spouse = spouse.name;
    }

    const key = spouseId
      ? [personId, spouseId].sort().join("-")
      : undefined;

    let children = key ? childrenMap.get(key) || [] : [];

    // Sort children by creation time ascending
    children.sort((a, b) => {
      const aCreated = peopleMap.get(a)?.created;
      const bCreated = peopleMap.get(b)?.created;
      if (!aCreated || !bCreated) return 0;
      if (aCreated.seconds !== bCreated.seconds) {
        return aCreated.seconds - bCreated.seconds;
      }
      return aCreated.nanoseconds - bCreated.nanoseconds;
    });

    node.children = children
      .map((childId) => buildTree(childId, visited))
      .filter((n): n is TreeNode => !!n);

    return node;
  }

  return buildTree(root.id);
}


export default function UserTest() {
  const { data } = useLocalSearchParams()
  const font = useFont(require("../../assets/fonts/Roboto-Regular.ttf"), fontSize);
  const image = useImage(require("../../assets/images/icon.png"));
  const { width, height } = useWindowDimensions()
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // const tree: TreeNode = parseFamilyData(JSON.parse(data))

  const layout = layoutTree(tree, expandedMap);
  const { nodes, lines } = flattenTree(layout, [], [], expandedMap);
  const allNodes = flattenAllNodes(layout);

  const canvasWidth = Math.max(width, layout.totalWidth);
  const canvasHeight = Math.max(height, layout.y + 3 * verticalSpacing);
  const xShift = Math.max((width - layout.totalWidth) / 2, 0);

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

  return font && image ? (
    <GestureDetector gesture={gesture}>
      <ScrollView horizontal>
        <ScrollView>
          <Canvas key={canvasKey} style={{ width: canvasWidth, height: canvasHeight, marginTop: 30 }}>
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
                <RoundedRect
                  r={nodeWidth * 0.1}
                  x={node.x + xShift}
                  y={node.y}
                  width={nodeWidth}
                  height={nodeHeight}
                  color="#222"
                />
                <Mask
                  mode="luminance"
                  mask={
                    <Group>
                      <Circle
                        cx={node.x + xShift + nodeWidth / 2}
                        cy={node.y + 35}
                        r={25}
                        color="white"
                      />
                    </Group>
                  }
                >
                  <Image
                    image={image}
                    x={node.x + xShift + nodeWidth / 2 - 25}
                    y={node.y + 10}
                    width={50}
                    height={50}
                    fit="cover"
                  />
                </Mask>

                <Text
                  x={node.x + xShift + 5}
                  y={node.y + 70 + 4}
                  text={node.label.length > 10 ? node.label.slice(0, 10) + "…" : node.label}
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
