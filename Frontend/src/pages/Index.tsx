import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSections } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const Index = () => {
  usePageTitle("Home");

  const { data: sections, isLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: () => fetchSections(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {sections?.map((section: any) => (
        <SectionRenderer key={section._id || section.id} section={section} />
      ))}
    </div>
  );
};

export default Index;
