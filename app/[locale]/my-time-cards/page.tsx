import type { Metadata } from "next";
import MyTimeCards from "@/components/my-time-cards";
export const metadata: Metadata = { title: "My Time Cards", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function MyTimeCardsPage() { return <MyTimeCards />; }
