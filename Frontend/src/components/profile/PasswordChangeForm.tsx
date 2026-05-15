import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { ProfileResponse } from "@/lib/api";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const updatePasswordSchema = z
  .object({
    passwordCurrent: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    passwordConfirm: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "New passwords do not match",
    path: ["passwordConfirm"],
  });

export const PasswordChangeForm = () => {
  const { t } = useTranslation("profile");
  const queryClient = useQueryClient();

  const passwordForm = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      passwordCurrent: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (values: z.infer<typeof updatePasswordSchema>) =>
      apiFetch<ProfileResponse>("/api/v1/auth/updateMyPassword", {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      toast.success(t("passwordUpdated"));
      queryClient.setQueryData(["currentUser"], data.data.user);
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <h2 className="font-display font-semibold text-foreground mb-6 text-xl">
        {t("changePassword")}
      </h2>
      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit((values) =>
            updatePasswordMutation.mutate(values)
          )}
          className="space-y-4 max-w-md"
        >
          <FormField
            control={passwordForm.control}
            name="passwordCurrent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("currentPassword")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("newPassword")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("confirmPassword")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={updatePasswordMutation.isPending}
            className="mt-4"
          >
            {updatePasswordMutation.isPending
              ? t("saving")
              : t("updatePassword")}
          </Button>
        </form>
      </Form>
    </>
  );
};
