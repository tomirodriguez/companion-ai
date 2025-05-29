"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { z } from "zod";

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1, "Password is required"),
});

export const SignInView = () => {
	const router = useRouter()
	const [error, setError] = useState<null | string>("");
	const [pending, setPending] = useState(false);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		setError(null);

		authClient.signIn.email(
			{
				email: data.email,
				password: data.password,
				callbackURL: '/'
			},
			{
				onRequest: () => {
					setPending(true);
				},
				onSuccess: () => {
					router.push('/')
				},
				onError: ({ error }) => {
					setError(error.message);
					setPending(false);
				},
			},
		);
	};

	const onSocial = (provider: "github" | "google") => {
		setError(null);

		authClient.signIn.social(
			{
				provider,
				callbackURL: '/'
			},
			{
				onRequest: () => {
					setPending(true);
				},
				onError: ({ error }) => {
					setError(error.message);
					setPending(false);
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<Form {...form}>
						<form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-6">
								<div className="flex flex-col items-center text-center">
									<h1 className="text-2xl font-bold">Welcome back</h1>
									<p className="text-muted-foreground text-balanced">
										Login to your account
									</p>
								</div>
								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="m@example.com"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="******"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								{!!error && (
									<Alert className="bg-destructive/10 border-none">
										<OctagonAlertIcon className="size-4 !text-destructive" />
										<AlertTitle>{error}</AlertTitle>
									</Alert>
								)}
								<Button disabled={pending} className="w-full" type="submit">
									Sign In
								</Button>
								<div className="after-border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
									<span className="bg-card text-muted-foreground relative z-10 px-2">
										Or continue with
									</span>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<Button
										disabled={pending}
										variant="outline"
										type="button"
										className="w-full"
										onClick={() => onSocial("google")}
									>
										<FaGoogle />
										Google{" "}
									</Button>
									<Button
										disabled={pending}
										variant="outline"
										type="button"
										className="w-full"
										onClick={() => onSocial("github")}
									>
										<FaGithub />
										Github
									</Button>
								</div>
								<div className="text-center text-sm">
									Don't have an account{" "}
									<Link
										href="/sign-up"
										className="underline underline-offset-4"
									>
										Sign up
									</Link>
								</div>
							</div>
						</form>
					</Form>
					<div className="bg-radial from-green-500 to-green-900 relative hidden md:flex flex-col gap-y-4 items-center justify-center">
						<img
							src="/logo.svg"
							alt="Companion AI Logo"
							className="size-[92px]"
						/>
						<p className="text-2xl font-semibold text-white">Companion.AI</p>
					</div>
				</CardContent>
			</Card>
			<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
				By clicking continue, tou agree to our{" "}
				<Link href="/terms-of-service">Terms of Service</Link> and{" "}
				<Link href="/private-policy">Privacy Policy</Link>
			</div>
		</div>
	);
};
