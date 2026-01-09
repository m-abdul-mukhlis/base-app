import useSafeState from "@/components/useSafeState";
import { Canvas, ImageSVG, Line, RoundedRect, Skia, Text, useFont } from "@shopify/react-native-skia";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

const nodeWidth = 80;
const nodeHeight = 90;
const fontSize = 12;
const verticalSpacing = 120;
const horizontalSpacing = 120;

type TreeNode = {
  label: string;
  gender: string;
  spouse?: string;
  spouseGender?: string;
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
  gender: string;
};

type LineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const layoutTree = (
  node: TreeNode,
  expandedMap: Record<string, boolean>,
  depth = 0,
  xOffset = 0
): LayoutNode => {
  const isExpanded = expandedMap[node.label] ?? false;
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
  const isExpanded = expandedMap[treeNode.node.label] ?? false;
  const hasSpouse = !!treeNode.node.spouse;

  const personX = treeNode.x;
  const spouseX = treeNode.x + nodeWidth + 20;
  const y = treeNode.y;

  nodes.push({ x: personX, y, label: treeNode.node.label, gender: treeNode.node.gender });

  if (hasSpouse) {
    nodes.push({ x: spouseX, y, label: treeNode.node.spouse!, gender: treeNode.node.spouseGender || 'u' });

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

const collectLabels = (node: TreeNode, map: Record<string, boolean>) => {
  map[node.label] = false;
  for (const child of node.children || []) {
    collectLabels(child, map);
  }
};

const collectNodeMap = (node: TreeNode, map: Record<string, TreeNode>) => {
  map[node.label] = node;
  if (node.children) {
    for (const child of node.children) collectNodeMap(child, map);
  }
};

type RawPerson = {
  id: string;
  name: string;
  gender: string;
  par_rel: string[];
  rel_id?: string[];
  created: any;
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

    const node: TreeNode = {
      label: person.name,
      gender: person.gender,
    };

    const spouseId = spouseMap.get(personId);
    if (spouseId) {
      const spouse = peopleMap.get(spouseId);
      if (spouse) {
        node.spouse = spouse.name;
        node.spouseGender = spouse.gender;
      }
    }

    const key = spouseId ? [personId, spouseId].sort().join("-") : undefined;
    let children = key ? childrenMap.get(key) || [] : [];

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

const genderSVG = {
  "m": Skia.SVG.MakeFromString(` <svg fill = "#99c1f1" viewBox = "0 0 1024 1024" xmlns = "http://www.w3.org/2000/svg" stroke = "#99c1f1" ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M790.796 69.974c97.638 62.577 145.937 166.195 102.252 234.363-43.684 68.155-158.009 67.533-255.638 4.954-20.554-13.167-39.158-28.34-55.278-44.914-29.344 49.669-75.064 96.12-131.427 132.248-137.525 88.148-297.307 89.01-357.183-4.41-59.874-93.429 7.635-238.242 145.158-326.379 120.735-77.387 259.611-87.9 332.142-24.458 55.457-31.939 143.36-20.514 219.974 28.595zm-22.103 34.485C697.992 59.14 619.007 52.323 581.575 83.608c-8.543 7.14-21.224 6.147-28.552-2.235-51.882-59.346-178.937-53.675-292.24 18.949C139.921 177.78 83 299.883 128.008 370.114c45.007 70.222 179.733 69.495 300.594-7.973 60.266-38.629 106.678-89.872 130.682-142.285 6.407-13.989 25.374-16.182 34.804-4.023 17.11 22.063 39.407 42.305 65.422 58.971 80.971 51.901 170.239 52.387 199.054 7.431 28.82-44.972-8.893-125.879-89.869-177.777zM644.292 725.473c-23.084 56.99-78.553 95.067-141.1 95.067-64.658 0-121.603-40.688-143.194-100.515-3.84-10.639-15.577-16.151-26.216-12.312s-16.151 15.577-12.312 26.216C348.875 809.866 421.137 861.5 503.191 861.5c79.372 0 149.768-48.323 179.064-120.649 4.246-10.483-.81-22.424-11.293-26.671s-22.424.81-26.671 11.293zM431.539 564.727c0 35.809-29.03 64.84-64.84 64.84-35.799 0-64.829-29.03-64.829-64.84s29.03-64.829 64.829-64.829c35.809 0 64.84 29.02 64.84 64.829zm286.035 0c0 35.809-29.03 64.84-64.829 64.84-35.809 0-64.84-29.03-64.84-64.84s29.03-64.829 64.84-64.829c35.799 0 64.829 29.02 64.829 64.829z"></path><path d="M830.028 354.497c48.869 67.116 75.6 147.862 75.6 232.691 0 218.621-177.252 395.858-395.899 395.858-218.655 0-395.909-177.236-395.909-395.858 0-58.221 12.576-114.635 36.531-166.306 4.757-10.262.295-22.437-9.966-27.194s-22.437-.295-27.194 9.966c-26.445 57.04-40.33 119.33-40.33 183.534 0 241.245 195.593 436.818 436.869 436.818 241.267 0 436.859-195.575 436.859-436.818 0-93.567-29.521-182.738-83.448-256.801-6.658-9.144-19.467-11.159-28.611-4.501s-11.159 19.467-4.501 28.611z"></path></g></svg>`)!,
  "f": Skia.SVG.MakeFromString(`<svg fill="#f66151" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M644.38 710.114c-21.088 52.039-71.732 86.806-128.844 86.806-59.023 0-111.022-37.159-130.731-91.78-3.839-10.639-15.576-16.152-26.216-12.313s-16.152 15.576-12.313 26.216c25.523 70.732 92.839 118.837 169.26 118.837 73.937 0 139.505-45.012 166.805-112.383 4.248-10.483-.806-22.424-11.289-26.672s-22.424.806-26.672 11.289zM443.965 572.09c0 33.065-26.798 59.863-59.863 59.863-33.055 0-59.863-26.798-59.863-59.863s26.808-59.863 59.863-59.863c33.065 0 59.863 26.798 59.863 59.863zm264.115 0c0 33.065-26.798 59.863-59.873 59.863-33.055 0-59.853-26.798-59.853-59.863s26.798-59.863 59.853-59.863c33.075 0 59.873 26.798 59.873 59.863z"></path><path d="M828.728 421.744c33.48 55.929 51.415 119.916 51.415 186.591 0 200.985-162.965 363.93-363.981 363.93-201.022 0-363.981-162.941-363.981-363.93 0-69.399 19.435-135.867 55.547-193.341 6.017-9.577 3.132-22.219-6.446-28.237s-22.219-3.132-28.237 6.446c-40.184 63.955-61.824 137.966-61.824 215.132 0 223.611 181.298 404.89 404.941 404.89 223.636 0 404.941-181.282 404.941-404.89 0-74.136-19.971-145.385-57.231-207.629-5.809-9.705-18.386-12.863-28.091-7.053s-12.863 18.386-7.053 28.091z"></path><path d="M174.775 769.565H54.68c-7.576 0-13.722-6.144-13.722-13.722v-218.88c0-262.63 212.895-475.525 475.525-475.525 257.671 0 466.555 208.89 466.555 466.565v227.84c0 7.583-6.14 13.722-13.732 13.722H863.179c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48h106.127c30.211 0 54.692-24.475 54.692-54.682v-227.84c0-280.297-227.222-507.525-507.515-507.525C231.232 20.478-.002 251.712-.002 536.963v218.88c0 30.201 24.486 54.682 54.682 54.682h120.095c11.311 0 20.48-9.169 20.48-20.48s-9.169-20.48-20.48-20.48z"></path><path d="M191.305 425.21h650.353c11.311 0 20.48-9.169 20.48-20.48s-9.169-20.48-20.48-20.48H191.305c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48z"></path></g></svg>`)!,
  "u": Skia.SVG.MakeFromString(`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="6" r="4" stroke="#999999" stroke-width="1.5"></circle> <path d="M15 20.6151C14.0907 20.8619 13.0736 21 12 21C8.13401 21 5 19.2091 5 17C5 14.7909 8.13401 13 12 13C15.866 13 19 14.7909 19 17C19 17.3453 18.9234 17.6804 18.7795 18" stroke="#999999" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>`)!
}

export default function UserTest() {
  const { data }: any = useLocalSearchParams();
  const font = useFont(require("../../assets/fonts/Roboto-Regular.ttf"), fontSize);
  const { width, height } = useWindowDimensions();

  const tree = useMemo(() => parseFamilyData(JSON.parse(data || "[]")), [data])
  const [scrollPos, setScrollPos] = useSafeState<any>({ x: 0, y: 0 });

  const [expandedMap, setExpandedMap] = useSafeState<any>(() => {
    const map: Record<string, boolean> = {};
    if (tree) collectLabels(tree, map);
    return map;
  });

  const layout = useMemo(() => (tree ? layoutTree(tree, expandedMap) : null), [tree, expandedMap]);
  const { nodes, lines } = useMemo(() => layout ? flattenTree(layout, [], [], expandedMap) : { nodes: [], lines: [] }, [layout, expandedMap]);

  const canvasWidth = layout ? Math.max(width, layout.totalWidth) : width;
  const canvasHeight = layout ? Math.max(height, layout.y + 3 * verticalSpacing) : height;
  const xShift = layout ? Math.max((width - layout.totalWidth) / 2, 0) : 0;

  const nodeMap = useMemo(() => {
    const map: Record<string, TreeNode> = {};
    if (tree) collectNodeMap(tree, map);
    return map;
  }, [tree]);

  const handleTap = useCallback(
    (x: number, y: number) => {
      const tapped = nodes.find((node) => {
        const left = node.x + xShift;
        const right = left + nodeWidth;
        const top = node.y;
        const bottom = top + nodeHeight;
        return x >= left && x <= right && y >= top && y <= bottom;
      });

      if (tapped) {
        const target = nodeMap[tapped.label];
        if (target?.children?.length) {
          setExpandedMap((prev: any) => {
            const next = { ...prev };
            const isExpanded = !!prev[target.label];

            if (isExpanded) {
              // collapse node + all descendants
              const collapseRecursive = (n: TreeNode) => {
                next[n.label] = false;
                n.children?.forEach(collapseRecursive);
              };
              collapseRecursive(target);
            } else {
              // expand only this node, collapse siblings
              next[target.label] = true;
              target.children!.forEach((child) => (next[child.label] = false));
            }

            return next;
          });
        }
      }
    },
    [nodes, xShift, nodeMap]
  );

  const gesture = useMemo(
    () =>
      Gesture.Tap().onEnd((e) => {
        runOnJS(handleTap)(e.x + scrollPos.x, e.y + scrollPos.y);
      }),
    [handleTap, scrollPos]
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollPos({
      x: e.nativeEvent.contentOffset.x,
      y: e.nativeEvent.contentOffset.y,
    });
  };

  const lineElements = useMemo(
    () =>
      lines.map((line, idx) => (
        <Line
          key={`line-${idx}`}
          p1={{ x: line.x1 + xShift, y: line.y1 }}
          p2={{ x: line.x2 + xShift, y: line.y2 }}
          color="#888"
          strokeWidth={2}
        />
      )),
    [lines, xShift]
  );

  const nodeElements = useMemo(
    () =>
      nodes.map((node, idx) => (
        <React.Fragment key={`node-${idx}`}>
          <RoundedRect
            r={nodeWidth * 0.1}
            x={node.x + xShift}
            y={node.y}
            width={nodeWidth}
            height={nodeHeight}
            color="#222"
          />
          <ImageSVG
            svg={genderSVG[node.gender as keyof typeof genderSVG] || genderSVG.u}
            x={node.x + xShift + nodeWidth / 2 - 25}
            y={node.y + 10}
            width={50}
            height={50}
          />
          <Text
            x={node.x + xShift + 5}
            y={node.y + 74}
            text={node.label.length > 10 ? node.label.slice(0, 10) + "…" : node.label}
            font={font}
            color="white"
          />
        </React.Fragment>
      )),
    [nodes, xShift, font]
  );

  return font && layout && data ? (
    <GestureDetector gesture={gesture}>
      <ScrollView horizontal onScroll={onScroll} scrollEventThrottle={16}>
        <ScrollView onScroll={onScroll} scrollEventThrottle={16}>
          <Canvas style={{ width: canvasWidth, height: canvasHeight, marginTop: 30 }}>
            {lineElements}
            {nodeElements}

          </Canvas>
        </ScrollView>
      </ScrollView>
    </GestureDetector>
  ) : null;
}
