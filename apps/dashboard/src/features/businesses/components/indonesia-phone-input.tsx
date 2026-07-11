import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@anthiel/ui/components/input-group";

/** Digits after country code, without leading 0 (e.g. 81234567890). */
export function toIdNationalDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 13);
}

/** Format national digits as `812 3456 7890`. */
export function formatIdNationalNumber(digits: string) {
  const d = toIdNationalDigits(digits);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 11) return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7, 11)}${d.length > 11 ? ` ${d.slice(11)}` : ""}`;
}

/** Persist as `+62 812 3456 7890`, or empty. */
export function formatIdPhoneValue(digits: string) {
  const national = toIdNationalDigits(digits);
  if (!national) return "";
  return `+62 ${formatIdNationalNumber(national)}`;
}

type IndonesiaPhoneInputProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
};

export function IndonesiaPhoneInput({
  id,
  value,
  onValueChange,
  placeholder = "812 3456 7890",
  "aria-label": ariaLabel,
}: IndonesiaPhoneInputProps) {
  const national = toIdNationalDigits(value);
  const display = formatIdNationalNumber(national);

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <InputGroupText>+62</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={display}
        placeholder={placeholder}
        aria-label={ariaLabel}
        nativeInput
        onChange={(event) => {
          onValueChange(formatIdPhoneValue(event.target.value));
        }}
      />
    </InputGroup>
  );
}
