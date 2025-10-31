import { useCallback, useState } from "react";
import { useEffect } from "react";
import {
  getCountries,
  searchGeo,
  GeoEntity,
  Country,
  GeoResponse,
} from "../../api/api";

import "./form.scss";
import DropdownList from "../dropdown/dropdown";

export default function TourSearchForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoEntity[]>([]);
  const [selected, setSelected] = useState<GeoEntity | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Завантаження країн при відкритті інпуту ---
  useEffect(() => {
    if (!open || query) return;

    (async () => {
      try {
        setLoading(true);
        const res = await getCountries(); // Promise<Response>
        const data: Record<string, Country> = await res.json(); // розпарсили JSON
        const countries: GeoEntity[] = Object.values(data).map((country) => ({
          ...country,
          type: "country",
        }));
        setResults(countries);
      } catch (error) {
        console.error("Помилка getCountries:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, query]);

  // --- Пошук при введенні тексту ---
  useEffect(() => {
    if (!query) return;

    (async () => {
      try {
        setLoading(true);
        const res = await searchGeo(query); // Promise<Response>
        const data: GeoResponse = await res.json();
        setResults(Object.values(data)); // перетворюємо у масив GeoEntity
      } catch (error) {
        console.error("Помилка searchGeo:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [query]);

  // --- Вибір елемента ---
  const handleSelect = useCallback((item: GeoEntity) => {
    setSelected(item);
    setQuery(item.name);
    setOpen(false);
  }, []);

  // --- Сабміт форми ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 Пошук:", selected || query);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("🔍 Пошук:", selected || query);
    }
  };

  // --- Клік (фокус) на інпут ---
  const handleFocus = async () => {
    setOpen(true);

    // Якщо нічого не введено — показати список країн
    if (!query) {
      setSelected(null);
      try {
        setLoading(true);
        const res = await getCountries();
        const data: Record<string, Country> = await res.json();
        const countries: GeoEntity[] = Object.values(data).map((country) => ({
          ...country,
          type: "country",
        }));
        setResults(countries);
      } catch (error) {
        console.error("Помилка getCountries:", error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Якщо вже є вибір
    if (selected) {
      if (selected.type === "country") {
        // Якщо вибрана країна — показати всі країни
        try {
          setLoading(true);
          const res = await getCountries();
          const data: Record<string, Country> = await res.json();
          const countries: GeoEntity[] = Object.values(data).map((country) => ({
            ...country,
            type: "country",
          }));
          setResults(countries);
        } catch (error) {
          console.error("Помилка getCountries:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Якщо вибране місто або готель — пошукати за текстом у полі
        try {
          setLoading(true);
          const res = await searchGeo(query);
          const data: GeoResponse = await res.json();
          setResults(Object.values(data));
        } catch (error) {
          console.error("Помилка searchGeo:", error);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Якщо просто введений текст без вибору
      try {
        setLoading(true);
        const res = await searchGeo(query);
        const data: GeoResponse = await res.json();
        setResults(Object.values(data));
      } catch (error) {
        console.error("Помилка searchGeo:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <form onSubmit={handleSubmit} className="tour_search">
      <h2 className="tour_search-title">Форма пошуку турів</h2>
      <div className="input-wrapper">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          onFocus={() => {
            setOpen(true);
            handleFocus();
          }}
          onKeyDown={handleKeyDown}
        />
        <div id="overlay-dropdown"></div>
        {open && (
          <DropdownList
            handleSelect={handleSelect}
            loading={loading}
            results={results}
          />
        )}
      </div>

      <button type="submit">Знайти</button>
    </form>
  );
}
