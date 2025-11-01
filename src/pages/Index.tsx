import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { FormatSelector } from "@/components/FormatSelector";
import { ConversionStatus } from "@/components/ConversionStatus";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = 'http://localhost:5000/api';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fromFormat, setFromFormat] = useState("");
  const [toFormat, setToFormat] = useState("");
  const [conversionStatus, setConversionStatus] = useState<"idle" | "converting" | "success" | "error">("idle");
  const [conversionProgress, setConversionProgress] = useState(0);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string>("");
  const [isConversionPreSelected, setIsConversionPreSelected] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const extension = file.name.split('.').pop()?.toLowerCase() || "";
    
    // If user pre-selected conversion from navbar and file matches the source format, keep the target format
    if (isConversionPreSelected && fromFormat === extension) {
      // Keep the pre-selected toFormat
      toast.success("File selected successfully!");
      return;
    }
    
    // Otherwise, auto-detect and reset
    setFromFormat(extension);
    setToFormat("");
    setIsConversionPreSelected(false);
    setConversionStatus("idle");
    setConversionProgress(0);
    setConvertedFileUrl("");
    toast.success("File selected successfully!");
  };

  const handleFileClear = () => {
    setSelectedFile(null);
    setFromFormat("");
    setToFormat("");
    setIsConversionPreSelected(false);
    setConversionStatus("idle");
    setConversionProgress(0);
    setConvertedFileUrl("");
    toast.info("File cleared");
  };

  const handleConversionSelect = (from: string, to: string) => {
    setFromFormat(from);
    setToFormat(to);
    setIsConversionPreSelected(true);
    toast.success(`Conversion set: ${from.toUpperCase()} → ${to.toUpperCase()}`);
  };

  const handleConvert = async () => {
    if (!selectedFile || !fromFormat || !toFormat) {
      toast.error("Please select a file and both formats");
      return;
    }

    setConversionStatus("converting");
    setConversionProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fromFormat', fromFormat);
      formData.append('toFormat', toFormat);

      // Progress simulation
      const progressInterval = setInterval(() => {
        setConversionProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      const response = await fetch(`${API_BASE_URL}/convert`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const data = await response.json();
      
      setConversionProgress(100);
      setConversionStatus("success");
      setConvertedFileUrl(data.fileUrl);
      toast.success("File converted successfully!");

    } catch (error: any) {
      setConversionStatus("error");
      toast.error(error.message || "Conversion failed. Please try again.");
      console.error('Conversion error:', error);
    }
  };

  const handleDownload = () => {
    if (convertedFileUrl) {
      window.open(convertedFileUrl, '_blank');
      toast.success("Download started!");
    } else {
      toast.error("No file available for download");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onConversionSelect={handleConversionSelect} />
      
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-glow/10 to-transparent" />
        <div className="hidden md:block absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-glow" />
        <div className="hidden md:block absolute bottom-20 left-20 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
        
        <div className="relative container mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">Fast & Secure Conversion</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Convert Any File Format
              <br />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Instantly & Free
              </span>
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional file conversion tool supporting 200+ formats. Fast, secure, and easy to use.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-3xl mx-auto px-2 md:px-4">
            <FileUploader onFileSelect={handleFileSelect} onFileClear={handleFileClear} />

            {selectedFile && (
              <div className="mt-8 space-y-6">
                <FormatSelector
                  fromFormat={fromFormat}
                  toFormat={toFormat}
                  onFromFormatChange={setFromFormat}
                  onToFormatChange={setToFormat}
                  isFromLocked={true}
                />

                <div className="flex justify-center">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleConvert}
                    disabled={!fromFormat || !toFormat || conversionStatus === "converting"}
                    className="min-w-[200px]"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Convert Now
                  </Button>
                </div>
              </div>
            )}

            <ConversionStatus
              status={conversionStatus}
              progress={conversionProgress}
              onDownload={handleDownload}
              downloadUrl={convertedFileUrl}
            />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "200+ Formats",
                description: "Support for all major file formats including documents, images, videos, and audio files.",
              },
              {
                title: "Fast Processing",
                description: "Lightning-fast conversion powered by industry-leading technology.",
              },
              {
                title: "Secure & Private",
                description: "Your files are encrypted and automatically deleted after conversion.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 md:p-8 rounded-xl bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-premium)] transition-all duration-300"
              >
                <h3 className="text-lg md:text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Formats Section */}
      <section className="py-16 md:py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12">Supported Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
            <div className="p-4 md:p-6 rounded-lg bg-card shadow-sm">
              <h3 className="font-semibold text-base md:text-lg mb-4">📄 Documents</h3>
              <p className="text-muted-foreground text-xs md:text-sm">PDF, DOCX, DOC, TXT, RTF, ODT, HTML, XLS, XLSX, PPT, PPTX, and more</p>
            </div>
            <div className="p-4 md:p-6 rounded-lg bg-card shadow-sm">
              <h3 className="font-semibold text-base md:text-lg mb-4">🖼️ Images</h3>
              <p className="text-muted-foreground text-xs md:text-sm">JPG, PNG, GIF, BMP, TIFF, WEBP, SVG, ICO, HEIC, and more</p>
            </div>
            <div className="p-4 md:p-6 rounded-lg bg-card shadow-sm">
              <h3 className="font-semibold text-base md:text-lg mb-4">🎬 Videos</h3>
              <p className="text-muted-foreground text-xs md:text-sm">MP4, AVI, MOV, WMV, FLV, MKV, WebM, 3GP, and more</p>
            </div>
            <div className="p-4 md:p-6 rounded-lg bg-card shadow-sm">
              <h3 className="font-semibold text-base md:text-lg mb-4">🎵 Audio</h3>
              <p className="text-muted-foreground text-xs md:text-sm">MP3, WAV, OGG, AAC, FLAC, M4A, WMA, AIFF, and more</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground text-xs md:text-sm">
          <p>© 2025 File Converter Pro. Powered by ConvertAPI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
