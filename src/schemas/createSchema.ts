import { z } from "zod";
export const schema = z.object({
	name: z
		.string({ required_error: "Name is required" })
		.min(1, "Name is required"),
	type: z.enum(["FILE", "FOLDER"]),
	parentName: z.string().optional(),
	content: z.string().optional(),
	resourceLink: z
		.string()
		.url({ message: "Please enter a valid URL" })
		.optional(),
});
