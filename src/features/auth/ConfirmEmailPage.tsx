import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { confirmEmail } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No confirmation token provided.");
      return;
    }
    confirmEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Confirmation failed");
      });
  }, [token, confirmEmail]);

  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        {status === "loading" && (
          <p className="text-text-secondary">Confirming your email...</p>
        )}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Email Confirmed!
            </h1>
            <p className="text-text-secondary mb-4">
              Your account is now active.
            </p>
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Confirmation Failed
            </h1>
            <p className="text-error">{error}</p>
            <Link
              to="/login"
              className="text-primary hover:underline mt-4 inline-block"
            >
              Back to Login
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
