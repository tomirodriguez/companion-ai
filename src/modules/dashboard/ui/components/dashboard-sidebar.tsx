"use client";

import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BotIcon, StarIcon, VideoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardTrial } from "./dashboard-trial";
import { DashboardUserButton } from "./dashboard-user-button";

const firstSection = [
	{
		icon: VideoIcon,
		label: "Meetings",
		href: "/meetings",
	},
	{
		icon: BotIcon,
		label: "Agents",
		href: "/agents",
	},
];

const secondSection = [
	{
		icon: StarIcon,
		label: "Upgrade",
		href: "/upgrade",
	},
];

export const DashboardSidebar = () => {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader className="text-sidebar-accent-foreground">
				<Link className="flex items-center gap-2 px-2 pt-2" href="/">
					<Image src="/logo.svg" height={36} width={36} alt="AI Companion" />
					<p className="text-2xl font-semibold">AI Companion</p>
				</Link>
			</SidebarHeader>
			<div className="px-2 py-2">
				<Separator className="opacity-10 text-muted" />
			</div>
			<SidebarContent>
				<SidebarGroup>
					<SidebarContent>
						<SidebarMenu>
							{firstSection.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.href}
										className={cn(
											"h-10 hover:bg-linear-to-r/oklch from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
											pathname === item.href && "bg-linear-to-r/oklch",
										)}
									>
										<Link href={item.href} className="">
											<item.icon className="size-5" />
											<span className="text-sm font-medium tracking-tight">
												{item.label}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarContent>
				</SidebarGroup>
				<div className="px-2 py-2">
					<Separator className="opacity-10 text-muted" />
				</div>
				<SidebarGroup>
					<SidebarContent>
						<SidebarMenu>
							{secondSection.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.href}
										className={cn(
											"h-10 hover:bg-linear-to-r/oklch from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
											pathname === item.href && "bg-linear-to-r/oklch",
										)}
									>
										<Link href={item.href} className="">
											<item.icon className="size-5" />
											<span className="text-sm font-medium tracking-tight">
												{item.label}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="text-white">
				<DashboardTrial />
				<DashboardUserButton />
			</SidebarFooter>
		</Sidebar>
	);
};
