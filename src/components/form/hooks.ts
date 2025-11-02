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
import { handleApiError } from "./error";
import { openSelector, querySelector } from "./selectors";

type WritableRef<T> = { current: T };

export default function useFetchTours() {
  const dispatch = useAppDispatch();
  const query = useAppSelector(querySelector);
  const open = useAppSelector(openSelector);

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
        dispatch(setError(handleApiError(error)));
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
        dispatch(setError(handleApiError(error)));
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
    async (
      token: string,
      delay: number,
      maxRetries: number,
      currentTokenRef?: WritableRef<string | null>
    ) => {
      // Перевіряємо чи це все ще актуальний токен
      if (
        currentTokenRef &&
        currentTokenRef.current !== null &&
        currentTokenRef.current !== token
      ) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, Math.max(0, delay)));

      // Знову перевіряємо після затримки
      if (
        currentTokenRef &&
        currentTokenRef.current !== null &&
        currentTokenRef.current !== token
      ) {
        return;
      }

      let attempt = 0;
      while (attempt < maxRetries) {
        attempt++;

        // Перевіряємо перед кожним запитом
        if (
          currentTokenRef &&
          currentTokenRef.current !== null &&
          currentTokenRef.current !== token
        ) {
          return;
        }

        try {
          const res = await getSearchPrices(token);

          // Перевіряємо після запиту
          if (
            currentTokenRef &&
            currentTokenRef.current !== null &&
            currentTokenRef.current !== token
          ) {
            return;
          }

          if (!res.ok) {
            const errorData = (await res.json()) as ErrorResponse;

            if (errorData.code === 425 && errorData.waitUntil) {
              const waitTime =
                new Date(errorData.waitUntil).getTime() - Date.now();
              await new Promise((r) => setTimeout(r, Math.max(0, waitTime)));
              continue;
            }

            // Для 400 або 404
            throw new Error(
              `API error ${errorData.code}: ${errorData.message}`
            );
          }

          const data = await res.json();

          // Перевіряємо перед обробкою даних
          if (
            currentTokenRef &&
            currentTokenRef.current !== null &&
            currentTokenRef.current !== token
          ) {
            return;
          }

          if (data.status === "inProgress") {
            const wait = new Date(data.waitUntil).getTime() - Date.now();
            await new Promise((r) => setTimeout(r, Math.max(0, wait)));
            continue;
          }

          if (data.status === "done" && data.results) {
            const resultsArray: PriceOffer[] = Object.values(data.results);
            dispatch(setTours(resultsArray));
            return;
          }

          if (data.prices && typeof data.prices === "object") {
            const resultsArray: PriceOffer[] = Object.values(data.prices);
            dispatch(setTours(resultsArray));
            return;
          }

          return;
        } catch (error) {
          // Перевіряємо перед обробкою помилки
          if (
            currentTokenRef &&
            currentTokenRef.current !== null &&
            currentTokenRef.current !== token
          ) {
            return;
          }

          if (attempt >= maxRetries) {
            const handledError = handleApiError(error);
            dispatch(setError(handledError));
            throw error;
          }
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    },
    [dispatch]
  );

  return { fetchSearchResults };
};
