import en from "./en.json";
import gu from "./gu.json";
import { Locale } from "./config";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  gu,
};

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang] ?? dictionaries.en;
}
