import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AdminUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: AdminUser | null;
  isStaffTab: boolean;
  onSubmit: (values: any) => void;
  isPending: boolean;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onOpenChange,
  editingUser,
  isStaffTab,
  onSubmit,
  isPending,
}) => {
  const { t } = useTranslation("admin");

  const ROLES = [
    { value: "user", label: t("customer") },
    { value: "admin", label: t("admin") },
  ] as const;

  const STATUSES = [
    { value: "active", label: t("active") },
    { value: "pending", label: t("pending") },
    { value: "suspended", label: t("suspended") },
  ] as const;

  const userFormSchema = z
    .object({
      name: z.string().min(2, t("fullNameRequired")),
      email: z.string().email(t("validEmail")),
      phone: z.string().optional(),
      photo: z.any().optional(),
      role: z.enum(["user", "admin"]),
      status: z.enum(["active", "pending", "suspended"]),
      permissions: z.string().optional(),
      password: z.string().optional(),
      passwordConfirm: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (values.password && values.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: t("passwordMin"),
        });
      }

      if (values.password !== values.passwordConfirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passwordConfirm"],
          message: t("passwordsMatch"),
        });
      }
    });

  type UserFormValues = z.infer<typeof userFormSchema>;

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    editingUser?.photo || null
  );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      phone: editingUser?.phone || "",
      photo: editingUser?.photo || "",
      role: editingUser?.role || (isStaffTab ? "admin" : "user"),
      status: editingUser?.status || "active",
      permissions: editingUser?.permissions.join(", ") || "",
      password: "",
      passwordConfirm: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: editingUser?.name || "",
        email: editingUser?.email || "",
        phone: editingUser?.phone || "",
        photo: editingUser?.photo || "",
        role: editingUser?.role || (isStaffTab ? "admin" : "user"),
        status: editingUser?.status || "active",
        permissions: editingUser?.permissions.join(", ") || "",
        password: "",
        passwordConfirm: "",
      });
      setPreviewUrl(editingUser?.photo || null);
    }
  }, [open, editingUser, isStaffTab, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[28px] border-none p-0 shadow-elevated flex flex-col max-h-[96vh] sm:max-h-[90vh]">
        <DialogHeader className="border-b border-border/70 px-4 sm:px-6 py-4 sm:py-5">
          <DialogTitle className="text-2xl font-display">
            {t("editUser")}
          </DialogTitle>
          <DialogDescription>{t("editUserDesc")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/30">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fullName")}</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-11 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-11 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("phoneNumber")}</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-11 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>{t("profilePicture")}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          {previewUrl && (
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/30">
                              <img
                                src={previewUrl}
                                alt="Profile preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            className="h-11 rounded-xl pt-[7px] text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPreviewUrl(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("role")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "user") {
                            form.setValue("permissions", "");
                          }
                        }}
                        disabled={!!editingUser}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("accountStatus")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUSES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("permissions")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        disabled={form.watch("role") === "user"}
                        placeholder={t("permissionsPlaceholder")}
                        className="rounded-2xl"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {t("permissionsHint")}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border/70 p-4 sm:p-6 sm:flex-row sm:justify-end bg-background sticky bottom-0 rounded-b-[28px]">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" className="rounded-xl" disabled={isPending}>
                {isPending ? t("saving") : t("updateUser")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
