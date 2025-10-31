import { useState } from "react";
import { useEffect } from "react";
import {
  getCountries,
  searchGeo,
  GeoEntity,
  Country,
  GeoResponse,
} from "../../api/api";

import "./form-search";

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
        const countries: GeoEntity[] = Object.values(data).map((c) => ({
          ...c,
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
  const handleSelect = (item: GeoEntity) => {
    setSelected(item);
    setQuery(item.name);
    setOpen(false);
  };

  // --- Сабміт форми ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 Пошук:", selected || query);
  };

  return (
    <form onSubmit={handleSubmit} className="tour-search">
      <h2>Форма пошуку турів</h2>

      <div className="input-wrapper">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Куди летимо?"
        />
        {open && (
          <ul className="dropdown">
            {loading && <li className="loading">Завантаження...</li>}

            {!loading &&
              results.map((item) => (
                <li key={item.id} onClick={() => handleSelect(item)}>
                  {item.type === "country" && (
                    <img
                      src={(item as Country).flag}
                      alt={item.name}
                      width={24}
                      height={16}
                    />
                  )}
                  <span>
                    {item.name}
                    {item.type === "city" && " 🏙️"}
                    {item.type === "hotel" && " 🏨"}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <button type="submit">Знайти</button>
    </form>
  );
}
