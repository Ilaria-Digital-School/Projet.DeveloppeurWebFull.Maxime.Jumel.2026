import type { Metadata } from "next";
import DevelopmentPage from "../Composent/DevelopmentPage";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Portfolio de projets Souflydev, actuellement en développement.",
};

export default function PortfolioPage() {
  return (
    <DevelopmentPage
      title="Portfolio en développement"
      description="Cette page arrive bientôt. Nos projets seront bientôt disponibles ici."
    />
  );
}
