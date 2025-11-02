import { GeoEntity } from "../api/api";

// Функція для витягнення countryID з GeoEntity
export function getCountryID(selected: GeoEntity | null): string | null {
  if (!selected) return null;

  if (selected.type === "country") {
    return selected.id;
  }

  if (selected.type === "hotel") {
    return selected.countryId;
  }

  if (selected.type === "city" && selected.countryId) {
    return selected.countryId;
  }

  return null;
}
