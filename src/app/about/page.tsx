import type { Metadata } from "next"
import { AboutArchive } from "@/components/about/about-archive"

export const metadata: Metadata = {
  title: "About · Campus Forum Archive",
  description: "论坛建站档案与编者手记。",
  robots: { index: false, follow: false },
}

export default function AboutPage() {
  return <AboutArchive />
}
