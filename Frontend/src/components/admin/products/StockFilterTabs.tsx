import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export type StockTab = "in_stock" | "out_of_stock" | "low_stock";

interface StockFilterTabsProps {
  activeTab: StockTab | null;
  onTabChange: (tab: StockTab | null) => void;
}

export const StockFilterTabs = ({ activeTab, onTabChange }: StockFilterTabsProps) => {
  const { t } = useTranslation("admin");

  const tabs: { key: StockTab; label: string; count: number | null }[] = [
    { key: "in_stock", label: t("inStock"), count: null },
    { key: "out_of_stock", label: t("outOfStock"), count: null },
    { key: "low_stock", label: t("lowStock"), count: null },
  ];

  const handleTabClick = (tab: StockTab) => {
    if (activeTab === tab) {
      onTabChange(null);
    } else {
      onTabChange(tab);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => handleTabClick(tab.key)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
            activeTab === tab.key
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
