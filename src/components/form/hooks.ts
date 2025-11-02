import { useCallback, useEffect } from "react";
import {
  Country,
  ErrorResponse,
  GeoEntity,
  GeoResponse,
  getCountries,
  getSearchPrices,
  PriceOffer,
  searchGeo,
} from "../../api/api";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  setError,
  setLoading,
  setOpen,
  setQuery,
  setResults,
  setSelected,
  setTours,
} from "./tourSlice";

export default function useFetchTours() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.query);
  const open = useAppSelector((state) => state.open);

  // --- Loading country
  useEffect(() => {
    if (!open || query) return;

    (async () => {
      try {
        dispatch(setLoading(true));

        const res = await getCountries();
        const data: Record<string, Country> = await res.json();
        const countries: GeoEntity[] = Object.values(data).map((country) => ({
          ...country,
          type: "country",
        }));
        dispatch(setResults(countries));
      } catch (error) {
        console.error("Помилка getCountries:", error);
      } finally {
        dispatch(setLoading(false));
      }
    })();
  }, [open, query, dispatch]);

  // --- Search in input
  useEffect(() => {
    if (!query) return;

    (async () => {
      try {
        dispatch(setLoading(true));

        const res = await searchGeo(query);

        if (!res.ok) {
          const errorData: ErrorResponse = await res.json();
          throw new Error(
            `Error ${errorData.code}: ${errorData.message}` +
              (errorData.waitUntil
                ? `, повторити після ${errorData.waitUntil}`
                : "")
          );
        }

        const data: GeoResponse = await res.json();
        dispatch(setResults(Object.values(data)));
      } catch (error: unknown) {
        let message = "An unknown error occurred";

        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === "string") {
          message = error;
        }
        dispatch(setError(message));
      } finally {
        dispatch(setLoading(false));
      }
    })();
  }, [query, dispatch]);

  // --- Select element
  const handleSelect = useCallback(
    (item: GeoEntity) => {
      dispatch(setSelected(item));
      dispatch(setQuery(item.name));
      dispatch(setOpen(false));
    },
    [dispatch]
  );

  return { query, open, handleSelect };
}

// useFetchSearchResults hook
export const useFetchSearchResults = () => {
  const dispatch = useAppDispatch();

  const fetchSearchResults = useCallback(
    async (token: string, delay: number, maxRetries: number) => {
      console.log(`⏳ Очікування ${delay}ms перед getSearchPrices...`);
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, delay)));

      let attempt = 0;
      while (attempt <= maxRetries) {
        attempt++;
        try {
          const res = await getSearchPrices(token);
          const data = await res.json();

          if (data.status === "inProgress") {
            const wait = new Date(data.waitUntil).getTime() - Date.now();
            await new Promise((r) => setTimeout(r, Math.max(0, wait)));
            continue;
          }

          if (data.status === "done" && data.results) {
            dispatch(setTours(data.results));
            break;
          }

          if (data.prices && typeof data.prices === "object") {
            const resultsArray: PriceOffer[] = Object.entries(data.prices).map(
              ([key, value]) => ({ ...(value as PriceOffer), id: key })
            );
            dispatch(setTours(resultsArray));

            break;
          }

          break;
        } catch (error) {
          attempt++;
          if (attempt > maxRetries) throw error;
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    },
    [dispatch]
  );

  return { fetchSearchResults };
};
