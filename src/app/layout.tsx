import type { Metadata } from "next";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "AcademicPro",
  description: "Assignment help platform with dashboards for students, writers, and admins.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
