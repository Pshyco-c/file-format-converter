import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Lock } from "lucide-react";

interface FormatSelectorProps {
  fromFormat: string;
  toFormat: string;
  onFromFormatChange: (format: string) => void;
  onToFormatChange: (format: string) => void;
  isFromLocked?: boolean;
}

const formats = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
  { value: "mp4", label: "MP4" },
  { value: "mp3", label: "MP3" },
  { value: "xlsx", label: "XLSX" },
  { value: "csv", label: "CSV" },
  { value: "txt", label: "TXT" },
];

// Define compatible formats for each file type
const compatibleFormats: Record<string, string[]> = {
  pdf: ["docx", "txt", "xlsx"],
  docx: ["pdf", "txt", "xlsx"],
  jpg: ["png", "svg", "pdf"],
  png: ["jpg", "svg", "pdf"],
  svg: ["png", "jpg", "pdf"],
  mp4: ["mp3", "avi"],
  mp3: ["wav", "aac", "ogg"],
  xlsx: ["csv", "pdf", "docx"],
  csv: ["xlsx", "txt", "pdf"],
  txt: ["pdf", "docx", "csv"],
};

export const FormatSelector = ({
  fromFormat,
  toFormat,
  onFromFormatChange,
  onToFormatChange,
  isFromLocked = false,
}: FormatSelectorProps) => {
  // Get available formats for the 'to' field based on 'from' format
  const availableToFormats = fromFormat 
    ? formats.filter(f => 
        compatibleFormats[fromFormat]?.includes(f.value) || false
      )
    : formats;

  // If 'to' format is not in available formats, reset it
  useEffect(() => {
    if (toFormat && fromFormat && !compatibleFormats[fromFormat]?.includes(toFormat)) {
      onToFormatChange("");
    }
  }, [fromFormat, toFormat, onToFormatChange]);

  const fromFormatLabel = formats.find(f => f.value === fromFormat)?.label || "Select format";

  return (
    <div className="flex items-center gap-4 w-full max-w-2xl mx-auto">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">From</label>
        {isFromLocked ? (
          <div className="h-14 bg-card shadow-[var(--shadow-card)] rounded-md px-4 flex items-center justify-between border border-border">
            <span className="text-lg font-medium">{fromFormatLabel}</span>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        ) : (
          <Select value={fromFormat} onValueChange={onFromFormatChange}>
            <SelectTrigger className="h-14 text-lg bg-card shadow-[var(--shadow-card)]">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="pt-6">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-accent-foreground" />
        </div>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">To</label>
        <Select value={toFormat} onValueChange={onToFormatChange}>
          <SelectTrigger 
            className="h-14 text-lg bg-card shadow-[var(--shadow-card)]"
            disabled={!fromFormat}
          >
            <SelectValue placeholder={fromFormat ? "Select target format" : "Select source format first"} />
          </SelectTrigger>
          <SelectContent>
            {availableToFormats.map((format) => (
              <SelectItem key={format.value} value={format.value}>
                {format.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
