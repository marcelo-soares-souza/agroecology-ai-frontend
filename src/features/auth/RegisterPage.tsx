import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/services/api";

export function RegisterPage() {
  const { register } = useAuth();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "pt-BR";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [challenge, setChallenge] = useState<{
    challenge_id: string;
    question: string;
  } | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .getHumanChallenge(locale)
      .then(setChallenge)
      .catch(() => setError("Failed to load challenge"));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        challenge_id: challenge.challenge_id,
        challenge_answer: challengeAnswer,
        locale,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Check your email
          </h1>
          <p className="text-text-secondary">
            A confirmation link has been sent to your email. Please check your
            inbox.
          </p>
          <Link
            to="/login"
            className="text-primary hover:underline mt-4 inline-block"
          >
            Go to Login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-2xl font-bold text-text-primary mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {challenge && (
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                {challenge.question}
              </label>
              <Input
                value={challengeAnswer}
                onChange={(e) => setChallengeAnswer(e.target.value)}
                required
              />
            </div>
          )}
          {error && <p className="text-error text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !challenge}
            className="w-full"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
        <p className="text-sm text-text-secondary mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
