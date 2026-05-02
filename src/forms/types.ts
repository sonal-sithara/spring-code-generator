export interface BaseField {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  showWhen?: ShowWhen;
  pattern?: string;
  patternError?: string;
}

export interface ShowWhen {
  field: string;
  equals: string | string[] | boolean;
}

export interface TextField extends BaseField {
  kind: "text" | "textarea";
  placeholder?: string;
  default?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectField extends BaseField {
  kind: "select";
  options: SelectOption[];
  default?: string;
}

export interface MultiSelectField extends BaseField {
  kind: "multiSelect";
  options: SelectOption[];
  defaults?: string[];
}

export interface CheckboxField extends BaseField {
  kind: "checkbox";
  default?: boolean;
}

export interface ListField extends BaseField {
  kind: "list";
  itemLabel: string;
  fields: FieldSchema[];
  minItems?: number;
  defaultItems?: number;
}

export type FieldSchema =
  | TextField
  | SelectField
  | MultiSelectField
  | CheckboxField
  | ListField;

export interface FormSchema {
  title: string;
  description?: string;
  submitLabel?: string;
  fields: FieldSchema[];
}

export type FormValue = string | boolean | string[] | FormResult[];

export interface FormResult {
  [key: string]: FormValue;
}
