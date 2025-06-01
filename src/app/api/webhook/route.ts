import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { streamVideo } from "@/lib/stream-video";
import type {
	CallEndedEvent,
	CallRecordingReadyEvent,
	CallSessionParticipantLeftEvent,
	CallSessionStartedEvent,
	CallTranscriptionReadyEvent,
} from "@stream-io/node-sdk";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

function verifySignatureWithSDK(body: string, signature: string): boolean {
	return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
	const signature = req.headers.get("x-signature");
	const apiKey = req.headers.get("x-api-key");

	if (!signature || !apiKey || !process.env.OPEN_AI_API_KEY) {
		return NextResponse.json(
			{
				error: "Missing signature or API key",
			},
			{
				status: 404,
			},
		);
	}

	const body = await req.text();

	if (!verifySignatureWithSDK(body, signature)) {
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
	}

	let payload: unknown;

	try {
		payload = JSON.parse(body) as Record<string, unknown>;
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 401 });
	}

	const eventType = (payload as Record<string, unknown>)?.type;

	if (eventType === "call.session_started") {
		const event = payload as CallSessionStartedEvent;
		const meetingId = event.call.custom?.meetingId;

		if (!meetingId) {
			return NextResponse.json({ error: "Missing meetingId" }, { status: 404 });
		}

		const [existingMeeting] = await db
			.select()
			.from(meetings)
			.where(and(eq(meetings.id, meetingId), eq(meetings.status, "upcoming")))
			.limit(1);

		if (!existingMeeting) {
			return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
		}

		await db
			.update(meetings)
			.set({
				status: "active",
				startedAt: new Date(),
			})
			.where(eq(meetings.id, meetingId));

		const [existingAgent] = await db
			.select()
			.from(agents)
			.where(eq(agents.id, existingMeeting.agentId))
			.limit(1);

		if (!existingAgent) {
			return NextResponse.json({ error: "Agent not found" }, { status: 404 });
		}

		const call = streamVideo.video.call("default", meetingId);

		const realtimeClient = await streamVideo.video.connectOpenAi({
			call,
			openAiApiKey: process.env.OPEN_AI_API_KEY,
			agentUserId: existingAgent.id,
		});

		realtimeClient.updateSession({
			instructions: existingAgent.instructions,
		});
	} else if (eventType === "call.session_participant_left") {
		const event = payload as CallSessionParticipantLeftEvent;
		const meetingId = event.call_cid.split(":")[1];

		if (!meetingId) {
			return NextResponse.json(
				{ error: "Meeting Id not found" },
				{ status: 404 },
			);
		}

		const call = streamVideo.video.call("default", meetingId);
		await call.end();
	} else if (eventType === "call.session_ended") {
		const event = payload as CallEndedEvent;
		const meetingId = event.call.custom?.meetingId;

		if (!meetingId) {
			return NextResponse.json({ error: "Missing meetingId" }, { status: 404 });
		}

		await db
			.update(meetings)
			.set({
				status: "processing",
				endedAt: new Date(),
			})
			.where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
	} else if (eventType === "call.transcription_ready") {
		const event = payload as CallTranscriptionReadyEvent;
		const meetingId = event.call_cid.split(":")[1];

		if (!meetingId) {
			return NextResponse.json(
				{ error: "Meeting Id not found" },
				{ status: 404 },
			);
		}

		const [updatedMeeting] = await db
			.update(meetings)
			.set({
				transcriptUrl: event.call_transcription.url,
			})
			.where(eq(meetings.id, meetingId))
			.returning();

		if (!updatedMeeting) {
			return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
		}

		await inngest.send({
			name: "meetings/processing",
			data: {
				meetingId: updatedMeeting.id,
				transcriptUrl: updatedMeeting.transcriptUrl,
			},
		});
	} else if (eventType === "call.recording_ready") {
		const event = payload as CallRecordingReadyEvent;
		const meetingId = event.call_cid.split(":")[1];

		if (!meetingId) {
			return NextResponse.json(
				{ error: "Meeting Id not found" },
				{ status: 404 },
			);
		}

		await db
			.update(meetings)
			.set({
				recordingUrl: event.call_recording.url,
			})
			.where(eq(meetings.id, meetingId))
			.returning();
	}

	return NextResponse.json({ status: "ok" });
}
