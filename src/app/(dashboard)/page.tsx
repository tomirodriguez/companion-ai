import { authenticationCheck } from "@/lib/authentication-check";
import { HomeView } from "@/modules/home/ui/views/home-view";

export default async function Home() {
	await authenticationCheck();

	return <HomeView />;
}
