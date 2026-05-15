import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

export default function Signup() {
  const { t } = useTranslation("auth");
  usePageTitle(t("signup.pageTitle"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Build schema inside component so validation messages are reactive to language
  const signupSchema = z
    .object({
      name: z
        .string()
        .min(2, t("validation.nameLength"))
        .max(60, t("validation.nameLength")),
      email: z.string().email(t("validation.emailInvalid")),
      password: z.string().min(8, t("validation.passwordLength")),
      passwordConfirm: z
        .string()
        .min(8, t("validation.passwordConfirmRequired")),
      country: z.string().optional(),
      city: z.string().optional(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t("validation.passwordMismatch"),
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
      if (data.token) setAuthToken(data.token);
      toast.success(t("signup.successToast"));
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
            {t("signup.title")}
          </CardTitle>
          <CardDescription>{t("signup.description")}</CardDescription>
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
                    <FormLabel>{t("signup.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("signup.namePlaceholder")}
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
                    <FormLabel>{t("signup.emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("signup.emailPlaceholder")}
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
                    <FormLabel>{t("signup.passwordLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("signup.passwordPlaceholder")}
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
                    <FormLabel>{t("signup.confirmPasswordLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("signup.confirmPasswordPlaceholder")}
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
                      <FormLabel>{t("signup.nameLabel")}</FormLabel>
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
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            list="ethiopian-cities"
                            placeholder="Select your city"
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
                {mutation.isPending
                  ? t("signup.submitting")
                  : t("signup.submitButton")}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t("signup.hasAccount")}{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              {t("signup.loginLink")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
