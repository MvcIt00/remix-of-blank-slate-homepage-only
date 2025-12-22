import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface BaseSelectorProps<T> {
    onSearch: (term: string) => Promise<T[] | null>;
    onSelect: (item: T) => void;
    renderItem: (item: T) => React.ReactNode;
    placeholder?: string;
    defaultValue?: string;
    loadById?: (id: string) => Promise<T | null>;
    getDisplayValue: (item: T) => string;
    getId: (item: T) => string;
    className?: string;
    inputClassName?: string;
    minChars?: number;
    debounceMs?: number;
}

export function BaseSelector<T>({
    onSearch,
    onSelect,
    renderItem,
    placeholder = "Cerca...",
    defaultValue,
    loadById,
    getDisplayValue,
    getId,
    className,
    inputClassName,
    minChars = 1,
    debounceMs = 300,
}: BaseSelectorProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Load initial value
    useEffect(() => {
        if (defaultValue && loadById) {
            const init = async () => {
                const item = await loadById(defaultValue);
                if (item) {
                    setSelectedItem(item);
                    setSearchTerm(getDisplayValue(item));
                }
            };
            init();
        }
    }, [defaultValue, loadById, getDisplayValue]);

    // Debounced search
    useEffect(() => {
        const term = searchTerm.trim();

        if (selectedItem && term === getDisplayValue(selectedItem)) {
            return;
        }

        if (term.length < minChars) {
            setResults([]);
            setOpen(false);
            return;
        }

        const performSearch = async () => {
            setLoading(true);
            try {
                const data = await onSearch(term);
                setResults(data || []);
                setOpen(true);
            } catch (error) {
                console.error("BaseSelector search error:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(performSearch, debounceMs);
        return () => clearTimeout(debounce);
    }, [searchTerm, minChars, debounceMs, onSearch, selectedItem, getDisplayValue]);

    const handleSelectItem = (item: T) => {
        setSelectedItem(item);
        setSearchTerm(getDisplayValue(item));
        setResults([]);
        setOpen(false);
        onSelect(item);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className={cn("relative w-full", className)}>
                    <div className="relative">
                        {loading ? (
                            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                        ) : (
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        )}
                        <Input
                            ref={inputRef}
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (selectedItem) setSelectedItem(null);
                                if (!open && e.target.value.length >= minChars) {
                                    setOpen(true);
                                }
                            }}
                            onFocus={() => {
                                if (results.length > 0 || searchTerm.length >= minChars) {
                                    setOpen(true);
                                }
                            }}
                            className={cn("pl-10 h-11 transition-all focus:ring-2", inputClassName)}
                        />
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 z-[200] w-[--radix-popover-trigger-width]" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                <Command shouldFilter={false}>
                    <CommandList>
                        {results.length > 0 ? (
                            <CommandGroup>
                                {results.map((item, index) => (
                                    <CommandItem
                                        key={`${getId(item)}-${index}`} // Extra safety for uniqueness
                                        value={getId(item)}
                                        onSelect={() => handleSelectItem(item)}
                                        className="px-4 py-3 cursor-pointer transition-colors border-b last:border-0 border-border/50 data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-zinc-800 data-[selected=true]:text-foreground"
                                    >
                                        {renderItem(item)}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ) : !loading && searchTerm.length >= minChars && (
                            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                Nessun risultato trovato
                            </CommandEmpty>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
