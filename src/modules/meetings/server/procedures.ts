import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from "@/constants";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { generateAvatarUri } from "@/lib/avatar";
import { streamVideo } from "@/lib/stream-video";
import {
	createTRPCRouter,
	premiumProcedure,
	protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { meetingStatusValues } from "../constants";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";

export const meetingsRouter = createTRPCRouter({
	generateToken: protectedProcedure.mutation(async ({ ctx }) => {
		await streamVideo.upsertUsers([
			{
				id: ctx.auth.user.id,
				name: ctx.auth.user.name,
				role: "admin",
				image:
					ctx.auth.user.image ??
					generateAvatarUri({
						seed: ctx.auth.user.name,
						variant: "initials",
					}),
			},
		]);

		// const expirationTime = Math.floor(Date.now() / 1000) + 3600;
		// const issuedAt = Math.floor(Date.now() / 1000) - 60;

		const token = streamVideo.generateUserToken({
			user_id: ctx.auth.user.id,
			// exp: expirationTime,
			// validity_in_seconds: issuedAt,
		});

		return token;
	}),
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
					agentId: z.string().nullish(),
					status: z.enum(meetingStatusValues).nullish(),
				})
				.default({
					page: DEFAULT_PAGE,
					pageSize: DEFAULT_PAGE_SIZE,
				}),
		)
		.query(async ({ ctx, input }) => {
			const { page, pageSize, search, status, agentId } = input;

			const data = await db
				.select({
					...getTableColumns(meetings),
					agent: agents,
					duration:
						sql<number>`EXTRACT(EPOCH FROM (${meetings.endedAt} - ${meetings.startedAt}))`.as(
							"duration",
						),
				})
				.from(meetings)
				.innerJoin(agents, eq(meetings.agentId, agents.id))
				.where(
					and(
						eq(meetings.userId, ctx.auth.user.id),
						search ? ilike(meetings.name, `%$${search}%`) : undefined,
						status ? eq(meetings.status, status) : undefined,
						agentId ? eq(meetings.agentId, agentId) : undefined,
					),
				)
				.orderBy(desc(meetings.createdAt), desc(meetings.id))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db
				.select({ count: count() })
				.from(meetings)
				.innerJoin(agents, eq(meetings.agentId, agents.id))
				.where(
					and(
						eq(meetings.userId, ctx.auth.user.id),
						search ? ilike(meetings.name, `%$${search}%`) : undefined,
						status ? eq(meetings.status, status) : undefined,
						agentId ? eq(meetings.agentId, agentId) : undefined,
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
				.select({
					...getTableColumns(meetings),
					agent: agents,
					duration:
						sql<number>`EXTRACT(EPOCH FROM (${meetings.endedAt} - ${meetings.startedAt}))`.as(
							"duration",
						),
				})
				.from(meetings)
				.innerJoin(agents, eq(meetings.agentId, agents.id))
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
	create: premiumProcedure("meetings")
		.input(meetingsInsertSchema)
		.mutation(async ({ input, ctx }) => {
			const [createdMeeting] = await db
				.insert(meetings)
				.values({
					...input,
					userId: ctx.auth.user.id,
				})
				.returning();

			const [existingAgent] = await db
				.select()
				.from(agents)
				.where(eq(agents.id, createdMeeting.agentId));

			if (!existingAgent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Agent not found",
				});
			}

			const call = streamVideo.video.call("default", createdMeeting.id);

			await call.create({
				data: {
					created_by_id: ctx.auth.user.id,
					custom: {
						meetingId: createdMeeting.id,
						meetingName: createdMeeting.name,
					},
					settings_override: {
						transcription: {
							language: "en",
							mode: "auto-on",
							closed_caption_mode: "auto-on",
						},
						recording: {
							mode: "auto-on",
							quality: "1080p",
						},
					},
				},
			});

			await streamVideo.upsertUsers([
				{
					id: existingAgent.id,
					name: existingAgent.name,
					role: "user",
					image: generateAvatarUri({
						seed: existingAgent.name,
						variant: "botttsNeutral",
					}),
				},
			]);

			return createdMeeting;
		}),
	remove: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const [removedMeeting] = await db
				.delete(meetings)
				.where(
					and(
						and(
							eq(meetings.userId, ctx.auth.user.id),
							eq(meetings.id, input.id),
						),
					),
				)
				.returning();

			if (!removedMeeting) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
			}

			return removedMeeting;
		}),
	update: protectedProcedure
		.input(meetingsUpdateSchema)
		.mutation(async ({ input: { id, ...input }, ctx }) => {
			const [updatedMeeting] = await db
				.update(meetings)
				.set(input)
				.where(
					and(and(eq(meetings.userId, ctx.auth.user.id), eq(meetings.id, id))),
				)
				.returning();

			if (!updatedMeeting) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}

			return updatedMeeting;
		}),
});
