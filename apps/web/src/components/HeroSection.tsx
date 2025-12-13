import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Sparkles, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroSectionProps {
  onSubmit: (url: string) => void;
}

export const HeroSection = ({ onSubmit }: HeroSectionProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      onSubmit(formattedUrl);
    }
  };

  const features = [
    { icon: Globe, text: "Browse any website" },
    { icon: MessageSquare, text: "Natural language" },
    { icon: Zap, text: "Instant responses" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto relative z-10"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">AI-Powered Web Interaction</span>
        </motion.div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="text-foreground">Talk to </span>
          <span className="gradient-text">any website</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
          Enter a URL and interact with any website using natural language. 
          Extract data, navigate pages, and get answers instantly.
        </p>

        {/* URL Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-12"
        >
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter any website URL..."
              className="pl-12 h-14 text-base bg-secondary/50 border-border/50 focus:border-primary glow-effect"
            />
          </div>
          <Button type="submit" variant="hero" size="xl" className="group">
            Start Chat
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.form>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-10 w-20 h-20 glass-card rounded-2xl opacity-30 hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-20 right-20 w-16 h-16 glass-card rounded-xl opacity-20 hidden lg:block"
      />
    </div>
  );
};
