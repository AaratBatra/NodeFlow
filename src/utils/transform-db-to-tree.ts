interface PrismaItem {
	id: string;
	name: string;
	type: "FILE" | "FOLDER";
	order: number;
	parentId: string | null;
	content: string | null;
	tags: string | null;
	resourceLink: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface TreeItem {
	id: string;
	parent: number | string;
	droppable?: boolean;
	text: string;
	data?: {
		type: "FILE" | "FOLDER";
		content?: string;
		tags?: string;
		resourceLink?: string;
		order: number;
	};
}

export function transformPrismaToTreeData(
	prismaItems: PrismaItem[]
): TreeItem[] {
	return prismaItems.map((item) => {
		if (item.type === "FOLDER") {
			return {
				id: item.id,
				parent: item.parentId || 0, // Use 0 for root items (null parentId)
				text: item.name,
				droppable: true,
				data: {
					type: item.type,
					order: item.order,
				},
			};
		} else {
			return {
				id: item.id,
				parent: item.parentId || 0, // Use 0 for root items (null parentId)
				text: item.name,
				data: {
					type: item.type,
					content: item.content || undefined,
					tags: item.tags || undefined,
					resourceLink: item.resourceLink || undefined,
					order: item.order,
				},
			};
		}
	});
}
