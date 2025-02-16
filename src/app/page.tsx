import { prisma } from "@/lib/db";
import Link from "next/link";
import HeaderForm from "./HeaderForm";
import { transformPrismaToTreeData } from "@/utils/transform-db-to-tree";
import DndTree from "@/components/tree/DndTree";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import Preview from "@/components/preview/Preview";
import { ExpandableCard } from "@/components/fancy/ExpandableCard";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

export default async function Home({
	searchParams,
}: {
	searchParams: { id?: string };
}) {
	const items = await prisma.item.findMany({
		orderBy: { order: "asc" }, // To keep the correct order
	});
	const data = transformPrismaToTreeData(items);
	return (
		<>
			<div className="flex flex-col gap-2 w-full p-4">
				<div className="w-full flex items-center justify-between">
					<div className="w-full flex flex-col py-2 border-b">
						<h1>NodeFlow</h1>
						<p className="ml-40 max-md:ml-20 text-xs">
							Made by{" "}
							<Link
								className="underline"
								href={"https://www.linkedin.com/in/aaratbatra"}
								target="_blank"
							>
								Aarat Batra
							</Link>
						</p>
					</div>
					<div className="w-max flex items-center gap-2">
						<Link
							href={"https://github.com/AaratBatra/NodeFlow"}
							target="_blank"
						>
							<Button size={"icon"} variant={"outline"}>
								<Github />
							</Button>
						</Link>
						<Link
							href={"https://www.linkedin.com/in/aaratbatra/"}
							target="_blank"
						>
							<Button size={"icon"} variant={"outline"}>
								<Linkedin />
							</Button>
						</Link>
						<Link
							href={"https://x.com/aaratbatra_114"}
							target="_blank"
						>
							<Button size={"icon"} variant={"outline"}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									version="1.1"
									id="Layer_1"
									width="24px"
									height="24px"
									viewBox="0 0 24 24"
								>
									<path d="M14.095479,10.316482L22.286354,1h-1.940718l-7.115352,8.087682L7.551414,1H1l8.589488,12.231093L1,23h1.940717  l7.509372-8.542861L16.448587,23H23L14.095479,10.316482z M11.436522,13.338465l-0.871624-1.218704l-6.924311-9.68815h2.981339  l5.58978,7.82155l0.867949,1.218704l7.26506,10.166271h-2.981339L11.436522,13.338465z" />
								</svg>
							</Button>
						</Link>
					</div>
				</div>
				<HeaderForm />
				<div className="w-full max-md:hidden">
					<ResizablePanelGroup
						className="rounded-lg shadow-md border h-full"
						direction="horizontal"
					>
						<ResizablePanel
							defaultSize={70}
							maxSize={80}
							minSize={20}
							className="p-4"
						>
							<div className="w-full h-full border bg-white shadow-md rounded-md">
								<ExpandableCard height="3.25rem">
									<h2>Sortable drag and drop tree</h2>
									<h3>Some instructions</h3>
									<ul className="my-6 ml-6 list-disc [&>li]:mt-2">
										<li>
											Create a group by clicking "Create"
											on top right and selecting the Group
											tab on top left
										</li>
										<li>
											Paste image URL for an item&apos;s
											image to appear in it&apos;s preview
										</li>
										<li>
											Type any available group&apos;s name
											(a group with a folder icon in the
											tree below) or leave blank in parent
											field
										</li>
										<li>
											After clicking an item / group,
											hover on its title on right side to
											edit or delete
										</li>
									</ul>
									<h3>Features</h3>
									<ul className="my-6 ml-6 list-disc [&>li]:mt-2">
										<li>
											Drag and drop single or multiple
											items in the tree
										</li>
										<li>
											Resizable preview section on the
											right appears by clicking any item
										</li>
										<li>
											Everything in sync with Database and
											Next server. Tech stack- Next JS,
											PostgreSQL, React - DND, Framer
											Motion, Zod, Vercel
										</li>
										<li>Optimistic UI drag and drop</li>
										<li>Framer motion animations</li>
										<li>Tags and server side lookups</li>
										<li>
											ONLY item name or group name
											necessary to create it
										</li>
									</ul>
								</ExpandableCard>

								<DndTree data={data} />
							</div>
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel
							defaultSize={30}
							maxSize={50}
							minSize={20}
						>
							<Preview id={searchParams.id} />
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
				<div className="md:hidden">
					<Preview id={searchParams.id} />
					<div className="w-full h-full border bg-white shadow-md rounded-md">
						<DndTree data={data} />
						<ExpandableCard height="4rem">
							<h2>Sortable drag and drop tree</h2>
							<h3>Some instructions</h3>
							<ul className="my-6 ml-6 list-disc [&>li]:mt-2">
								<li>
									Create a group by clicking "Create" on top
									right and selecting the Group tab on top
									left
								</li>
								<li>
									Paste image URL for an item&apos;s image to
									appear in it&apos;s preview
								</li>
								<li>
									Type any available group&apos;s name (a
									group with a folder icon in the tree below)
									or leave blank in parent field
								</li>
								<li>
									After clicking an item / group, hover on its
									title on right side to edit or delete
								</li>
							</ul>
							<h3>Features</h3>
							<ul className="my-6 ml-6 list-disc [&>li]:mt-2">
								<li>
									Drag and drop single or multiple items in
									the tree
								</li>
								<li>
									Resizable preview section on the right
									appears by clicking any item
								</li>
								<li>
									Everything in sync with Database and Next
									server. Tech stack- Next JS, PostgreSQL,
									React - DND, Framer Motion, Zod, Vercel
								</li>
								<li>Optimistic UI drag and drop</li>
								<li>Framer motion animations</li>
								<li>Tags and server side lookups</li>
								<li>
									ONLY item name or group name necessary to
									create it
								</li>
							</ul>
						</ExpandableCard>
					</div>
				</div>
			</div>
		</>
	);
}
