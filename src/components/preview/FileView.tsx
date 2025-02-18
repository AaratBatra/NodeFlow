"use client";
import { Suspense, useEffect, useState } from "react";
import type React from "react";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AspectRatio } from "../ui/aspect-ratio";
import { Button } from "../ui/button";
import { Edit, Loader, Trash, Check } from "lucide-react";
import { format, isEqual } from "date-fns";
import { Badge } from "../ui/badge";
import { useTransition } from "react";
import { deleteResource, updateResource } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { FancyMultiSelect } from "../fancy/MultiSelect";

interface FileViewProps {
	item: {
		id: string;
		name: string;
		resourceLink: string | null;
		content: string | null;
		tags: string | null;
		createdAt: Date;
		updatedAt: Date;
	};
}

export const FileView = ({ item }: FileViewProps) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isEditing, setIsEditing] = useState(false);
	const [editedItem, setEditedItem] = useState({ ...item });
	useEffect(() => {
		setEditedItem({ ...item });
		setErrors(undefined);
		setTags(
			item.tags?.split(", ").map((tag) => ({ value: tag, label: tag })) ||
				[]
		);
	}, [item, isEditing]);
	const [errors, setErrors] = useState<
		| {
				resourceLink?: string[] | undefined;
				name?: string[] | undefined;
		  }
		| undefined
	>(undefined);
	const [tags, setTags] = useState<{ value: string; label: string }[]>(
		item.tags?.split(", ").map((tag) => ({ value: tag, label: tag })) || []
	);

	const handleDelete = () => {
		startTransition(async () => {
			const response = await deleteResource(item.id, "FILE");
			toast(response?.message);
			router.replace("/");
		});
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSave = async () => {
		const res = await updateResource({
			...editedItem,
			tags: tags.length > 0 ? tags.map((t) => t.value).join(", ") : null,
		});
		if (res.success) {
			toast.success(res.message as string);
			setIsEditing(false);
		} else {
			if (res.type === "SCHEMA ERROR") {
				setErrors(res.errors);
				return;
			}
			toast.error("some error occurred");
			console.log(res);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setEditedItem({ ...editedItem, [e.target.name]: e.target.value });
	};

	return (
		<AnimatePresence initial={false} mode="wait">
			{!isEditing ? (
				<motion.div
					initial={{ opacity: 0, scale: 0 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0 }}
					key="box"
				>
					{item.resourceLink && (
						<AspectRatio
							ratio={16 / 9}
							className="bg-muted shadow-sm"
						>
							<Image
								src={item.resourceLink || "/placeholder.svg"}
								alt={`${item.name}-image`}
								fill
								className="h-full w-full rounded-md object-cover"
							/>
						</AspectRatio>
					)}
					<div className="mt-2 flex items-center justify-between group">
						<h1 className="my-2">{item.name}</h1>
						<div className="w-max flex opacity-80 items-center gap-2 group-hover:opacity-100">
							<Button
								variant={"outline"}
								size={"icon"}
								className="text-blue-500"
								onClick={handleEdit}
							>
								<Edit />
							</Button>
							<Button
								variant={"outline"}
								size={"icon"}
								className="text-red-500"
								onClick={handleDelete}
							>
								{isPending ? (
									<Loader className="animate-spin" />
								) : (
									<Trash />
								)}
							</Button>
						</div>
					</div>
					<div className="flex items-center flex-wrap gap-1 mb-2">
						{item.tags?.split(", ").map((val, idx) => (
							<Badge key={idx} variant={"secondary"}>
								{val}
							</Badge>
						))}
					</div>
					<p>{item.content}</p>
					<p className="text-sm text-right text-gray-500 mt-4">
						Created at:{" "}
						{format(new Date(item.createdAt), "dd-MMM-yyyy")}
					</p>
					{isEqual(
						new Date(item.createdAt),
						new Date(item.updatedAt)
					) ? null : (
						<p className="text-sm text-right text-gray-500">
							Updated at:{" "}
							{format(new Date(item.updatedAt), "dd-MMM-yyyy")}
						</p>
					)}
				</motion.div>
			) : (
				<motion.div
					key="editBox"
					initial={{ opacity: 0, scale: 0 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0 }}
				>
					<AspectRatio
						ratio={16 / 9}
						className="bg-muted shadow-sm flex items-center justify-center"
					>
						<div className="w-full px-4 flex flex-col gap-1">
							<Input
								type="url"
								name="resourceLink"
								value={editedItem.resourceLink || ""}
								placeholder="Resource link"
								onChange={handleInputChange}
								className="flex-grow"
							/>
							<span className="text-xs text-red-500">
								{errors &&
									errors["resourceLink"] &&
									errors["resourceLink"][0]}
							</span>
						</div>
					</AspectRatio>

					<div className="flex justify-end gap-2 mt-2">
						<Button
							variant="outline"
							onClick={() => setIsEditing(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSave}>
							<Check className="mr-2 h-4 w-4" /> Save Changes
						</Button>
					</div>
					<div className="mt-2 flex flex-col gap-1">
						<Input
							type="text"
							name="name"
							value={editedItem.name}
							onChange={handleInputChange}
							className="my-2 text-xl font-bold"
						/>
						<span className="text-xs text-red-500">
							{errors && errors["name"] && errors["name"][0]}
						</span>
					</div>
					<div className="mb-4">
						<Label
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							htmlFor="tag"
						>
							Tags
						</Label>
						<div id="tag" className="w-full">
							<FancyMultiSelect
								selected={tags}
								setSelected={setTags}
							/>
						</div>
					</div>
					<Textarea
						name="content"
						value={editedItem.content || ""}
						onChange={handleInputChange}
						className="mb-4"
						rows={5}
					/>
					<p className="text-sm text-right text-gray-500 mt-4">
						Created at:{" "}
						{format(new Date(item.createdAt), "dd-MMM-yyyy")}
					</p>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
