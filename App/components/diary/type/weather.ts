// src/types/weather.ts
export type RegionWeatherDto = {
  addressName: string | null;
  sido: string | null;
  sigungu: string | null;
  dong: string | null;
  lat: number | null;
  lon: number | null;
  temperature2m: number | null;        // ℃
  humidity: number | null;             // %
  apparentTemperature: number | null;  // 체감온도
  weatherCode: number | null;          // WMO 코드
};
