import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSidebar, AccountTab } from "@/components/profile/ProfileSidebar";
import { ProfileInfoForm } from "@/components/profile/ProfileInfoForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { OrdersList } from "@/components/profile/OrdersList";
import { WishlistGrid } from "@/components/profile/WishlistGrid";

const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");

  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab") as AccountTab;
    if (
      tab === "orders" ||
      tab === "wishlist" ||
      tab === "profile" ||
      tab === "password"
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading your profile details..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ProfileHeader />

      <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-8">
        <ProfileSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={user.role}
        />

        <section className="bg-card rounded-lg border border-border p-6">
          {activeTab === "profile" && <ProfileInfoForm user={user} />}

          {activeTab === "password" && <PasswordChangeForm />}

          {activeTab === "orders" && user.role === "user" && <OrdersList />}

          {activeTab === "wishlist" && user.role === "user" && <WishlistGrid />}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
