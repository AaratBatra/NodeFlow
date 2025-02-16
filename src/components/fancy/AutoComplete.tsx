import * as React from "react";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

type Props<T extends string> = {
	selectedValue: T;
	onSelectedValueChange: (value: T) => void;
	searchValue: string;
	onSearchValueChange: (value: string) => void;
	items: { value: T; label: string }[];
	isLoading?: boolean;
	emptyMessage?: string;
	placeholder?: string;
	name: string;
	toUpdate?: string;
	label?: string;
	form: any;
	required?: boolean;
	onBlur?: any;
	className?: string;
	disabled?: boolean;
	description?: string;
};

export function AutoComplete<T extends string>({
	selectedValue,
	onSelectedValueChange,
	searchValue,
	onSearchValueChange,
	items,
	isLoading,
	emptyMessage = "No items.",
	placeholder = "Search...",
	name,
	toUpdate,
	label,
	form,
	required = false,
	onBlur,
	className = "",
	disabled = false,
	description,
}: Props<T>) {
	const [open, setOpen] = useState(false);

	const labels = useMemo(
		() =>
			items.reduce((acc, item) => {
				acc[item.value] = item.label;
				return acc;
			}, {} as Record<string, string>),
		[items]
	);
	// labels -> [code: "label"]
	const reset = () => {
		onSelectedValueChange("" as T);
		onSearchValueChange("");
		form.setValue(name, "");
		if (toUpdate) {
			form.setValue(toUpdate, "");
		}
	};

	const onInputBlur = onBlur
		? onBlur
		: (e: React.FocusEvent<HTMLInputElement>) => {
				return;
		  };

	const onSelectItem = (inputValue: string) => {
		if (inputValue === selectedValue) {
			reset();
		} else {
			onSelectedValueChange(inputValue as T);
			onSearchValueChange(labels[inputValue] || "");
			form.setValue(name, labels[inputValue] || "");
			if (toUpdate) {
				form.setValue(toUpdate, inputValue);
			}
		}
		setOpen(false);
	};

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					{label ? (
						<FormLabel>
							{label}{" "}
							<code className="text-red-500">
								{required ? "*" : ""}
							</code>
						</FormLabel>
					) : null}

					<Popover open={open} onOpenChange={setOpen}>
						<Command shouldFilter={false}>
							<PopoverTrigger asChild>
								<FormControl>
									<CommandPrimitive.Input
										asChild
										// ? searchValue : field.value ?? ""
										value={searchValue || field.value}
										//value={field.value}
										onValueChange={onSearchValueChange}
										onKeyDown={(e) =>
											setOpen(e.key !== "Escape")
										}
										// onMouseDown={() =>
										// 	setOpen(
										// 		(open) => !!searchValue || !open
										// 	)
										// }
										onClick={() => setOpen(true)}
										onBlur={onInputBlur}
										name={name}
										autoComplete="off"
										aria-autocomplete="none"
									>
										<Input
											placeholder={placeholder}
											autoComplete="off"
											aria-autocomplete="none"
											className={cn("w-full", className)}
											disabled={disabled}
										/>
									</CommandPrimitive.Input>
								</FormControl>
							</PopoverTrigger>
							{!open && (
								<CommandList
									aria-hidden="true"
									className="hidden"
								/>
							)}
							<PopoverContent
								// asChild
								onOpenAutoFocus={(e) => e.preventDefault()}
								onInteractOutside={(e) => {
									if (
										e.target instanceof Element &&
										e.target.hasAttribute("cmdk-input")
									) {
										e.preventDefault();
									}
								}}
								className="w-[--radix-popover-trigger-width] p-0"
							>
								<CommandList>
									{isLoading && (
										<CommandPrimitive.Loading>
											<div className="p-1">
												<Skeleton className="h-6 w-full" />
											</div>
										</CommandPrimitive.Loading>
									)}
									{items.length > 0 && !isLoading ? (
										<CommandGroup>
											{items.map((option, idx) => {
												return (
													<CommandItem
														key={`${option.value}-${idx}`}
														value={option.value}
														onMouseDown={(e) =>
															e.preventDefault()
														}
														onSelect={onSelectItem}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																selectedValue ===
																	option.value
																	? "opacity-100"
																	: "opacity-0"
															)}
														/>
														{option.label}
													</CommandItem>
												);
											})}
										</CommandGroup>
									) : null}
									{!isLoading ? (
										<CommandEmpty>
											{emptyMessage ?? "No items."}
										</CommandEmpty>
									) : null}
								</CommandList>
							</PopoverContent>
						</Command>
					</Popover>
					<FormMessage />
					<FormDescription>{description}</FormDescription>
				</FormItem>
			)}
		/>
	);
}
