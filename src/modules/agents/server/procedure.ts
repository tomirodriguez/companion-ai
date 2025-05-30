import { db } from "@/db";
import { agents } from "@/db/schema";
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { agentsInsertSchema } from "../schemas";

export const agentsRouter = createTRPCRouter({
	getMany: protectedProcedure.query(async ({ ctx }) => {
		const data = await db
			.select()
			.from(agents)
			.where(eq(agents.userId, ctx.auth.user.id));

		return data;
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

			return existingAgent;
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
