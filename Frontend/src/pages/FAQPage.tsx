import { HelpCircle, MessagesSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

const FAQPage = () => {
  usePageTitle("FAQ - Coming Soon");

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-6 text-primary animate-pulse">
        <HelpCircle className="h-12 w-12" />
      </div>

      <h1 className="mb-4 text-4xl font-display font-bold text-foreground md:text-5xl">
        Frequently Asked <span className="text-gradient">Questions</span>
      </h1>

      <p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground">
        We're gathering all your common queries about our products, shipping,
        and returns. Our comprehensive FAQ section is currently under
        construction.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg" className="shadow-neon">
          <Link to="/contact">Contact Support</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <div className="mt-16 flex items-center gap-3 text-sm text-muted-foreground">
        <MessagesSquare className="h-4 w-4 text-primary" />
        <span>
          Need immediate help? Our support team is available via the contact
          form.
        </span>
      </div>
    </div>
  );
};

export default FAQPage;
