import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { ProfileResponse } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const { t } = useTranslation("auth");
  usePageTitle(t("seo.resetPassword.title"));
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const resetPasswordSchema = z
    .object({
      password: z.string().min(8, t("validation.passwordMin")),
      passwordConfirm: z.string().min(8, t("validation.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t("validation.passwordsNoMatch"),
      path: ["passwordConfirm"],
    });

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof resetPasswordSchema>) =>
      apiFetch<ProfileResponse>(`/api/v1/auth/resetPassword/${token}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      toast.success(t("passwordResetSuccess"));
      queryClient.setQueryData(["currentUser"], data.data.user);
      navigate("/profile");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    mutation.mutate(values);
  };

  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-3xl font-bold'>{t("resetPassword")}</CardTitle>
          <CardDescription>{t("resetPasswordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder={t("passwordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='passwordConfirm'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirmNewPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder={t("passwordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full'
                disabled={mutation.isPending}
              >
                {mutation.isPending ? t("resetting") : t("resetPassword")}
              </Button>
            </form>
          </Form>
          <div className='mt-4 text-center text-sm'>
            <Link
              to='/'
              className='text-muted-foreground hover:text-primary hover:underline'
            >
              ← {t("backToHome")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
