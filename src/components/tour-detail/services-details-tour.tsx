export function renderService(key: string, value: string | undefined) {
  if (!value || value === "none") {
    return null;
  }

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
}
