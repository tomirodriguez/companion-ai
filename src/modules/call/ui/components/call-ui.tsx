import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { useState } from "react";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";
import { CallLobby } from "./call-lobby";

type CallUIProps = {
	meetingName: string;
};

export const CallUI: React.FC<CallUIProps> = ({ meetingName }) => {
	const call = useCall();
	const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

	const handleJoin = async () => {
		if (!call) return;

		await call.join();

		setShow("call");
	};
	const handleLeave = async () => {
		if (!call) return;

		await call.endCall();

		setShow("ended");
	};

	return (
		<StreamTheme className="h-full">
			{show === "lobby" && <CallLobby onJoin={handleJoin} />}
			{show === "call" && (
				<CallActive meetingName={meetingName} onLeave={handleLeave} />
			)}
			{show === "ended" && <CallEnded />}
		</StreamTheme>
	);
};
