import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function SearchBar({ value, onChange, placeholder = "Buscar..." }: SearchBarProps) {
  return (
    <div className="flex w-full max-w-xl items-center rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm shadow-slate-950/5 transition-all focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
      <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 border-0 bg-transparent px-0 text-sm font-medium shadow-none placeholder:text-slate-400 focus-visible:ring-0"
      />
    </div>
  );
}
