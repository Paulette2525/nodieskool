import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, MessageSquare, BookOpen, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const { query, setQuery, results, isLoading, clearSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResultClick = (result: typeof results[0]) => {
    setIsOpen(false);
    clearSearch();

    switch (result.type) {
      case "post":
        navigate("/community");
        break;
      case "course":
        navigate(`/classroom/${result.id}`);
        break;
      case "member":
        // For now, just go to community
        navigate("/community");
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "post":
        return <MessageSquare className="h-4 w-4" />;
      case "course":
        return <BookOpen className="h-4 w-4" />;
      case "member":
        return <User className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "post":
        return "Publication";
      case "course":
        return "Formation";
      case "member":
        return "Membre";
      default:
        return type;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Rechercher... (⌘K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              clearSearch();
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50">
          <ScrollArea className="max-h-[300px]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Recherche en cours...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Aucun résultat pour "{query}"
              </div>
            ) : (
              <div className="p-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-md text-left",
                      "hover:bg-accent focus:bg-accent focus:outline-none"
                    )}
                    onClick={() => handleResultClick(result)}
                  >
                    {result.type === "member" && result.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={result.avatar} />
                        <AvatarFallback>
                          {result.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {getResultIcon(result.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {getTypeLabel(result.type)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
