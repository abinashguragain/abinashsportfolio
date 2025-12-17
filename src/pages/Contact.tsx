import { useState } from "react";
import { Send, Mail, MapPin, Phone } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@yourname.com",
    href: "mailto:hello@yourname.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Remote / Worldwide",
    href: null,
  },
  {
    icon: Phone,
    label: "Response Time",
    value: "Within 24 hours",
    href: null,
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Google Sheets integration - Replace YOUR_GOOGLE_SCRIPT_URL with your deployed Google Apps Script URL
    const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_SCRIPT_URL";
    
    try {
      // For now, we'll simulate the submission
      // To connect to Google Sheets, you'll need to:
      // 1. Create a Google Sheet
      // 2. Go to Extensions > Apps Script
      // 3. Add the script (provided in comments below)
      // 4. Deploy as Web App and get the URL
      
      if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_URL") {
        // Demo mode - simulate successful submission
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        toast({
          title: "Message sent!",
          description: "Thanks for reaching out. I'll get back to you soon!",
        });
        
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        // Real submission to Google Sheets
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            timestamp: new Date().toISOString(),
          }),
        });

        toast({
          title: "Message sent!",
          description: "Thanks for reaching out. I'll get back to you soon!",
        });

        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or email me directly.",
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

      {/* Contact Form & Info */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl text-foreground mb-4">
                  Get in Touch
                </h2>
                <p className="text-muted-foreground">
                  Whether you're looking for a content writer, want to collaborate on a project, or just want to say hi, I'm always happy to hear from you.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <item.icon size={20} className="text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-medium text-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Note about Google Sheets */}
              <div className="p-4 bg-accent/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> This form is ready to connect to Google Sheets. See the code comments for setup instructions.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={isSubmitting}
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
          </div>
        </div>
      </section>

      {/* 
        Google Apps Script for Google Sheets Integration:
        
        1. Create a new Google Sheet with columns: Timestamp, Name, Email, Subject, Message
        2. Go to Extensions > Apps Script
        3. Paste this code:

        function doPost(e) {
          const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
          const data = JSON.parse(e.postData.contents);
          
          sheet.appendRow([
            new Date().toISOString(),
            data.name,
            data.email,
            data.subject,
            data.message
          ]);
          
          return ContentService.createTextOutput(JSON.stringify({success: true}))
            .setMimeType(ContentService.MimeType.JSON);
        }

        4. Click Deploy > New Deployment
        5. Select "Web app"
        6. Set "Execute as" to "Me"
        7. Set "Who has access" to "Anyone"
        8. Click Deploy and copy the URL
        9. Replace YOUR_GOOGLE_SCRIPT_URL in this file with your URL
      */}
    </Layout>
  );
};

export default Contact;
