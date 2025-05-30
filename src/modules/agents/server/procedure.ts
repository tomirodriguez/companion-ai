import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from "@/constants";
import { db } from "@/db";
import { agents } from "@/db/schema";
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/trpc/init";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { agentsInsertSchema } from "../schemas";

export const agentsRouter = createTRPCRouter({
	getMany: protectedProcedure
		.input(
			z
				.object({
					page: z.number().default(DEFAULT_PAGE),
					pageSize: z
						.number()
						.min(MIN_PAGE_SIZE)
						.max(MAX_PAGE_SIZE)
						.default(DEFAULT_PAGE_SIZE),
					search: z.string().nullish(),
				})
				.default({
					page: DEFAULT_PAGE,
					pageSize: DEFAULT_PAGE_SIZE,
				}),
		)
		.query(async ({ ctx, input }) => {
			const { page, pageSize, search } = input;

			const data = await db
				.select()
				.from(agents)
				.where(
					and(
						eq(agents.userId, ctx.auth.user.id),
						search ? ilike(agents.name, `%$${search}%`) : undefined,
					),
				)
				.orderBy(desc(agents.createdAt), desc(agents.id))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db
				.select({ count: count() })
				.from(agents)
				.where(
					and(
						eq(agents.userId, ctx.auth.user.id),
						search ? ilike(agents.name, `%$${search}%`) : undefined,
					),
				);

			const pages = Math.ceil(total.count / pageSize);

			return {
				items: data.map((agent) => ({ ...agent, meetingCount: 5 })),
				count: total.count,
				pages,
			};
		}),
	getOne: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const [existingAgent] = await db
				.select()
				.from(agents)
				.where(
					and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
				)
				.limit(1);

			return { ...existingAgent, meetingCount: 5 };
		}),
	create: protectedProcedure
		.input(agentsInsertSchema)
		.mutation(async ({ input, ctx }) => {
			const [createdAgent] = await db
				.insert(agents)
				.values({
					...input,
					userId: ctx.auth.user.id,
				})
				.returning();

			return createdAgent;
		}),
});
