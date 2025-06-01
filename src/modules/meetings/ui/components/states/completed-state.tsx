import { EmptyState } from "@/components/empty-state";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDuration } from "@/lib/utils";
import type { MeetingGetOne } from "@/modules/meetings/types";
import { format } from "date-fns/format";
import {
	BookOpenTextIcon,
	ClockFadingIcon,
	FileTextIcon,
	FileVideoIcon,
	SparkleIcon,
} from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";

type CompletedStateProps = {
	data: MeetingGetOne;
};

export const CompletedState: React.FC<CompletedStateProps> = ({ data }) => {
	return (
		<div className="flex flex-col gap-y-5">
			<Tabs defaultValue="summary">
				<div className="bg-white rounded-lg border px-3">
					<ScrollArea>
						<TabsList className="p-0 bg-background justify-start rounded-none h-13">
							<TabsTrigger
								value="summary"
								className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
							>
								<BookOpenTextIcon />
								Summary
							</TabsTrigger>
							<TabsTrigger
								value="recording"
								className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
							>
								<FileVideoIcon />
								Recording
							</TabsTrigger>
							<TabsTrigger
								disabled
								value="transcript"
								className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
							>
								<FileTextIcon />
								Transcript
							</TabsTrigger>
							<TabsTrigger
								disabled
								value="chat"
								className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
							>
								<SparkleIcon />
								Ask AI
							</TabsTrigger>
						</TabsList>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</div>
				<TabsContent value="recording">
					<div className="bg-white rounded-lg border px-4 py-5">
						{data.recordingUrl ? (
							<video className="w-full rounded-lg" controls>
								<source src={data.recordingUrl} />
								<track kind="captions" src="" srcLang="en" default />
								Your browser does not support the video.
							</video>
						) : (
							<EmptyState
								title="No recording"
								description="This conversation has no recording available"
							/>
						)}
					</div>
				</TabsContent>
				<TabsContent value="summary">
					<div className="bg-white rounded-lg border">
						<div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
							<h2 className="text-2xl font-medium capitalize">{data.name}</h2>
							<div className="flex gap-x-2 items-center">
								<Link
									href={`/agents/${data.agent.id}`}
									className="flex items-center gap-x-2 underline underline-offset-4 capitalize"
								>
									<GeneratedAvatar
										seed={data.agent.name}
										variant="botttsNeutral"
										className="size-5"
									/>
									{data.agent.name}
								</Link>{" "}
								{data.startedAt && <p>{format(data.startedAt, "PPP")}</p>}
							</div>
							<div className="flex gap-x-2 items-center">
								<SparkleIcon className="size-4" />
								<p>General summary</p>
							</div>
							<Badge
								variant="outline"
								className="flex items-center gap-x-2 [&>svg]:size-4"
							>
								<ClockFadingIcon className="text-primary" />
								{data.duration ? formatDuration(data.duration) : "No duration"}
							</Badge>
							<div>
								<Markdown
									components={{
										h1: (props) => (
											<h1 className="text-2xl font-medium mb-6" {...props} />
										),
										h2: (props) => (
											<h2 className="text-xl font-medium mb-6" {...props} />
										),
										h3: (props) => (
											<h3 className="text-lg font-medium mb-6" {...props} />
										),
										h4: (props) => (
											<h4 className="text-base font-medium mb-6" {...props} />
										),
										p: (props) => (
											<p className="leading-relaxed mb-6" {...props} />
										),
										ul: (props) => (
											<ul
												className="list-decimal list-inside mb-6"
												{...props}
											/>
										),
										ol: (props) => (
											<ol className="list-disc list-inside mb-6" {...props} />
										),
										li: (props) => <li className="mb-1" {...props} />,
										strong: (props) => (
											<strong className="font-semibold" {...props} />
										),
										code: (props) => (
											<code
												className="bg-gray-100 px-1 py-0.5 rounded"
												{...props}
											/>
										),
										blockquote: (props) => (
											<blockquote
												className="border-l-4 pl-4 italic my-4s"
												{...props}
											/>
										),
									}}
								>
									{data.summary}
								</Markdown>
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};
