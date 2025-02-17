"use client";
import { deleteResource, updateResource } from "@/app/actions";
import { format } from "date-fns";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Check, Edit, Loader, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";

export const FolderView = ({
	item,
}: {
	item: { id: string; name: string; createdAt: Date; updatedAt: Date };
}) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isEditing, setIsEditing] = useState(false);
	const [editedItem, setEditedItem] = useState({ ...item });
	useEffect(() => {
		setEditedItem({ ...item });
		setErrors(undefined);
	}, [item, isEditing]);
	const [errors, setErrors] = useState<
		| {
				name?: string[] | undefined;
		  }
		| undefined
	>(undefined);
	const handleDelete = () => {
		startTransition(async () => {
			const response = await deleteResource(item.id, "FOLDER");
			toast(response?.message);
			router.replace("/");
		});
	};
	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSave = async () => {
		const res = await updateResource(editedItem);
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
					<div className="my-2 flex items-center justify-between group">
						<h1 className="my-2">{item.name}</h1>
						<div className="w-max flex opacity-0 items-center gap-2 group-hover:opacity-100">
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
								disabled={isPending}
							>
								{isPending ? (
									<Loader className="animate-spin" />
								) : (
									<Trash />
								)}
							</Button>
						</div>
					</div>
					<p className="text-sm text-right text-gray-500 mt-4">
						Created at:{" "}
						{format(new Date(item.createdAt), "dd-MMM-yyyy")}
					</p>
				</motion.div>
			) : (
				<motion.div
					initial={{ opacity: 0, scale: 0 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0 }}
					key="editBox"
				>
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
				</motion.div>
			)}
		</AnimatePresence>
	);
};
