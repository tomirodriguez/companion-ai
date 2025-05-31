import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from "@/constants";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

export const meetingsRouter = createTRPCRouter({
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
				.from(meetings)
				.where(
					and(
						eq(meetings.userId, ctx.auth.user.id),
						search ? ilike(meetings.name, `%$${search}%`) : undefined,
					),
				)
				.orderBy(desc(meetings.createdAt), desc(meetings.id))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db
				.select({ count: count() })
				.from(meetings)
				.where(
					and(
						eq(meetings.userId, ctx.auth.user.id),
						search ? ilike(meetings.name, `%$${search}%`) : undefined,
					),
				);

			const pages = Math.ceil(total.count / pageSize);

			return {
				items: data,
				count: total.count,
				pages,
			};
		}),
	getOne: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const [existingMeeting] = await db
				.select()
				.from(meetings)
				.where(
					and(eq(meetings.userId, ctx.auth.user.id), eq(meetings.id, input.id)),
				)
				.limit(1);

			if (!existingMeeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}

			return existingMeeting;
		}),
	// create: protectedProcedure
	// 	.input(agentsInsertSchema)
	// 	.mutation(async ({ input, ctx }) => {
	// 		const [createdAgent] = await db
	// 			.insert(agents)
	// 			.values({
	// 				...input,
	// 				userId: ctx.auth.user.id,
	// 			})
	// 			.returning();

	// 		return createdAgent;
	// 	}),
	// remove: protectedProcedure
	// 	.input(z.object({ id: z.string() }))
	// 	.mutation(async ({ input, ctx }) => {
	// 		const [removedAgent] = await db
	// 			.delete(agents)
	// 			.where(
	// 				and(
	// 					and(eq(agents.userId, ctx.auth.user.id), eq(agents.id, input.id)),
	// 				),
	// 			)
	// 			.returning();

	// 		if (!removedAgent) {
	// 			throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
	// 		}

	// 		return removedAgent;
	// 	}),
	// update: protectedProcedure
	// 	.input(agentsUpdateSchema)
	// 	.mutation(async ({ input: { id, ...input }, ctx }) => {
	// 		const [updatedAgent] = await db
	// 			.update(agents)
	// 			.set(input)
	// 			.where(and(and(eq(agents.userId, ctx.auth.user.id), eq(agents.id, id))))
	// 			.returning();

	// 		if (!updatedAgent) {
	// 			throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
	// 		}

	// 		return updatedAgent;
	// 	}),
});
