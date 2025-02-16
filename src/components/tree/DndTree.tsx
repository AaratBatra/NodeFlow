"use client";
import {
	DndProvider,
	DropOptions,
	getBackendOptions,
	getDescendants,
	MultiBackend,
	Tree,
	NodeModel,
} from "@minoru/react-dnd-treeview";
import React, { useEffect, useState } from "react";
import Node from "./Node";
import Placeholder from "./Placeholder";
import useTreeOpenHandler from "./useTreeOpenHandler";
import styles from "./styles.module.css";
import { TreeItem } from "@/utils/transform-db-to-tree";
import { useRouter, useSearchParams } from "next/navigation";
import { updateTree } from "@/app/actions";
import { toast } from "sonner";

export default function DndTree({ data }: { data?: TreeItem[] }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	if (!data) return;
	const { ref, getPipeHeight, toggle } = useTreeOpenHandler();
	const [selectedNodes, setSelectedNodes] = useState<NodeModel<TreeItem>[]>(
		[]
	);
	const [treeData, setTreeData] = useState<NodeModel<TreeItem>[]>([]);
	useEffect(() => {
		const arr = data.map((d) => ({
			id: d.id,
			parent: d.parent,
			text: d.text,
			droppable: d.droppable,
			data: d,
		}));
		setTreeData(arr);
	}, [data]);

	const handleClick = (node: NodeModel) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("id", String(node.id));
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleDrop = (newTree: NodeModel[], e: DropOptions) => {
		const { dragSourceId, dropTargetId, destinationIndex } = e;

		if (
			!dragSourceId ||
			!dropTargetId ||
			typeof destinationIndex !== "number"
		)
			return;

		const draggedNodes =
			selectedNodes.length > 1
				? selectedNodes
				: treeData.filter((node) => node.id === dragSourceId);

		if (draggedNodes.length === 0) return;

		const dropTarget = treeData.find((node) => node.id === dropTargetId);
		if (!dropTarget?.droppable) return;

		// Prevent dropping into own descendants
		if (
			draggedNodes.some((node) =>
				getDescendants(treeData, node.id).some(
					(desc) => desc.id === dropTargetId
				)
			)
		)
			return;
		// Optimistic UI Update
		const previousTree = JSON.parse(JSON.stringify([...treeData])); //[...treeData];
		const prevTree = [...treeData];
		let updatedTree = prevTree.filter(
			(n) => !draggedNodes.some((d) => d.id === n.id)
		);

		let folderIds: string[] = [];
		draggedNodes.forEach((node, index) => {
			if (!folderIds.includes(node.parent as string)) {
				// this node has a parent that is being dragged so leave its parent id as it is

				if (node.droppable) {
					// this is a folder being dragged and put into dropTargetId
					// we do not have to change the parentId of the contents of this folder and only change the parentIf of the current folder
					node.parent = dropTargetId;
					folderIds.push(node.id as string);
				} else {
					node.parent = dropTargetId;
				}
			}
			updatedTree.splice(destinationIndex + index, 0, node); // destinationIndex + index because we wanna preserve the order
		});

		setTreeData(updatedTree);

		// Prepare data for the server update
		const updates = draggedNodes.map((node, index) => ({
			id: node.id as string,
			parentId: folderIds.includes(node.parent as string)
				? String(node.parent)
				: (dropTargetId as string),
			order: destinationIndex + index + 1, // DB has 1 based indexing
			type: node.droppable ? "FOLDER" : "FILE",
		}));

		// Send updates to the database
		updateTree(updates).then((response) => {
			if (!response.success) {
				toast.error(response.error || "Failed to update database");
				setTreeData(previousTree); // Revert on failure
			} else {
				toast.success("Tree updated successfully");
			}
		});

		setSelectedNodes([]); // Clear selection after drop
		// setTreeData((prevTree) => {
		// 	let updatedTree = prevTree.filter(
		// 		(n) => !draggedNodes.some((d) => d.id === n.id)
		// 	);

		// 	draggedNodes.forEach((node) => {
		// 		node.parent = dropTargetId;
		// 		updatedTree.splice(destinationIndex, 0, node);
		// 	});

		// 	return updatedTree;
		// });

		// setSelectedNodes([]); // Clear selection after drop
	};

	return (
		<DndProvider backend={MultiBackend} options={getBackendOptions()}>
			<div className={styles.wrapper}>
				<Tree<TreeItem>
					ref={ref}
					classes={{
						root: styles.treeRoot,
						placeholder: styles.placeholder,
						dropTarget: styles.dropTarget,
						listItem: styles.listItem,
					}}
					tree={treeData}
					sort={false}
					rootId={0}
					insertDroppableFirst={false}
					enableAnimateExpand={true}
					onDrop={handleDrop}
					canDrop={() => true}
					dropTargetOffset={5}
					placeholderRender={(node, { depth }) => (
						<Placeholder node={node} depth={depth} />
					)}
					render={(node, { depth, isOpen, isDropTarget }) => (
						<Node
							getPipeHeight={getPipeHeight}
							node={node}
							depth={depth}
							isOpen={isOpen}
							onClick={() => {
								if (node.droppable) {
									toggle(node?.id);
								}
							}}
							onNodeClick={handleClick}
							selectedNodes={selectedNodes}
							setSelectedNodes={setSelectedNodes}
							isDropTarget={isDropTarget}
							treeData={treeData}
						/>
					)}
				/>
			</div>
		</DndProvider>
	);
}
