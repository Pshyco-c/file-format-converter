import { useState, useEffect } from "react";
import { ChevronDown, FileText, Image, Music, Video, Menu, X, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onConversionSelect?: (fromFormat: string, toFormat: string) => void;
}

const conversionCategories = {
  documents: [
    { from: "pdf", to: "docx", label: "PDF to Word" },
    { from: "pdf", to: "xlsx", label: "PDF to Excel" },
    { from: "docx", to: "pdf", label: "Word to PDF" },
    { from: "xlsx", to: "pdf", label: "Excel to PDF" },
    { from: "txt", to: "pdf", label: "Text to PDF" },
    { from: "docx", to: "txt", label: "Word to Text" },
  ],
  images: [
    { from: "jpg", to: "png", label: "JPG to PNG" },
    { from: "png", to: "jpg", label: "PNG to JPG" },
    { from: "png", to: "svg", label: "PNG to SVG" },
    { from: "jpg", to: "pdf", label: "JPG to PDF" },
    { from: "png", to: "pdf", label: "PNG to PDF" },
  ],
  videos: [
    { from: "mp4", to: "avi", label: "MP4 to AVI" },
    { from: "mov", to: "mp4", label: "MOV to MP4" },
  ],
  audio: [
    { from: "mp3", to: "wav", label: "MP3 to WAV" },
    { from: "mp3", to: "aac", label: "MP3 to AAC" },
    { from: "wav", to: "mp3", label: "WAV to MP3" },
  ],
};

export const Navbar = ({ onConversionSelect }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const handleConversionClick = (from: string, to: string) => {
    onConversionSelect?.(from, to);
    setIsMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Update HTML element class
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const darkMode = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <span className="text-lg font-bold text-primary">C</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Converty
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Documents Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1 text-sm lg:text-base">
                  <FileText className="w-4 h-4" />
                  <span className="hidden lg:inline">Documents</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Document Conversions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {conversionCategories.documents.map((item, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() =>
                      handleConversionClick(item.from, item.to)
                    }
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Images Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1 text-sm lg:text-base">
                  <Image className="w-4 h-4" />
                  <span className="hidden lg:inline">Images</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Image Conversions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {conversionCategories.images.map((item, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() =>
                      handleConversionClick(item.from, item.to)
                    }
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Videos Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1 text-sm lg:text-base">
                  <Video className="w-4 h-4" />
                  <span className="hidden lg:inline">Videos</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Video Conversions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {conversionCategories.videos.map((item, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() =>
                      handleConversionClick(item.from, item.to)
                    }
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Audio Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1 text-sm lg:text-base">
                  <Music className="w-4 h-4" />
                  <span className="hidden lg:inline">Audio</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Audio Conversions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {conversionCategories.audio.map((item, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() =>
                      handleConversionClick(item.from, item.to)
                    }
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            {/* Mobile Documents */}
            <div className="space-y-2">
              <div className="px-2 py-2 font-semibold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents
              </div>
              {conversionCategories.documents.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleConversionClick(item.from, item.to)
                  }
                  className="w-full text-left px-4 py-2 hover:bg-accent rounded-md text-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Images */}
            <div className="space-y-2">
              <div className="px-2 py-2 font-semibold text-sm flex items-center gap-2">
                <Image className="w-4 h-4" />
                Images
              </div>
              {conversionCategories.images.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleConversionClick(item.from, item.to)
                  }
                  className="w-full text-left px-4 py-2 hover:bg-accent rounded-md text-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Videos */}
            <div className="space-y-2">
              <div className="px-2 py-2 font-semibold text-sm flex items-center gap-2">
                <Video className="w-4 h-4" />
                Videos
              </div>
              {conversionCategories.videos.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleConversionClick(item.from, item.to)
                  }
                  className="w-full text-left px-4 py-2 hover:bg-accent rounded-md text-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Audio */}
            <div className="space-y-2">
              <div className="px-2 py-2 font-semibold text-sm flex items-center gap-2">
                <Music className="w-4 h-4" />
                Audio
              </div>
              {conversionCategories.audio.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleConversionClick(item.from, item.to)
                  }
                  className="w-full text-left px-4 py-2 hover:bg-accent rounded-md text-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
