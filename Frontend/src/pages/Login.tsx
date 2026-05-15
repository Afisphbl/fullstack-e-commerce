import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, setAuthToken } from "@/lib/api-client";
import { AuthResponse } from "@/lib/api";
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
import { isAdminRole } from "@/lib/roles";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "react-i18next";
import { mapAuthErrorMessage } from "@/lib/auth-error-messages";

export default function Login() {
  const { t } = useTranslation("auth");
  usePageTitle(t("seo.login.title"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginSchema = z.object({
    email: z.string().email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof loginSchema>) =>
      apiFetch<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      // Store the token
      if (data.token) {
        setAuthToken(data.token);
      }

      // Request location permission proactively upon auth (Currently Disabled)
      /*
      if ("geolocation" in navigator) {
        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions
            .query({ name: "geolocation" })
            .then((result) => {
              if (result.state !== "denied") {
                navigator.geolocation.getCurrentPosition(
                  () => {},
                  () => {}
                );
              }
            })
            .catch(() => {});
        } else {
          navigator.geolocation.getCurrentPosition(
            () => {},
            () => {}
          );
        }
      }
      */

      toast.success(t("loginSuccess"));
      queryClient.setQueryData(["currentUser"], data.data.user);
      if (isAdminRole(data.data.user.role)) {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    },
    onError: (error: Error) => {
      const errorKey = mapAuthErrorMessage(error.message);
      toast.error(t(errorKey));
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">{t("signIn")}</CardTitle>
          <CardDescription>{t("signInDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              autoComplete="off"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("emailPlaceholder")}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline mt-1"
                      >
                        {t("forgotPassword")}
                      </Link>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? t("signingIn") : t("signIn")}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              {t("dontHaveAccount")}{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                {t("signup")}
              </Link>
            </div>
            <div>
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary hover:underline"
              >
                ← {t("backToHome")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
