import { Clock, Download, FileType } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HistoryItem {
  id: string;
  fileName: string;
  fromFormat: string;
  toFormat: string;
  timestamp: Date;
  status: "success" | "failed";
}

interface ConversionHistoryProps {
  history: HistoryItem[];
  onDownload?: (id: string) => void;
}

export const ConversionHistory = ({ history, onDownload }: ConversionHistoryProps) => {
  if (history.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6">Recent Conversions</h2>
        <Card className="p-12 text-center bg-card shadow-[var(--shadow-card)]">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No conversion history yet</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-6">Recent Conversions</h2>
      <div className="space-y-4">
        {history.map((item) => (
          <Card
            key={item.id}
            className="p-6 hover:shadow-[var(--shadow-premium)] transition-all duration-300 bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                  <FileType className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.fileName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="uppercase">{item.fromFormat}</span>
                    <span>→</span>
                    <span className="uppercase">{item.toFormat}</span>
                    <span>•</span>
                    <span>{item.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {item.status === "success" && onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(item.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              {item.status === "failed" && (
                <span className="text-sm text-destructive">Failed</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
