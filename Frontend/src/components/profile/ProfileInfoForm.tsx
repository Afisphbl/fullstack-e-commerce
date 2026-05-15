import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { ProfileResponse } from "@/lib/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface User {
  name: string;
  email: string;
  photo: string;
  role: string;
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }>;
}

interface ProfileInfoFormProps {
  user: User;
}

export const ProfileInfoForm = ({ user }: ProfileInfoFormProps) => {
  const { t } = useTranslation(["account", "auth", "common"]);
  const queryClient = useQueryClient();

  const updateProfileSchema = z.object({
    name: z
      .string()
      .min(2, t("auth:validation.nameLength"))
      .max(60, t("auth:validation.nameLength")),
    email: z.string().email(t("auth:validation.emailInvalid")),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  });

  const profileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });

  useEffect(() => {
    if (user) {
      const address = user.addresses?.[0] || {};
      profileForm.reset({
        name: user.name,
        email: user.email,
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zip: address.zip || "",
        country: address.country || "",
      });
    }
  }, [user, profileForm]);

  const updateProfileMutation = useMutation({
    mutationFn: (values: z.infer<typeof updateProfileSchema>) => {
      const payload: {
        name: string;
        email: string;
        addresses?: Array<{
          street?: string;
          city?: string;
          state?: string;
          zip?: string;
          country?: string;
        }>;
      } = {
        name: values.name,
        email: values.email,
      };

      const hasAnyAddressField =
        values.street ||
        values.city ||
        values.state ||
        values.zip ||
        values.country;

      if (hasAnyAddressField) {
        const existingAddresses = user?.addresses || [];
        const existingAddress = existingAddresses[0] || {};

        const updatedFirstAddress = {
          ...existingAddress,
          street: values.street || "",
          city: values.city || "",
          state: values.state || "",
          zip: values.zip || "",
          country: values.country || "",
        };

        payload.addresses =
          existingAddresses.length > 0
            ? [updatedFirstAddress, ...existingAddresses.slice(1)]
            : [updatedFirstAddress];
      } else if (user?.addresses && user.addresses.length > 0) {
        payload.addresses = [];
      }

      return apiFetch<ProfileResponse>("/api/v1/users/updateMe", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      toast.success(t("account:profile.successToast"));
      queryClient.setQueryData(["currentUser"], data.data.user);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <Form {...profileForm}>
      <form
        onSubmit={profileForm.handleSubmit((values) =>
          updateProfileMutation.mutate(values)
        )}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-foreground mb-6 text-xl">
              {t("account:profile.personalInfo")}
            </h2>

            <div className="mb-8">
              <ProfilePictureUpload
                userName={user.name}
                currentPhoto={
                  user.photo === "default.jpg"
                    ? undefined
                    : user.photo.startsWith("http")
                      ? user.photo
                      : `/public/img/users/${user.photo}`
                }
                onUploadSuccess={(newPhoto) => {
                  queryClient.setQueryData(["currentUser"], {
                    ...user,
                    photo: newPhoto,
                  });
                }}
              />
            </div>

            <FormField
              control={profileForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:signup.nameLabel")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:login.emailLabel")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {user.role === "user" && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-foreground mb-6 text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />{" "}
                {t("account:profile.shippingDetails")}
              </h2>

              <FormField
                control={profileForm.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("checkout:shipping.address")}</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("checkout:shipping.city")}</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("checkout:shipping.state")}</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("checkout:shipping.zip")}</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("checkout:shipping.country")}</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <Button type="submit" disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending
              ? t("common:buttons.loading")
              : t("common:buttons.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
