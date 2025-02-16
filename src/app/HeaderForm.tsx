"use client";
import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Info, X } from "lucide-react";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeCatchingButton } from "@/components/fancy/EyeCatchingButton";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FancyMultiSelect } from "@/components/fancy/MultiSelect";
import { Label } from "@/components/ui/label";
import { schema } from "@/schemas/createSchema";
import { createResource, parentLookup } from "./actions";
import { Button } from "@/components/ui/button";
import { AutoComplete } from "@/components/fancy/AutoComplete";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
/* name, content, image url, tags, folder name this can be tabs based layout where there can be two options- file or folder
				react a react hook form  */

//  <Info className="inline-block w-4 h-4" />{" "} Paste image URL only for image of the file

const HeaderForm = () => {
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			type: "FILE",
		},
	});
	const [expand, setExpand] = useState(false);
	const [tags, setTags] = useState<{ value: string; label: string }[]>([]);
	const [selectedValue, setSelectedValue] = useState<string>("");
	const [searchValue, setSearchValue] = useState<string>("");
	const [debouncedText] = useDebounce(searchValue, 500);
	const [items, setItems] = useState<{ value: string; label: string }[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	useEffect(() => {
		setIsLoading(true);
		async function getResults(q: string) {
			const res = await parentLookup(q);
			if (!res) return;
			setItems(res);
			setIsLoading(false);
		}
		getResults(debouncedText || "");
	}, [debouncedText]);

	async function handleCreate(data: z.infer<typeof schema>) {
		const tagItems = tags.map((t) => t.value).join(", ");
		const payload = { ...data, tags: tagItems };
		// invoke a server action so that it can be saved in the database
		// reset the form
		const res = await createResource(payload);
		if (res.success) {
			if (data.type === "FILE") {
				toast("Item created successfully");
			} else {
				toast("Group created successfully");
			}
			form.reset({
				name: "",
				type: "FILE",
				parentName: undefined,
				content: undefined,
				resourceLink: undefined,
			});
			setExpand(false);
		} else {
			toast(res.message);
		}
	}

	useEffect(() => {
		if (!expand) {
			form.reset({
				name: "",
				type: "FILE",
				parentName: undefined,
				content: undefined,
				resourceLink: undefined,
			});
			setSearchValue("");
			setSelectedValue("");
			setTags([]);
			setItems([]);
			setIsLoading(false);
		}
	}, [expand]);
	return (
		<Form {...form}>
			<form
				className={cn(
					"relative w-full h-16 flex flex-col items-end transition-all duration-500 border rounded-md p-2 bg-white drop-shadow-sm",
					expand && "h-[460px] max-md:h-max"
				)}
				onSubmit={form.handleSubmit(handleCreate)}
			>
				{!expand && (
					<div className="w-max">
						<EyeCatchingButton
							size={"sm"}
							onClick={() => setExpand(true)}
						>
							Create
						</EyeCatchingButton>
					</div>
				)}
				{expand && (
					<Button
						variant={"ghost"}
						size={"icon"}
						onClick={() => setExpand(false)}
						className="absolute top-0 right-0 text-red-500"
					>
						<X />
					</Button>
				)}
				{expand && (
					<Tabs
						className="w-full"
						defaultValue="FILE"
						onValueChange={(type) => {
							form.reset({
								name: "",
								type: type as "FILE" | "FOLDER",
								parentName: undefined,
								content: undefined,
								resourceLink: undefined,
							});
							setSearchValue("");
							setSelectedValue("");
							setTags([]);
							setItems([]);
							setIsLoading(false);
						}}
					>
						<TabsList className="grid w-40 grid-cols-2">
							<TabsTrigger value="FILE">Item</TabsTrigger>
							<TabsTrigger value="FOLDER">Group</TabsTrigger>
						</TabsList>
						<TabsContent value="FILE">
							<Card className="border-none shadow-none">
								<CardHeader className="p-2">
									<CardTitle className="text-2xl">
										Add a new item
									</CardTitle>
									<CardDescription>
										The new item will be added at the top of
										the tree (if no parent folder
										specified). Click on &quot;X&quot; at
										the top-right corner to close
									</CardDescription>
								</CardHeader>
								<CardContent className="p-2">
									<div className="w-full flex items-center gap-20 max-md:flex-col max-md:items-start max-md:gap-1">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Item Name
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Enter item name"
															{...field}
														/>
													</FormControl>
													<FormDescription>
														The name of the item you
														want to create
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
										<AutoComplete
											name="parentName"
											//toUpdate="parentId"
											label="Parent Name"
											placeholder="Enter parent name"
											form={form}
											selectedValue={selectedValue}
											onSelectedValueChange={
												setSelectedValue
											}
											searchValue={searchValue}
											onSearchValueChange={setSearchValue}
											items={items}
											isLoading={isLoading}
											className="min-w-60"
											description="Leave blank if no parent needed"
										/>
										<FormField
											control={form.control}
											name="resourceLink"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Resource Link
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Paste a URL"
															{...field}
														/>
													</FormControl>
													<FormDescription>
														Paste image URL only for
														image of the item
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="space-y-2">
											<Label
												className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
												htmlFor="tag"
											>
												Tags
											</Label>
											<div
												id="tag"
												className="w-[420px] max-md:w-full"
											>
												<FancyMultiSelect
													selected={tags}
													setSelected={setTags}
												/>
											</div>
											<p className="text-[0.8rem] text-muted-foreground">
												Add tags to be associated with
												the item
											</p>
										</div>
									</div>
									<div className="w-full flex flex-col max-md:gap-1">
										<FormField
											control={form.control}
											name="content"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Content
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Item description"
															className="resize-none"
															{...field}
														/>
													</FormControl>
													<FormDescription>
														You can add tags
														separately below
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</CardContent>
								<CardFooter className="p-2 flex justify-end">
									<div className="w-max">
										<EyeCatchingButton>
											Create Item
										</EyeCatchingButton>
									</div>
								</CardFooter>
							</Card>
						</TabsContent>
						<TabsContent value="FOLDER">
							<Card className="border-none shadow-none">
								<CardHeader className="p-2 text-2xl">
									<CardTitle>Add a new group</CardTitle>
									<CardDescription>
										The new group will be added at the top
										of the tree (if no parent group
										specified). A parent name is any name
										you see below in tree with a folder
										icon.
									</CardDescription>
								</CardHeader>
								<CardContent className="p-2">
									<div className="w-full flex items-center gap-20 max-md:flex-col max-md:items-start max-md:gap-2">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Group Name
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Enter group name"
															{...field}
														/>
													</FormControl>
													<FormDescription>
														The name of the group
														you want to create
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
										<AutoComplete
											name="parentName"
											//toUpdate="parentId"
											label="Parent Name"
											placeholder="Enter parent name"
											form={form}
											selectedValue={selectedValue}
											onSelectedValueChange={
												setSelectedValue
											}
											searchValue={searchValue}
											onSearchValueChange={setSearchValue}
											items={items}
											isLoading={isLoading}
											description="Leave blank if no parent needed"
										/>
									</div>
								</CardContent>
								<CardFooter className="p-2 flex justify-end">
									<div className="w-max">
										<EyeCatchingButton>
											Create Group
										</EyeCatchingButton>
									</div>
								</CardFooter>
							</Card>
						</TabsContent>
					</Tabs>
				)}
			</form>
		</Form>
	);
};

export default HeaderForm;
