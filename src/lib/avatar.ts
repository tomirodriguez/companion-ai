import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

type AvatarProps = {
	seed: string;
	variant: "botttsNeutral" | "initials";
};

export const generateAvatarUri = ({ seed, variant }: AvatarProps) => {
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

	return avatar.toDataUri();
};
