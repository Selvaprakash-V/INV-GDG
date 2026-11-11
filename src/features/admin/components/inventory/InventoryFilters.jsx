'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/shared/constants';
import { ALL_CATEGORIES, PRODUCT_SORTS } from '../../constants';

export default function InventoryFilters({ filters, setSearch, setCategory, setSort }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 flex-1">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        <Input
          type="search"
          placeholder="Search by name, barcode or description…"
          aria-label="Search inventory"
          className="pl-10 bg-white shadow-sm border border-gray-200 focus:border-purple-300"
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select value={filters.category} onValueChange={setCategory}>
        <SelectTrigger className="w-full md:w-[180px] bg-white" aria-label="Filter by category">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
          {PRODUCT_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.sort} onValueChange={setSort}>
        <SelectTrigger className="w-full md:w-[160px] bg-white" aria-label="Sort products">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_SORTS.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
