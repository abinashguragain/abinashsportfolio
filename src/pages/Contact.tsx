import { useState, useEffect, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Extend Window interface for Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Fetch site key from database
  useEffect(() => {
    const fetchSiteKey = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "turnstile_site_key")
        .single();
      
      if (data?.value) {
        setSiteKey(data.value);
      }
    };
    fetchSiteKey();
  }, []);

  // Load Turnstile script
  useEffect(() => {
    if (!siteKey) return;

    const existingScript = document.querySelector('script[src*="turnstile"]');
    if (existingScript) {
      setTurnstileLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setTurnstileLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey]);

  // Render Turnstile widget
  useEffect(() => {
    if (!turnstileLoaded || !siteKey || !turnstileRef.current || !window.turnstile) return;

    // Remove existing widget if any
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
    }

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        setTurnstileToken(token);
      },
      "expired-callback": () => {
        setTurnstileToken(null);
      },
      "error-callback": () => {
        setTurnstileToken(null);
      },
      theme: "auto",
    });
  }, [turnstileLoaded, siteKey]);

  const resetTurnstile = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken(null);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Log to Google Sheets (fire and forget, errors don't block submission)
  const logToGoogleSheets = async (data: typeof formData) => {
    try {
      await supabase.functions.invoke("log-to-sheets", {
        body: {
          formData: data,
          sourceUrl: window.location.href,
        },
      });
    } catch (error) {
      // Silently fail - Google Sheets errors should not block form submission
      console.warn("Google Sheets logging failed (non-blocking):", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verify CAPTCHA if enabled
      if (siteKey) {
        if (!turnstileToken) {
          toast({
            title: "Please complete the CAPTCHA",
            description: "Verify you're human before submitting.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        // Verify token server-side
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-turnstile", {
          body: { token: turnstileToken },
        });

        if (verifyError || !verifyData?.success) {
          toast({
            title: "CAPTCHA verification failed",
            description: "Please try again.",
            variant: "destructive",
          });
          resetTurnstile();
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from("contact_submissions").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) throw error;

      // Log to Google Sheets in background (non-blocking)
      logToGoogleSheets(formData);

      toast({
        title: "Message sent!",
        description: "Thanks for reaching out. I'll get back to you soon!",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
      resetTurnstile();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="section-padding bg-gradient-hero">
        <div className="container-narrow text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            LET'S <span className="text-gradient">TALK</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Have a project in mind or just want to chat? Drop me a message and I'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell me about your project or just say hi..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Turnstile CAPTCHA */}
                {siteKey && (
                  <div className="flex justify-center">
                    <div ref={turnstileRef} />
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={isSubmitting || (siteKey && !turnstileToken)}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send size={18} />
                    </>
                  )}
                </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
