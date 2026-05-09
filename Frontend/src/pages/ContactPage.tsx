import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
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
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const ContactPage = () => {
  usePageTitle("Contact Us");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
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
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-foreground">Full Name</Label>
              <Input required className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-foreground">Email</Label>
              <Input type="email" required className="mt-1 bg-background" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-foreground">Phone</Label>
              <Input className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-foreground">Subject</Label>
              <Input required className="mt-1 bg-background" />
            </div>
          </div>
          <div>
            <Label className="text-foreground">Message</Label>
            <Textarea required rows={7} className="mt-1 bg-background" />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
          >
            <Send className="h-4 w-4 mr-2" />{" "}
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>

        <div className="space-y-5">
          {[
            { icon: Mail, title: "Email", info: "abuabdurehman0308@gmail.com" },
            { icon: Phone, title: "Phone", info: "+251993877913" },
            {
              icon: MapPin,
              title: "Address",
              info: "Addis Ababa, Ethiopia",
            },
          ].map(({ icon: Icon, title, info }) => (
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
          ))}

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Clock3 className="h-4 w-4 text-primary" /> Working Hours
            </h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>Mon - Fri: 9:00 AM - 8:00 PM</p>
              <p>Saturday: 10:00 AM - 6:00 PM</p>
              <p>Sunday: 11:00 AM - 4:00 PM</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 font-semibold text-foreground">Follow Us</h3>
            <div className="flex items-center gap-2">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label="Social link"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <iframe
          title="Our location"
          src="https://www.google.com/maps?q=9.7719357,38.7388875&output=embed"
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
