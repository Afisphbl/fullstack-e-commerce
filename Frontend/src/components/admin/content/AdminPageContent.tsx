import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPageContent, updatePageContent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const PAGES = [
  { value: "home", label: "Home Page" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
  { value: "faq", label: "FAQ Page" },
];

export default function AdminPageContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState("home");

  const { data: pageContent, isLoading } = useQuery({
    queryKey: ["pageContent", selectedPage],
    queryFn: () => fetchPageContent(selectedPage),
    enabled: !!selectedPage,
  });

  const [sections, setSections] = useState<any[]>([]);

  // Update sections when pageContent changes
  useState(() => {
    if (pageContent?.sections) {
      setSections(pageContent.sections);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { sections: any[] }) =>
      updatePageContent(selectedPage, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageContent", selectedPage] });
      toast({
        title: "Success",
        description: "Page content updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update page content",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ sections });
  };

  const handleSectionChange = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const handleItemChange = (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => {
    const newSections = [...sections];
    const items = [...(newSections[sectionIndex].items || [])];
    items[itemIndex] = { ...items[itemIndex], [field]: value };
    newSections[sectionIndex] = { ...newSections[sectionIndex], items };
    setSections(newSections);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page Content</h2>
          <p className="text-muted-foreground">
            Manage content for different pages
          </p>
        </div>
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGES.map((page) => (
              <SelectItem key={page.value} value={page.value}>
                {page.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section, sectionIndex) => (
          <div key={section.key} className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-lg font-semibold capitalize">
              {section.key.replace(/-/g, " ")} Section
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.title !== undefined && (
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={section.title || ""}
                    onChange={(e) =>
                      handleSectionChange(sectionIndex, "title", e.target.value)
                    }
                  />
                </div>
              )}

              {section.subtitle !== undefined && (
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={section.subtitle || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        sectionIndex,
                        "subtitle",
                        e.target.value
                      )
                    }
                  />
                </div>
              )}
            </div>

            {section.description !== undefined && (
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={section.description || ""}
                  onChange={(e) =>
                    handleSectionChange(
                      sectionIndex,
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                />
              </div>
            )}

            {section.buttonText !== undefined && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={section.buttonText || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        sectionIndex,
                        "buttonText",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={section.buttonLink || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        sectionIndex,
                        "buttonLink",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            )}

            {section.items && section.items.length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Items</Label>
                {section.items.map((item: any, itemIndex: number) => (
                  <div
                    key={itemIndex}
                    className="p-4 border rounded-lg space-y-3 bg-muted/30"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.title !== undefined && (
                        <div className="space-y-2">
                          <Label className="text-sm">Title</Label>
                          <Input
                            value={item.title || ""}
                            onChange={(e) =>
                              handleItemChange(
                                sectionIndex,
                                itemIndex,
                                "title",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                      {item.value !== undefined && (
                        <div className="space-y-2">
                          <Label className="text-sm">Value</Label>
                          <Input
                            value={item.value || ""}
                            onChange={(e) =>
                              handleItemChange(
                                sectionIndex,
                                itemIndex,
                                "value",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                      {item.label !== undefined && (
                        <div className="space-y-2">
                          <Label className="text-sm">Label</Label>
                          <Input
                            value={item.label || ""}
                            onChange={(e) =>
                              handleItemChange(
                                sectionIndex,
                                itemIndex,
                                "label",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                    {item.description !== undefined && (
                      <div className="space-y-2">
                        <Label className="text-sm">Description</Label>
                        <Textarea
                          value={item.description || ""}
                          onChange={(e) =>
                            handleItemChange(
                              sectionIndex,
                              itemIndex,
                              "description",
                              e.target.value
                            )
                          }
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
