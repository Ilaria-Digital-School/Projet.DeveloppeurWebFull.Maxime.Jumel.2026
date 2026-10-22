import type { Metadata } from "next";
import SiteNavbar from "../Composent/SiteNavbar";
import Footer from "../Composent/Footer";
import BlogHero from "../Composent/BlogHero";
import BlogSidebar from "../Composent/BlogSidebar";
import BlogPosts from "../Composent/BlogPosts";

export const metadata: Metadata = {
  title: "Souflydev | Blog Web Development & Digital Strategy",
  description:
    "Read Souflydev articles about web development, mobile apps, performance, and digital strategy for growing businesses.",
};

export default function BlogPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <BlogHero />
        <div className="container py-5">
          <div className="row">
            <div className="col-12 mb-4">
              <h2 className="fw-bold display-5">List of articles</h2>
              <hr />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-4 col-lg-3 mb-4">
              <BlogSidebar />
            </div>
            <div className="col-12 col-md-8 col-lg-9">
              <BlogPosts />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
