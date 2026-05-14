import { PenTool, Rocket, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

const BlogPage = () => {
  usePageTitle("Blog - Coming Soon");

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-6 text-primary animate-pulse">
        <PenTool className="h-12 w-12" />
      </div>

      <h1 className="mb-4 text-4xl font-display font-bold text-foreground md:text-5xl">
        Insights & Stories <span className="text-gradient">Coming Soon</span>
      </h1>

      <p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground">
        We're currently crafting high-quality articles, tech guides, and product
        reviews to help you get the most out of your devices. Stay tuned!
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg" className="shadow-neon">
          <Link to="/shop">Browse Products</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <div className="mt-16 flex items-center gap-2 text-sm text-muted-foreground">
        <Rocket className="h-4 w-4 animate-bounce" />
        <span>Stage: Content Development Phase</span>
      </div>
    </div>
  );
};

export default BlogPage;
