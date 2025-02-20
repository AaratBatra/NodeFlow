"use server";
import { schema } from "@/schemas/createSchema";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
export const createResource = async (
	resource: z.infer<typeof schema> & { tags?: string | undefined }
) => {
	try {
		let parentId: string | null = null;

		// If a parent name is provided, find its ID
		if (
			resource.parentName &&
			resource.parentName.length > 0 &&
			resource.parentName !== "#"
		) {
			const parent = await prisma.item.findFirst({
				where: { name: resource.parentName, type: "FOLDER" }, // Ensure parent is a folder
			});

			if (parent) {
				parentId = parent.id;
			}
		}

		// Get the highest `order` value among existing children of the parent
		const lastSibling = await prisma.item.findFirst({
			where: { parentId },
			orderBy: { order: "desc" },
			select: { order: true },
		});

		const newOrder = lastSibling ? lastSibling.order + 1 : 1; // Assign order dynamically

		// Create the new item
		const newItem = await prisma.item.create({
			data: {
				name: resource.name,
				type: resource.type,
				parentId,
				order: newOrder,
				content: resource.type === "FILE" ? resource.content : null, // Only files have content
				resourceLink: resource.resourceLink || null,
				tags: resource.tags || null,
			},
		});
		revalidatePath("/");
		return { success: true, item: newItem };
	} catch (error) {
		return {
			success: false,
			message: "Error creating item",
		};
	}
};

export const parentLookup = async (q: string) => {
	const res = await prisma.item.findMany({
		where: {
			name:
				q.length > 0
					? {
							contains: q,
					  }
					: undefined,
			type: "FOLDER",
		},
		select: {
			parentId: true,
			name: true,
		},
		take: 20,
	});
	const arr = res.map(({ parentId, name }) => ({
		value: parentId || "#",
		label: name,
	}));
	return arr;
};

export const deleteResource = async (id: string, type: "FOLDER" | "FILE") => {
	if (!id || id.length < 1) return;
	if (type === "FILE") {
		const res = await prisma.item.delete({
			where: {
				id: id,
			},
		});
		revalidatePath("/");
		return {
			message: `File: ${res.name} has been deleted successfully`,
		};
	} else {
		const res = await prisma.item.delete({
			where: {
				id: id,
			},
		});
		revalidatePath("/");
		return {
			message: `Folder: ${res.name} has been deleted successfully`,
		};
	}
};

const updateSchema = z.object({
	name: z
		.string({ required_error: "Name is required" })
		.min(1, "Name is required"),
	resourceLink: z
		.string()
		.url({ message: "Invalid URL" })
		.optional()
		.nullable(),
});
export const updateResource = async (data: {
	id: string;
	name: string;
	resourceLink?: string | null;
	content?: string | null;
	tags?: string | null;
	createdAt: Date;
}) => {
	const parsingResults = updateSchema.safeParse(data);
	if (!parsingResults.success) {
		return {
			success: false,
			type: "SCHEMA ERROR",
			errors: parsingResults.error.flatten().fieldErrors,
		};
	}
	try {
		const res = await prisma.item.update({
			where: {
				id: data.id,
			},
			data: {
				name: data.name,
				resourceLink: data.resourceLink,
				content: data.content,
				tags: data.tags,
			},
		});
		revalidatePath("/");
		return { success: true, message: `${res.type} updated successfully` };
	} catch (error) {
		return { success: false, type: "UNKNOWN ERROR", error: error };
	}
};

export const updateTree = async (
	updates: { id: string; parentId: string; order: number; type: string }[]
) => {
	try {
		// Perform batch update
		const updatePromises = updates.map(({ id, parentId, order }) =>
			prisma.item.update({
				where: { id },
				data: { parentId, order },
			})
		);
		await Promise.all(updatePromises);

		// Revalidate cache for fresh tree data
		// revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Failed to update tree:", error);
		return { success: false, error: "Failed to update tree structure" };
	}
};
