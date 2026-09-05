import type { Metadata } from "next";
import DevelopmentPage from "../Composent/DevelopmentPage";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog Souflydev, actuellement en développement.",
};

export default function BlogPage() {
  return (
    <DevelopmentPage
      title="Blog en développement"
      description="Les prochains articles sur le web, le design et le digital seront bientôt disponibles."
    />
  );
}
