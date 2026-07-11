import { InputGroup, InputGroupAddon, InputGroupInput } from "@anthiel/ui/components/input-group";
import { SearchIcon } from "lucide-react";

type DataTableSearchProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

export function DataTableSearch({
  value,
  onValueChange,
  placeholder = "Search…",
}: DataTableSearchProps) {
  return (
    <InputGroup className="h-10 max-w-xs sm:h-9" data-size="lg">
      <InputGroupAddon align="inline-start">
        <SearchIcon strokeWidth={1.5} />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        size="lg"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        nativeInput
      />
    </InputGroup>
  );
}
