import * as React from "react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X } from "lucide-react";

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: (row: T) => React.ReactNode;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingRows?: number;
  rowClassName?: (row: T) => string;
}

type SortDirection = "asc" | "desc" | null;

interface SortConfig {
  key: string;
  direction: SortDirection;
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  searchPlaceholder = "Cerca in tutte le colonne...",
  emptyMessage = "Nessun dato trovato",
  loading = false,
  loadingRows = 3,
  rowClassName,
}: DataTableProps<T>) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: null });
  const [openFilterPopover, setOpenFilterPopover] = useState<string | null>(null);

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply global search
    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      result = result.filter((row) => {
        return columns.some((col) => {
          const value = getNestedValue(row, col.key as string);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply column filters (text-based search, not exact match)
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue) {
        const searchLower = filterValue.toLowerCase();
        result = result.filter((row) => {
          const value = getNestedValue(row, key);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      }
    });

    return result;
  }, [data, globalSearch, columnFilters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue), "it");
      }

      return sortConfig.direction === "desc" ? -comparison : comparison;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      if (prev.direction === "desc") {
        return { key: "", direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const handleColumnFilter = (key: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearColumnFilter = (key: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setOpenFilterPopover(null);
  };

  const clearFilters = () => {
    setGlobalSearch("");
    setColumnFilters({});
    setSortConfig({ key: "", direction: null });
  };

  const hasActiveFilters = globalSearch || Object.values(columnFilters).some((v) => v);
  const activeColumnFiltersCount = Object.values(columnFilters).filter((v) => v).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {Array.from({ length: loadingRows }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Global Search and Clear Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Cancella Filtri {activeColumnFiltersCount > 0 && `(${activeColumnFiltersCount})`}
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {sortedData.length} di {data.length} risultati
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const hasActiveFilter = !!columnFilters[col.key as string];

                return (
                  <TableHead key={col.key as string} className={col.className}>
                    <div className="flex items-center gap-1">
                      {/* Column label - clickable for sorting if sortable */}
                      {col.sortable ? (
                        <button
                          className="hover:text-foreground transition-colors font-medium"
                          onClick={() => handleSort(col.key as string)}
                        >
                          {col.label}
                        </button>
                      ) : (
                        <span>{col.label}</span>
                      )}

                      {/* Filter icon with popover - available for ALL columns */}
                      <Popover
                        open={openFilterPopover === col.key}
                        onOpenChange={(open) => setOpenFilterPopover(open ? col.key as string : null)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className={`p-0.5 rounded hover:bg-accent transition-colors ${hasActiveFilter ? "text-primary" : "text-muted-foreground hover:text-foreground"
                              }`}
                            title={`Filtra ${col.label}`}
                          >
                            <Search className="h-3 w-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Filtra {col.label}</p>
                            <Input
                              placeholder={`Cerca in ${col.label}...`}
                              value={columnFilters[col.key as string] || ""}
                              onChange={(e) => handleColumnFilter(col.key as string, e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                            />
                            {hasActiveFilter && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-7 text-xs"
                                onClick={() => clearColumnFilter(col.key as string)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Rimuovi filtro
                              </Button>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableHead>
                );
              })}
              {actions && <TableHead className="text-right">Azioni</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-12 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={index} className={rowClassName?.(row)}>
                  {columns.map((col) => (
                    <TableCell key={col.key as string} className={col.className}>
                      {col.render
                        ? col.render(getNestedValue(row, col.key as string), row)
                        : getNestedValue(row, col.key as string) ?? "-"}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">{actions(row)}</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
