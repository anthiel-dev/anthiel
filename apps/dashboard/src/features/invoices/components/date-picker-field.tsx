import { Button } from "@anthiel/ui";
import { Calendar } from "@anthiel/ui/components/calendar";
import { Popover, PopoverPopup, PopoverTrigger } from "@anthiel/ui/components/popover";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

type DatePickerFieldProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

function parseDateInput(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseDateInput(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function DatePickerField({
  id,
  value,
  onValueChange,
  placeholder = "Pick a due date",
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDateInput(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
            data-empty={!value || undefined}
          >
            {value ? (
              <span>{formatDisplayDate(value)}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <CalendarIcon className="ms-auto opacity-60" />
          </Button>
        }
      />
      <PopoverPopup align="start" className="w-auto overflow-hidden p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onValueChange(date ? toDateInputValue(date) : "");
            setOpen(false);
          }}
        />
      </PopoverPopup>
    </Popover>
  );
}
