import { Card } from "react-bootstrap";

type BlogSidebarProps = {
  categories?: string[];
};

const defaultCategories = [
  "Development",
  "Design",
  "Tutorials",
  "Infrastructure",
  "Feedback",
];

export default function BlogSidebar({
  categories = defaultCategories,
}: BlogSidebarProps) {
  return (
    <Card className="border-0 shadow-sm p-4">
      <h3 className="h5 fw-bold mb-3">Categories</h3>
      <ul className="list-unstyled mb-0">
        {categories.map((category) => (
          <li key={category} className="mb-2">
            <a href="#" className="text-body text-decoration-none">
              {category}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
