import { FormResult } from "./types";

export const getString = (result: FormResult, key: string): string =>
  ((result[key] as string | undefined) ?? "").trim();

export const getStringOr = (
  result: FormResult,
  key: string,
  fallback: string
): string => getString(result, key) || fallback;

export const getOptionalString = (
  result: FormResult,
  key: string
): string | undefined => getString(result, key) || undefined;

export const getBool = (result: FormResult, key: string): boolean =>
  Boolean(result[key]);

export const getList = (result: FormResult, key: string): FormResult[] =>
  (result[key] as FormResult[] | undefined) ?? [];
