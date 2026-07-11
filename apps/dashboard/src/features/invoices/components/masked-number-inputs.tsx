import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@anthiel/ui/components/input-group";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatGroupedDigits(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

type MaskedNumberInputProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  required?: boolean;
};

export function QuantityInput({
  id,
  value,
  onValueChange,
  placeholder = "1",
  "aria-label": ariaLabel,
  required,
}: MaskedNumberInputProps) {
  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        required={required}
        nativeInput
        onChange={(event) => {
          const next = digitsOnly(event.target.value);
          onValueChange(next.replace(/^0+(?=\d)/, ""));
        }}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>pcs</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

export function AmountInput({
  id,
  value,
  onValueChange,
  placeholder = "0",
  "aria-label": ariaLabel,
  required,
}: MaskedNumberInputProps) {
  const display = formatGroupedDigits(value);

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <InputGroupText>Rp</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={display}
        placeholder={placeholder}
        aria-label={ariaLabel}
        required={required}
        nativeInput
        onChange={(event) => {
          onValueChange(digitsOnly(event.target.value));
        }}
      />
    </InputGroup>
  );
}
