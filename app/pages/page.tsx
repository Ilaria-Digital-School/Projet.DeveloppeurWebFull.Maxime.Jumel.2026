import type { Metadata } from "next";
import DevelopmentPage from "../Composent/DevelopmentPage";

export const metadata: Metadata = {
  title: "Pages",
  description: "Pages Souflydev, actuellement en développement.",
};

export default function PagesPage() {
  return (
    <DevelopmentPage
      title="Pages en développement"
      description="Cette section sera bientôt disponible avec toutes les pages de Souflydev."
    />
  );
}
