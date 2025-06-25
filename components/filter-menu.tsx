"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Search, X } from "lucide-react";
import { useAppointments } from "@/lib/context/appointments-context";

interface FilterMenuProps {
  onClose?: () => void;
}

export function FilterMenu({ onClose }: FilterMenuProps) {
  const { 
    filters, 
    setFilters, 
    clearFilters, 
    getAvailableCategories,
    filteredAppointments 
  } = useAppointments();

  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);
  const [localDateStart, setLocalDateStart] = useState(filters.dateRange.start || "");
  const [localDateEnd, setLocalDateEnd] = useState(filters.dateRange.end || "");

  const availableCategories = getAvailableCategories();

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    setFilters({ categories: newCategories });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ searchTerm: localSearchTerm });
  };

  const handleDateRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      dateRange: {
        start: localDateStart || null,
        end: localDateEnd || null
      }
    });
  };

  const handleClearFilters = () => {
    clearFilters();
    setLocalSearchTerm("");
    setLocalDateStart("");
    setLocalDateEnd("");
  };

  const hasActiveFilters = filters.categories.length > 0 || 
                          filters.searchTerm || 
                          filters.dateRange.start || 
                          filters.dateRange.end;

  return (
    <div className="space-y-6 p-4 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Termine filtern</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Ergebnisse Anzeige */}
      <div className="text-sm text-muted-foreground">
        {filteredAppointments.length} {filteredAppointments.length === 1 ? 'Termin' : 'Termine'} gefunden
      </div>

      {/* Suche */}
      <div className="space-y-2">
        <Label htmlFor="search">Suche</Label>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            id="search"
            placeholder="Titel, Notizen, Ort oder Patient durchsuchen..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        {filters.searchTerm && (
          <Badge variant="secondary" className="text-xs">
            Suche: &quot;{filters.searchTerm}&quot;
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1"
              onClick={() => {
                setFilters({ searchTerm: "" });
                setLocalSearchTerm("");
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>

      {/* Kategorien */}
      <div className="space-y-3">
        <Label>Kategorien</Label>
        {availableCategories.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableCategories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.label}</span>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Keine Kategorien verfügbar</p>
        )}
      </div>

      {/* Zeitraum */}
      <div className="space-y-3">
        <Label>Zeitraum</Label>
        <form onSubmit={handleDateRangeSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="date-start" className="text-xs">Von</Label>
              <Input
                id="date-start"
                type="date"
                value={localDateStart}
                onChange={(e) => setLocalDateStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date-end" className="text-xs">Bis</Label>
              <Input
                id="date-end"
                type="date"
                value={localDateEnd}
                onChange={(e) => setLocalDateEnd(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" size="sm" variant="outline" className="w-full">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Zeitraum anwenden
          </Button>
        </form>
        {(filters.dateRange.start || filters.dateRange.end) && (
          <Badge variant="secondary" className="text-xs">
            {filters.dateRange.start && `Von: ${new Date(filters.dateRange.start).toLocaleDateString("de-DE")}`}
            {filters.dateRange.start && filters.dateRange.end && " "}
            {filters.dateRange.end && `Bis: ${new Date(filters.dateRange.end).toLocaleDateString("de-DE")}`}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1"
              onClick={() => {
                setFilters({ dateRange: { start: null, end: null } });
                setLocalDateStart("");
                setLocalDateEnd("");
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>

      {/* Filter Aktionen */}
      <div className="pt-4 border-t space-y-2">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
        >
          Alle Filter zurücksetzen
        </Button>
        {hasActiveFilters && (
          <div className="text-xs text-muted-foreground text-center">
            {filters.categories.length > 0 && `${filters.categories.length} Kategorie(n)`}
            {filters.categories.length > 0 && (filters.searchTerm || filters.dateRange.start || filters.dateRange.end) && ", "}
            {filters.searchTerm && "Suchfilter"}
            {filters.searchTerm && (filters.dateRange.start || filters.dateRange.end) && ", "}
            {(filters.dateRange.start || filters.dateRange.end) && "Zeitraum"}
            {" aktiv"}
          </div>
        )}
      </div>
    </div>
  );
} 