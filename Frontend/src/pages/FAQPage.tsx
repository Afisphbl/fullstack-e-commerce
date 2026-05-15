import { HelpCircle, MessagesSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/shared/SEOHead";

const FAQPage = () => {
  const { t } = useTranslation("faq");
  usePageTitle(t("seo.title"));

  return (
    <>
      <SEOHead
        title={t("seo.title")}
        description={t("seo.description")}
        keywords={t("seo.keywords")}
        type="website"
      />
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
        <div
          className="mb-6 rounded-full bg-primary/10 p-6 text-primary animate-pulse"
          aria-hidden="true"
        >
          <HelpCircle className="h-12 w-12" />
        </div>

        <h1 className="mb-4 text-4xl font-display font-bold text-foreground md:text-5xl">
          {t("title")}{" "}
          <span className="text-gradient">{t("titleHighlight")}</span>
        </h1>

        <p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground">
          {t("subtitle")}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="shadow-neon">
            <Link to="/contact">{t("contactSupport")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("backHome")}
            </Link>
          </Button>
        </div>

        <div className="mt-16 flex items-center gap-3 text-sm text-muted-foreground">
          <MessagesSquare className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{t("needHelp")}</span>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
