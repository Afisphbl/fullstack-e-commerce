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
import { usePageTitle } from "@/hooks/usePageTitle";
import { submitContactForm, ContactFormPayload } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/shared/SEOHead";

const ContactPage = () => {
  const { t } = useTranslation("contact");
  const { user } = useAuth();
  const { settings } = useSiteSettings();

  usePageTitle(t("title"));

  // Build validation schema with translated messages
  const contactSchema = z.object({
    name: z.string().min(2, t("validation.nameMin")),
    email: z.string().email(t("validation.emailInvalid")),
    phone: z.string().optional(),
    subject: z.string().min(3, t("validation.subjectMin")),
    message: z.string().min(10, t("validation.messageMin")),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormPayload>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      subject: "",
      message: "",
    },
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
      toast.success(t("messageSent"), {
        description: t("messageSentDesc"),
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
      toast.error(t("messageFailed"), {
        description: error.message || t("messageFailedDesc"),
      });
    },
  });

  const onSubmit = (values: ContactFormPayload) => {
    mutation.mutate(values);
  };

  const contactItems = [
    { icon: Mail, title: t("emailLabel"), info: settings.contactEmail },
    { icon: Phone, title: t("phoneLabel"), info: settings.contactPhone },
    { icon: MapPin, title: t("addressLabel"), info: settings.contactAddress },
  ];

  return (
    <>
      <SEOHead
        title={t("title")}
        description={t("seo.description")}
        keywords={t("seo.keywords")}
        type="website"
      />
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="mb-2 text-3xl font-display font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
            aria-label={t("title")}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-foreground">{t("fullName")}</Label>
                <Input
                  {...register("name")}
                  placeholder={t("placeholders.name")}
                  className="mt-1 bg-background"
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="mt-1 text-xs text-destructive"
                    role="alert"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-foreground">{t("email")}</Label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder={t("placeholders.email")}
                  className="mt-1 bg-background"
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="mt-1 text-xs text-destructive"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-foreground">
                  {t("phone")}{" "}
                  <span className="text-muted-foreground text-xs">
                    {t("phoneOptional")}
                  </span>
                </Label>
                <Input
                  {...register("phone")}
                  placeholder={t("placeholders.phone")}
                  className="mt-1 bg-background"
                />
              </div>
              <div>
                <Label className="text-foreground">{t("subject")}</Label>
                <Input
                  {...register("subject")}
                  placeholder={t("placeholders.subject")}
                  className="mt-1 bg-background"
                  aria-describedby={
                    errors.subject ? "subject-error" : undefined
                  }
                />
                {errors.subject && (
                  <p
                    id="subject-error"
                    className="mt-1 text-xs text-destructive"
                    role="alert"
                  >
                    {errors.subject.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-foreground">{t("message")}</Label>
              <Textarea
                {...register("message")}
                rows={7}
                placeholder={t("placeholders.message")}
                className="mt-1 bg-background"
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && (
                <p
                  id="message-error"
                  className="mt-1 text-xs text-destructive"
                  role="alert"
                >
                  {errors.message.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
            >
              <Send className="h-4 w-4 mr-2" aria-hidden="true" />
              {mutation.isPending ? t("sending") : t("sendMessage")}
            </Button>
          </form>

          <aside className="space-y-5">
            {contactItems.map(({ icon: Icon, title, info }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div
                  className="rounded-lg bg-primary/10 p-3"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{info}</p>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                {t("workingHours")}
              </h3>
              <div className="space-y-1.5 text-sm text-muted-foreground whitespace-pre-line">
                {settings.workingHours}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">
                {t("followUs")}
              </h3>
              <div className="flex items-center gap-2">
                {[
                  {
                    Icon: Facebook,
                    url: settings.social.facebook,
                    label: "Facebook",
                  },
                  {
                    Icon: Instagram,
                    url: settings.social.instagram,
                    label: "Instagram",
                  },
                  {
                    Icon: Linkedin,
                    url: settings.social.linkedin,
                    label: "LinkedIn",
                  },
                  {
                    Icon: Twitter,
                    url: settings.social.twitter,
                    label: "Twitter/X",
                  },
                ].map(({ Icon, url, label }) =>
                  url ? (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Our location on Google Maps"
            src={`https://www.google.com/maps?q=${settings.mapLat},${settings.mapLng}&output=embed`}
            width="100%"
            height="320"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </>
  );
};

export default ContactPage;
