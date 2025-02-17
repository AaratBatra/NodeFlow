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
	const [selectedNodes, setSelectedNodes] = useState<NodeModel[]>([]);
	const [treeData, setTreeData] = useState<NodeModel[]>([]);
	useEffect(() => {
		setTreeData(data);
	}, [data]);

	const handleClick = (node: NodeModel) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("id", String(node.id));
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleDrop = async (newTree: NodeModel[], e: DropOptions) => {
		//console.log(e);
		const relativeIndex = e.relativeIndex; // index relative to the drop target 0-based
		const destinationIndex = e.destinationIndex; // index according to the entire tree 0-based
		const dragSourceId = e.dragSourceId;
		const dropTargetId = e.dropTargetId;
		const dropTarget = e.dropTarget;
		if (
			typeof relativeIndex === "undefined" ||
			typeof destinationIndex === "undefined" ||
			!dragSourceId ||
			!dropTargetId ||
			!dropTarget ||
			!dropTarget.droppable
		)
			return;
		// create a deep copy of entire tree for fallback if server fails to update
		const deepCopy = JSON.parse(JSON.stringify(treeData));

		// prepare selected nodes- if a parent is selected, its children should not be there
		const selectedParents = new Set();
		const processedSelectedNodes = [...selectedNodes].filter((node) => {
			if (selectedParents.has(node.parent)) {
				if (node.droppable) {
					selectedParents.add(node.id);
					// since this is a folder inside the dragged folder, this folder's descendants must also be ignored
				}
				return false;
			}
			if (node.droppable) {
				selectedParents.add(node.id);
			}
			return true;
		});
		// find out the dragged nodes- selected nodes or dragSourceId
		//console.log("processed selected nodes: ", processedSelectedNodes);

		const draggedNodes =
			processedSelectedNodes.length > 1
				? processedSelectedNodes
				: treeData.filter((el) => el.id === dragSourceId);

		if (
			draggedNodes.some((node) =>
				getDescendants(treeData, node.id).some(
					(desc) => desc.id === dropTargetId
				)
			)
		) {
			return;
		}

		// filter out the dragged nodes
		const prevTree = [...treeData];
		//console.log("prev tree: ", prevTree);
		//console.log("before dragged nodes: ", draggedNodes);
		// prevTree.forEach((node) =>
		// 	console.log(!draggedNodes.some((n) => n.id === node.id))
		// );
		const filteredTree = prevTree.filter(
			(node) => !draggedNodes.some((n) => n.id === node.id)
		);
		//console.log("before filtered tree: ", filteredTree);

		draggedNodes.forEach((node, index) => {
			node.parent = dropTargetId; // assign the new parent to the dragged node
			filteredTree.splice(destinationIndex + index, 0, node); // add the new node to the filteredTree array
		});

		//console.log("dragged nodes", draggedNodes);
		//console.log("after filtered tree: ", filteredTree);
		//setTreeData(filteredTree); //no need to setTreeData as the server action itself will invalidate

		// Prepare for DB mutation
		try {
			const updates: any = [];
			for (let i = 0; i < draggedNodes.length; i++) {
				const foundNode = filteredTree.find(
					(n) => n.id === draggedNodes[i].id
				);

				if (!foundNode) {
					throw new Error(
						"Could not find node in filtered tree, cannot push changes to server"
					);
				}

				const descendantsOfNewParent = getDescendants(
					filteredTree,
					foundNode.parent
				).filter((d) => d.parent === foundNode.parent);

				for (let j = 0; j < descendantsOfNewParent.length; j++) {
					updates.push({
						id: descendantsOfNewParent[j].id as string,
						parentId: descendantsOfNewParent[j].parent, //foundNode.parent as string,
						order: j + 1,
						type: descendantsOfNewParent[j].droppable
							? "FOLDER"
							: "FILE",
					});
				}
			}

			const res = await updateTree(updates);

			if (!res.success) {
				throw new Error(
					`Server could not update the changes: ${res.error}`
				);
			}
			toast.success("Tree updated successfully");
		} catch (error: any) {
			toast.error(error.message);
			setTreeData(deepCopy);
		} finally {
			setSelectedNodes([]);
		}
	};

	return (
		<DndProvider backend={MultiBackend} options={getBackendOptions()}>
			<div className={styles.wrapper}>
				<Tree
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
