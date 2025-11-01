import { Loader2, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ConversionStatusProps {
  status: "idle" | "converting" | "success" | "error";
  progress: number;
  onDownload?: () => void;
  downloadUrl?: string;
  errorMessage?: string;
}

export const ConversionStatus = ({
  status,
  progress,
  onDownload,
  downloadUrl,
  errorMessage,
}: ConversionStatusProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    if (downloadUrl) {
      navigator.clipboard.writeText(downloadUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (status === "idle") return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-card rounded-xl p-8 shadow-[var(--shadow-card)]">
        {status === "converting" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-lg font-medium">Converting your file...</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-lg font-medium">Conversion successful!</span>
            </div>
            <div className="space-y-3">
              <Button variant="hero" size="lg" onClick={onDownload} className="w-full">
                Download Converted File
              </Button>
              {downloadUrl && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleCopyLink}
                  className="w-full gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Download Link
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="w-6 h-6" />
              <span className="text-lg font-medium">Conversion failed</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {errorMessage || "An error occurred during conversion. Please try again."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
