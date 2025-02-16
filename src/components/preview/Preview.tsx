import React, { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ScrollArea } from "../ui/scroll-area";
import { FileView } from "./FileView";
import { FolderView } from "./FolderView";
import { Skeleton } from "../ui/skeleton";

const fetchItem = async (id: string) => {
	return prisma.item.findFirst({ where: { id } });
};

const Preview = ({ id }: { id?: string }) => {
	if (!id) return null;

	return (
		<Suspense fallback={<PreviewSuspense />}>
			<PreviewContent id={id} />
		</Suspense>
	);
};

const PreviewContent = async ({ id }: { id: string }) => {
	const res = await fetchItem(id);
	if (!res) return <></>;

	return (
		<ScrollArea className="w-full h-full max-h-[80vh] max-md:max-h-[72vh] flex flex-col p-4 border max-md:rounded-md max-md:shadow-md max-md:mb-4">
			{res.type === "FOLDER" ? (
				<FolderView
					item={{
						id: res.id,
						name: res.name,
						createdAt: res.createdAt,
						updatedAt: res.updatedAt,
					}}
				/>
			) : (
				<FileView
					item={{
						id: res.id,
						name: res.name,
						resourceLink: res.resourceLink,
						content: res.content,
						tags: res.tags,
						createdAt: res.createdAt,
						updatedAt: res.updatedAt,
					}}
				/>
			)}
		</ScrollArea>
	);
};

const PreviewSuspense = () => (
	<div className="w-full h-full p-4">
		<Skeleton className="w-full h-60 rounded-md mb-2" />
		<Skeleton className="h-8 w-32 my-2" />
		<div className="flex gap-2 items-center mb-2">
			<Skeleton className="h-6 w-20" />
			<Skeleton className="h-6 w-20" />
			<Skeleton className="h-6 w-20" />
		</div>
		<Skeleton className="h-40 w-full" />
	</div>
);

export default Preview;
