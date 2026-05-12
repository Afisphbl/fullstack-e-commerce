import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, MapPin, Camera } from "lucide-react";
import { ProfilePictureUpload } from "./ProfilePictureUpload";

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

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be at most 60 characters"),
  email: z.string().email("Please enter a valid email address"),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

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
  const queryClient = useQueryClient();

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

      // Handle address updates: send addresses if any field is filled, or clear if user had addresses but all fields are now empty
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
        // User had addresses but all fields are now empty - clear addresses
        payload.addresses = [];
      }

      return apiFetch<ProfileResponse>("/api/v1/users/updateMe", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
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
          updateProfileMutation.mutate(values),
        )}
        className='space-y-8'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column: Personal Information */}
          <div className='space-y-4'>
            <h2 className='font-display font-semibold text-foreground mb-6 text-xl'>
              Personal Information
            </h2>

            <div className='mb-8'>
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
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column: Shipping Details (Users Only) */}
          {user.role === "user" && (
            <div className='space-y-4'>
              <h2 className='font-display font-semibold text-foreground mb-6 text-xl flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-primary' /> Shipping Details
              </h2>

              <FormField
                control={profileForm.control}
                name='street'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder='123 Main St' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={profileForm.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder='New York' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder='NY' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={profileForm.control}
                  name='zip'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder='10001' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder='United States' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className='flex justify-end border-t border-border pt-6'>
          <Button type='submit' disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
