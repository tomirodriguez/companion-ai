import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL)
	throw new Error("Please set up the DATABASE_URL env in your .env file");

const db = drizzle(process.env.DATABASE_URL);
