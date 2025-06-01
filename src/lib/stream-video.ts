import "server-only";
import { StreamClient } from "@stream-io/node-sdk";

if (
	!process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY ||
	!process.env.STREAM_VIDEO_SECRET_KEY
) {
	throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set");
}

export const streamVideo = new StreamClient(
	process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY,
	process.env.STREAM_VIDEO_SECRET_KEY,
);
