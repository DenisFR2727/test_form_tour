import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPrice,
  getHotel,
  getCountries,
  PriceOffer,
  Hotel,
  Country,
} from "../../api/api";
import Loading from "../loading/loading";
import { formatDate, formatPrice } from "../../utils/formatters";
import "./tour-detail.scss";

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

export default function TourDetailPage() {
  const { priceId } = useParams<{ priceId: string }>();
  const [price, setPrice] = useState<PriceOffer | null>(null);
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [countries, setCountries] = useState<Record<string, Country>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Завантажуємо країни для прапорців
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

  // Функція для відображення сервісів
  const renderService = (key: string, value: string | undefined) => {
    if (!value || value === "none") return null;

    const serviceNames: Record<string, string> = {
      wifi: "Wi-Fi",
      aquapark: "Аквапарк",
      tennis_court: "Тенісний корт",
      laundry: "Пральня",
      parking: "Парковка",
    };

    const serviceIcons: Record<string, string> = {
      wifi: "📶",
      aquapark: "🏊",
      tennis_court: "🎾",
      laundry: "🧺",
      parking: "🅿️",
    };

    return (
      <div key={key} className="tour-detail-service">
        <span className="tour-detail-service-icon">
          {serviceIcons[key] || "✓"}
        </span>
        <span className="tour-detail-service-name">
          {serviceNames[key] || key}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="tour-detail-loading">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-detail-error">
        <p className="error">{error}</p>
        <Link to="/" className="tour-detail-back-link">
          Повернутися до пошуку
        </Link>
      </div>
    );
  }

  if (!price) {
    return (
      <div className="tour-detail-error">
        <p>Тур не знайдено</p>
        <Link to="/" className="tour-detail-back-link">
          Повернутися до пошуку
        </Link>
      </div>
    );
  }

  return (
    <div className="tour-detail">
      <div className="tour-detail-container">
        {hotel ? (
          <>
            <div className="tour-detail-header">
              <h1 className="tour-detail-title">{hotel.name}</h1>
              <div className="tour-detail-location">
                {countries[hotel.countryId] && (
                  <img
                    src={countries[hotel.countryId].flag}
                    alt={hotel.countryName}
                    className="tour-detail-flag"
                  />
                )}
                <span>{hotel.countryName}</span>
                <span className="tour-detail-location-separator">•</span>
                <span>{hotel.cityName}</span>
              </div>
            </div>

            <img src={hotel.img} alt={hotel.name} className="tour-detail-img" />

            {hotel.description && (
              <div className="tour-detail-section">
                <h2 className="tour-detail-section-title">Опис</h2>
                <p className="tour-detail-description">{hotel.description}</p>
              </div>
            )}

            {hotel.services && (
              <div className="tour-detail-section">
                <h2 className="tour-detail-section-title">Сервіси</h2>
                <div className="tour-detail-services">
                  {Object.entries(hotel.services).map(([key, value]) =>
                    renderService(key, value)
                  )}
                </div>
              </div>
            )}

            <div className="tour-detail-booking">
              <div className="tour-detail-booking-info">
                <div className="tour-detail-date">
                  <span className="tour-detail-date-icon">📅</span>
                  <span>{formatDate(price.startDate)}</span>
                </div>
                <div className="tour-detail-price">
                  {formatPrice(price.amount, price.currency)}
                </div>
              </div>
              <button className="tour-detail-button">Відкрити ціну</button>
            </div>
          </>
        ) : (
          <div className="tour-detail-no-hotel">
            <p>Інформація про готель недоступна</p>
            <div className="tour-detail-booking">
              <div className="tour-detail-booking-info">
                <div className="tour-detail-date">
                  <span className="tour-detail-date-icon">📅</span>
                  <span>{formatDate(price.startDate)}</span>
                </div>
                <div className="tour-detail-price">
                  {formatPrice(price.amount, price.currency)}
                </div>
              </div>
              <button className="tour-detail-button">Відкрити ціну</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
