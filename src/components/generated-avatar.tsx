import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback } from "./ui/avatar";

type GeneratedAvatarProps = {
	seed: string;
	className?: string;
	variant: "botttsNeutral" | "initials";
};
export const GeneratedAvatar: React.FC<GeneratedAvatarProps> = ({
	variant,
	seed,
	className,
}) => {
	let avatar: ReturnType<typeof createAvatar>;

	if (variant === "botttsNeutral") {
		avatar = createAvatar(botttsNeutral, {
			seed,
		});
	} else {
		avatar = createAvatar(initials, {
			seed,
			fontWeight: 500,
			fontSize: 42,
		});
	}

	return (
		<Avatar className={className}>
			<AvatarImage src={avatar.toDataUri()} alt="Avatar" />
			<AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
		</Avatar>
	);
};
