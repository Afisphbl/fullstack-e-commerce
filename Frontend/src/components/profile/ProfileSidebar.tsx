import { User, Package, Heart, Lock, LucideIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export type AccountTab = "profile" | "password" | "orders" | "wishlist";

interface SidebarItem {
  key: AccountTab;
  icon: LucideIcon;
  label: string;
}

interface ProfileSidebarProps {
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  userRole: string;
}

export const ProfileSidebar = ({
  activeTab,
  onTabChange,
  userRole,
}: ProfileSidebarProps) => {
  const { t } = useTranslation(["account", "common"]);
  const [, setSearchParams] = useSearchParams();

  const sidebarItems: SidebarItem[] = [
    { key: "profile", icon: User, label: t("account:tabs.profile") },
    { key: "password", icon: Lock, label: t("account:tabs.password") },
  ];

  if (userRole === "user") {
    sidebarItems.push({
      key: "orders",
      icon: Package,
      label: t("account:tabs.orders"),
    });
    sidebarItems.push({
      key: "wishlist",
      icon: Heart,
      label: t("account:tabs.wishlist"),
    });
  }

  const handleTabClick = (key: AccountTab) => {
    onTabChange(key);
    setSearchParams(key === "profile" ? {} : { tab: key });
  };

  return (
    <aside className="space-y-2 self-start md:sticky md:top-24">
      {sidebarItems.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => handleTabClick(key)}
          className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
            activeTab === key
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Icon className="h-5 w-5" /> {label}
        </button>
      ))}
    </aside>
  );
};
