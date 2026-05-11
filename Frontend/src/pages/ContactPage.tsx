import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock3,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  CheckCircle2,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { submitContactForm, ContactFormPayload } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSocialLinks } from "@/hooks/useSocialLinks";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const ContactPage = () => {
  usePageTitle("Contact Us");
  const { user } = useAuth();
  
  // Fetch site settings for contact info
  const { data: siteSettings, isLoading: loadingSettings } = useSiteSettings();
  const { data: socialLinks } = useSocialLinks();

  const contactEmail = siteSettings?.contactEmail || "abuabdurehman0308@gmail.com";
  const contactPhone = siteSettings?.contactPhone || "+251993877913";
  const address = siteSettings?.address || "Addis Ababa, Ethiopia";
  const workingHours = siteSettings?.workingHours || [
    { day: "Mon - Fri", hours: "9:00 AM - 8:00 PM", isOpen: true },
    { day: "Saturday", hours: "10:00 AM - 6:00 PM", isOpen: true },
    { day: "Sunday", hours: "11:00 AM - 4:00 PM", isOpen: true },
  ];
  const mapCoordinates = siteSettings?.mapCoordinates || { lat: 9.7719357, lng: 38.7388875 };

  // Get icon component dynamically
  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || Mail;
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  const mutation = useMutation({
    mutationFn: (payload: ContactFormPayload) => submitContactForm(payload),
    onSuccess: () => {
      toast.success("Message sent!", {
        description: "We'll get back to you within 24 hours.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
      reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: "",
        subject: "",
        message: "",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to send message", {
        description: error.message || "Please try again later.",
      });
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="mb-2 text-3xl font-display font-bold text-foreground">
          Contact Us
        </h1>
        <p className="text-muted-foreground">
          Have a question, order issue, or partnership inquiry? Our team is
          ready to help.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-foreground">Full Name</Label>
              <Input
                {...register("name")}
                placeholder="John Doe"
                className="mt-1 bg-background"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label className="text-foreground">Email</Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="john@example.com"
                className="mt-1 bg-background"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-foreground">
                Phone{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                {...register("phone")}
                placeholder="+1 234 567 890"
                className="mt-1 bg-background"
              />
            </div>
            <div>
              <Label className="text-foreground">Subject</Label>
              <Input
                {...register("subject")}
                placeholder="Order inquiry, product question..."
                className="mt-1 bg-background"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label className="text-foreground">Message</Label>
            <Textarea
              {...register("message")}
              rows={7}
              placeholder="Write your message here..."
              className="mt-1 bg-background"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
          >
            <Send className="h-4 w-4 mr-2" />
            {mutation.isPending ? "Sending..." : "Send Message"}
          </Button>
        </form>

        <div className="space-y-5">
          {[
            { icon: "Mail", title: "Email", info: contactEmail },
            { icon: "Phone", title: "Phone", info: contactPhone },
            { icon: "MapPin", title: "Address", info: address },
          ].map(({ icon, title, info }) => {
            const Icon = getIconComponent(icon);
            return (
              <div
                key={title}
                className="flex gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{info}</p>
                </div>
              </div>
            );
          })}

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Clock3 className="h-4 w-4 text-primary" /> Working Hours
            </h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              {workingHours.filter((wh: any) => wh.isOpen).map((wh: any, idx: number) => (
                <p key={idx}>{wh.day}: {wh.hours}</p>
              ))}
            </div>
          </div>

          {socialLinks && socialLinks.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">Follow Us</h3>
              <div className="flex items-center gap-2">
                {socialLinks.map((link) => {
                  const Icon = getIconComponent(link.icon);
                  return (
                    <a
                      key={link._id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <iframe
          title="Our location"
          src={`https://www.google.com/maps?q=${mapCoordinates.lat},${mapCoordinates.lng}&output=embed`}
          width="100%"
          height="320"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default ContactPage;
