import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

export default function Login() {
  const { t } = useTranslation("auth");
  usePageTitle(t("login.pageTitle"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Build schema inside component so validation messages are reactive to language
  const loginSchema = z.object({
    email: z.string().email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof loginSchema>) =>
      apiFetch<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      if (data.token) setAuthToken(data.token);
      toast.success(t("login.successToast"));
      queryClient.setQueryData(["currentUser"], data.data.user);
      if (isAdminRole(data.data.user.role)) {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            {t("login.title")}
          </CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
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
                    <FormLabel>{t("login.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("login.emailPlaceholder")}
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
                    <FormLabel>{t("login.passwordLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("login.passwordPlaceholder")}
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
                        {t("login.forgotPassword")}
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
                {mutation.isPending
                  ? t("login.submitting")
                  : t("login.submitButton")}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t("login.noAccount")}{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium"
            >
              {t("login.signupLink")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
