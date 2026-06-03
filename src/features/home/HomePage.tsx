import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ChatPage } from "@/features/home/ChatPage";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FileText, MessageCircle, Lock, Database, Cpu } from "lucide-react";

export function HomePage() {
  const { isAuthenticated, hasRestoredSession } = useAuth();

  if (!hasRestoredSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <ChatPage />;
  }

  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4">
        <img
          src="/logo.png"
          alt="Agroecology Map AI"
          className="h-28 w-28 mb-8"
        />
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-text-primary">
            Agroecology Map AI
          </h1>
          <span className="px-3 py-1 text-sm font-bold bg-amber-100 text-amber-700 rounded-full border border-amber-300">
            BETA
          </span>
        </div>
        <p className="text-lg text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6 max-w-xl">
          This tool is under active development and currently in a testing
          period. Features may change and some functionality is restricted.
        </p>
        <p className="text-xl text-text-secondary max-w-2xl mb-4">
          Your AI-powered research assistant for agroecological knowledge.
          Upload documents, ask questions, and get answers grounded in real
          research.
        </p>
        <p className="text-sm text-text-secondary/70 mb-8">
          Chat is open to all registered users. Document upload and ingestion
          are currently restricted to administrators while the platform is in
          active development.
        </p>
        <div className="flex gap-4">
          <Link to="/register">
            <button className="px-8 py-3 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-dark transition-colors">
              Get Started
            </button>
          </Link>
          <Link to="/login">
            <button className="px-8 py-3 border-2 border-primary text-primary rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid gap-6 md:grid-cols-3 px-4 max-w-5xl mx-auto">
        <Card>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary">
                Upload Documents
              </h3>
              <Badge variant="warning" className="text-[10px]">
                Admin
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              Add your PDFs, research papers, field manuals, and Markdown files.
              Currently restricted to administrators while in development.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary">Ask Questions</h3>
              <Badge variant="success" className="text-[10px]">
                All Users
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              Available to everyone! Ask questions in your own language and get
              answers grounded in existing documents with full source citations.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary">
                Ingest Knowledge
              </h3>
              <Badge variant="warning" className="text-[10px]">
                Admin
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              Index documents into the hybrid search engine. Currently
              restricted to administrators while in development.
            </p>
          </div>
        </Card>
      </div>

      {/* Tech */}
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Open & Local-First
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-text-primary mb-1">
                  Your Data, Your Control
                </h3>
                <p className="text-sm text-text-secondary">
                  Everything runs on your infrastructure. No data leaves your
                  servers. Use cloud APIs or run fully local with Ollama.
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-3">
              <Cpu className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-text-primary mb-1">
                  Pluggable AI Backends
                </h3>
                <p className="text-sm text-text-secondary">
                  DeepSeek, Ollama, or any OpenAI-compatible API. Swap models
                  without changing your workflow.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center px-4">
        <p className="text-sm text-text-secondary">
          Free Software (GPLv3) — Maintained by{" "}
          <a
            href="https://agroecologymap.org"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Agroecology Map
          </a>
        </p>
      </div>
    </div>
  );
}
