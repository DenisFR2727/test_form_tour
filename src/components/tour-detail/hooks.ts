import { useEffect, useState } from "react";
import {
  getPrice,
  getHotel,
  getCountries,
  PriceOffer,
  Hotel,
  Country,
} from "../../api/api";

interface HotelDetail extends Hotel {
  description?: string;
  services?: {
    wifi?: string;
    aquapark?: string;
    tennis_court?: string;
    laundry?: string;
    parking?: string;
    [key: string]: string | undefined;
  };
}

export default function useTourDetail(priceId: string | undefined) {
  const [price, setPrice] = useState<PriceOffer | null>(null);
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [countries, setCountries] = useState<Record<string, Country>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Завантажуємо країни для прапорців
  useEffect(() => {
    (async () => {
      try {
        const res = await getCountries();
        const countriesData = await res.json();
        setCountries(countriesData);
      } catch (error) {
        console.error("Помилка завантаження країн:", error);
      }
    })();
  }, []);

  // Завантажуємо дані про ціну та готель
  useEffect(() => {
    if (!priceId) {
      setError("ID туру не вказано");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Отримуємо деталі ціни
        const priceRes = await getPrice(priceId);
        if (!priceRes.ok) {
          const errorData = await priceRes.json();
          throw new Error(`Помилка ${errorData.code}: ${errorData.message}`);
        }

        const priceData: PriceOffer = await priceRes.json();
        setPrice(priceData);

        // Отримуємо деталі готелю якщо є hotelID
        if (priceData.hotelID) {
          const hotelRes = await getHotel(priceData.hotelID);
          if (!hotelRes.ok) {
            const errorData = await hotelRes.json();
            throw new Error(`Помилка ${errorData.code}: ${errorData.message}`);
          }

          const hotelData: HotelDetail = await hotelRes.json();
          setHotel(hotelData);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Сталася невідома помилка");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [priceId]);

  return { price, hotel, countries, loading, error };
}

