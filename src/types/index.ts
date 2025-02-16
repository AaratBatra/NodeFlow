import { Item } from "@prisma/client";
export type Tr = Item & { children?: Tr[] };
