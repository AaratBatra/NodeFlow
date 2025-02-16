"use client";
import React from "react";
import { getDescendants, NodeModel } from "@minoru/react-dnd-treeview";
import NodeIcon from "./NodeIcon";
import styles from "./styles.module.css";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";

const TREE_X_OFFSET = 22;

const Node: React.FC<{
	node: NodeModel;
	depth: number;
	isOpen: boolean;
	selectedNodes: NodeModel[];
	isDropTarget: boolean;
	treeData: NodeModel[];
	onClick: (id: NodeModel["id"]) => void;
	onNodeClick: (node: NodeModel) => void;
	setSelectedNodes: React.Dispatch<React.SetStateAction<NodeModel<any>[]>>;
	getPipeHeight: (id: string | number, treeData: NodeModel[]) => number;
}> = ({
	node,
	depth,
	isOpen,
	selectedNodes,
	isDropTarget,
	onClick,
	onNodeClick,
	setSelectedNodes,
	treeData,
	getPipeHeight,
}) => {
	const indent = depth * TREE_X_OFFSET;

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClick(node.id);
	};

	return (
		<div
			className={`${styles.nodeWrapper} tree-node ${
				node.droppable && isDropTarget ? styles.dropTarget : ""
			}`}
			style={{ marginInlineStart: indent }}
		>
			<div className="flex items-center gap-2">
				<Checkbox
					checked={selectedNodes.some((n) => n.id === node.id)}
					onCheckedChange={(e) => {
						if (node.droppable) {
							// Select folder + all its descendants
							const allChildren = getDescendants(
								treeData,
								node.id
							);
							if (selectedNodes.some((n) => n.id === node.id)) {
								setSelectedNodes((prev) =>
									prev.filter((n) => {
										if (
											n.id !== node.id &&
											!allChildren.includes(n)
										) {
											return true;
										}
									})
								);
							} else {
								setSelectedNodes([node, ...allChildren]);
							}
						} else {
							// Select single node
							setSelectedNodes((prev) =>
								prev.some((n) => n.id === node.id)
									? prev.filter((n) => n.id !== node.id)
									: [...prev, node]
							);
						}
					}}
				/>
				<NodeIcon
					type={
						node.droppable
							? isOpen
								? "folder-open"
								: "folder"
							: null
					}
				/>
			</div>
			<div
				className={styles.pipeX}
				style={{ width: depth > 0 ? TREE_X_OFFSET - 9 : 0 }}
			/>
			{getDescendants(treeData, node.parent)[0].id === node.id && (
				<div
					className={styles.pipeY}
					style={{
						height: Math.max(
							0,
							getPipeHeight(node.parent, treeData) - 8
						),
					}}
				/>
			)}
			<div
				onClick={() => onNodeClick(node)}
				className={cn("", styles.labelGridItem)}
			>
				{node.text}
			</div>
			<div
				className={`${styles.expandIconWrapper} ${
					isOpen ? styles.isOpen : ""
				} size-8 rounded-full flex items-center justify-center hover:bg-primary/20`}
				onClick={handleToggle}
			>
				{node.droppable && (
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M10.5866 5.99969L7.99997 8.58632L5.41332 5.99969C5.15332 5.73969 4.73332 5.73969 4.47332 5.99969C4.21332 6.25969 4.21332 6.67965 4.47332 6.93965L7.5333 9.99965C7.59497 10.0615 7.66823 10.1105 7.7489 10.144C7.82957 10.1775 7.91603 10.1947 8.0033 10.1947C8.09063 10.1947 8.1771 10.1775 8.25777 10.144C8.33837 10.1105 8.41163 10.0615 8.4733 9.99965L11.5333 6.93965C11.7933 6.67965 11.7933 6.25969 11.5333 5.99969C11.2733 5.74635 10.8466 5.73969 10.5866 5.99969Z"
							fill="black"
						/>
					</svg>
				)}
			</div>
		</div>
	);
};

export default Node;
