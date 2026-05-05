import React, { useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Sun, Moon } from "lucide-react";

const AdminLoginPage = () => {
  const { login } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success)
      setError("Invalid credentials. Use admin@voltedge.com / admin123");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-hero">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="absolute right-5 top-5 border-white/30 bg-background/80 text-foreground hover:bg-background"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      <div className="bg-card rounded-lg border border-border p-8 w-full max-w-md shadow-elevated animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to VoltEdge Dashboard
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </p>
          )}
          <div>
            <Label className="text-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <div>
            <Label className="text-foreground">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
          >
            Sign In
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Demo: admin@voltedge.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
