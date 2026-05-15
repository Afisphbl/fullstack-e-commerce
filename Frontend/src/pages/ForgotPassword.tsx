import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { MessageResponse } from "@/lib/api";
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

export default function ForgotPassword() {
  const { t } = useTranslation("auth");
  usePageTitle(t("seo.forgotPassword.title"));

  const forgotPasswordSchema = z.object({
    email: z.string().email(t("validation.emailInvalid")),
  });

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof forgotPasswordSchema>) =>
      apiFetch<MessageResponse>("/api/v1/auth/forgotPassword", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      toast.success(data.message || t("passwordResetSent"));
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    mutation.mutate(values);
  };

  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-3xl font-bold'>{t("forgotPasswordTitle")}</CardTitle>
          <CardDescription>
            {t("forgotPasswordDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("emailPlaceholder")} {...field} />
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
                {mutation.isPending ? t("sending") : t("sendResetLink")}
              </Button>
            </form>
          </Form>
          <div className='mt-4 text-center text-sm space-y-2'>
            <div>
              {t("rememberPassword")}{" "}
              <Link
                to='/login'
                className='text-primary hover:underline font-medium'
              >
                {t("backToLogin")}
              </Link>
            </div>
            <div>
              <Link
                to='/'
                className='text-muted-foreground hover:text-primary hover:underline'
              >
                ← {t("backToHome", "Back to Home")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
