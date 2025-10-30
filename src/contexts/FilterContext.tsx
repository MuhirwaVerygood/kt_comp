"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FilterContextType {
  selectedBrand: string | null;
  setSelectedBrand: (brand: string | null) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  return (
    <FilterContext.Provider value={{ selectedBrand, setSelectedBrand }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}