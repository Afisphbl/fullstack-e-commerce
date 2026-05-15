import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, setAuthToken } from "@/lib/api-client";
import { AuthResponse, fetchEthiopianCities } from "@/lib/api";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
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
import { useTranslation } from "react-i18next";

export default function Signup() {
  const { t } = useTranslation("auth");
  usePageTitle(t("seo.signup.title"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signupSchema = z
    .object({
      name: z
        .string()
        .min(2, t("validation.nameMin"))
        .max(60, t("validation.nameMax")),
      email: z.string().email(t("validation.emailInvalid")),
      password: z.string().min(8, t("validation.passwordMin")),
      passwordConfirm: z.string().min(8, t("validation.confirmPasswordRequired")),
      country: z.string().optional(),
      city: z.string().optional(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t("validation.passwordsNoMatch"),
      path: ["passwordConfirm"],
    });

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      country: "Ethiopia",
      city: "",
    },
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["ethiopianCities"],
    queryFn: fetchEthiopianCities,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof signupSchema>) =>
      apiFetch<AuthResponse>("/api/v1/auth/signup", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      // Store the token
      if (data.token) {
        setAuthToken(data.token);
      }

      // Request location permission proactively upon auth (Currently disabled)
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

      toast.success(t("accountCreatedSuccess"));
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

  const onSubmit = (values: z.infer<typeof signupSchema>) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            {t("createAccount")}
          </CardTitle>
          <CardDescription>
            {t("createAccountDescription")}
          </CardDescription>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fullName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("fullNamePlaceholder")}
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("country")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Ethiopia" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("city")}</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            list="ethiopian-cities"
                            placeholder={t("cityPlaceholder")}
                            {...field}
                          />
                          <datalist id="ethiopian-cities">
                            {cities.map((city) => (
                              <option key={city} value={city} />
                            ))}
                          </datalist>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? t("creatingAccount") : t("signup")}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              {t("alreadyHaveAccount")}{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                {t("login")}
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
