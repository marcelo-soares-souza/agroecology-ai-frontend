import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ResendConfirmationPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}/api/v1/auth/confirm-email/resend?email=${encodeURIComponent(email)}`,
        { method: "POST" },
      );
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error((data as { detail?: string }).detail || "Failed");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Email Sent!
          </h1>
          <p className="text-text-secondary">
            Check your inbox for the confirmation link.
          </p>
          <Link
            to="/login"
            className="text-primary hover:underline mt-4 inline-block"
          >
            Back to Login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          Resend Confirmation
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Resend Confirmation"}
          </Button>
        </form>
        <p className="text-sm text-text-secondary mt-4 text-center">
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
