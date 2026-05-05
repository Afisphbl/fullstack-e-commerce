import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg min-w-[350px] sm:min-w-[450px]",
          error: "!bg-destructive !text-destructive-foreground !border-destructive",
          success: "!bg-emerald-500 !text-white !border-emerald-600",
          warning: "!bg-amber-500 !text-white !border-amber-600",
          info: "!bg-blue-500 !text-white !border-blue-600",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "!bg-background !text-foreground !border-border hover:!bg-muted",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
