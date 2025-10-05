// src/hooks/useMyWeather.ts
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

/** 🔷 백엔드 DTO와 동일한 평(flat) 구조 */
export type RegionWeatherDto = {
  addressName: string | null;   // 예: "서울특별시 중구 태평로1가"
  sido: string | null;          // 예: "서울특별시"
  sigungu: string | null;       // 예: "중구"
  dong: string | null;          // 예: "태평로1가"
  lat: number | null;
  lon: number | null;
  temperature2m: number | null; // ℃
  humidity: number | null;      // %
  apparentTemperature: number | null; // 체감온도
  weatherCode: number | null;   // WMO 코드
};

export type WeatherPos = { lat: number; lon: number };

/**
 * 좌표 + 백엔드 날씨까지 한 번에 처리하는 통합 훅
 * - pos, error, loading, perm, retry (지오로케이션)
 * - weather, weatherLoading, weatherError, retryWeather (날씨)
 * - badgeText (헤더 배지용 문구)
 */
export function useMyWeather() {
  /** 지오로케이션 상태 */
  const [pos, setPos] = useState<WeatherPos | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [perm, setPerm] = useState<PermissionState | "unsupported">("unsupported");
  const [geoLoading, setGeoLoading] = useState(true);

  /** 날씨 API 상태 */
  const [weather, setWeather] = useState<RegionWeatherDto | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  /** 권한 상태 조회 */
  useEffect(() => {
    let mounted = true;
    if ("permissions" in navigator && (navigator as any).permissions?.query) {
      (navigator as any)
        .permissions.query({ name: "geolocation" as PermissionName })
        .then((p: PermissionStatus) => {
          if (!mounted) return;
          setPerm(p.state);
          p.onchange = () => setPerm(p.state);
        })
        .catch(() => setPerm("unsupported"));
    } else {
      setPerm("unsupported");
    }
    return () => {
      mounted = false;
    };
  }, []);

  /** 좌표 1회 요청 */
  const retry = useCallback(() => {
    setGeoLoading(true);
    setGeoError(null);

    if (!("geolocation" in navigator)) {
      setGeoError("이 브라우저는 위치를 지원하지 않습니다.");
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude });
        setGeoLoading(false);
      },
      (e) => {
        const msg =
          e.code === 1
            ? "위치 권한이 차단되었습니다. 브라우저 사이트 설정에서 허용으로 바꿔주세요."
            : e.code === 2
            ? "위치를 가져올 수 없습니다. 잠시 후 다시 시도하거나 네트워크/기기 설정을 확인하세요."
            : e.code === 3
            ? "위치 요청이 시간초과되었습니다. 다시 시도해주세요."
            : e.message || "위치 요청 실패";
        setGeoError(msg);
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  /** 첫 좌표 요청 (마운트 후 1회) */
  useEffect(() => {
    retry();
  }, [retry]);

  /** 🔗 백엔드 호출: 리라이트 없이도 8080으로 확실히 붙도록 */
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:8080";
      const url = `${ORIGIN}/api/weather?lat=${lat}&lon=${lon}`;

      const res = await fetch(url, {
        cache: "no-store",
        // credentials: "include", // 세션/쿠키 필요 시 사용 + 서버 CORS 설정 필요
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("[/api/weather] HTTP", res.status, res.statusText, body);
        throw new Error(`Weather API HTTP ${res.status}`);
      }
      const json = (await res.json()) as RegionWeatherDto;
      setWeather(json);
    } catch (e: any) {
      setWeatherError(e.message ?? String(e));
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  /** 좌표가 준비되면 자동으로 백엔드 날씨 호출 */
  useEffect(() => {
    if (!pos) {
      setWeather(null);
      setWeatherLoading(false);
      setWeatherError(null);
      return;
    }
    fetchWeather(pos.lat, pos.lon);
  }, [pos?.lat, pos?.lon, fetchWeather]);

  /** 배지 텍스트 (하이드레이션 안전하도록 초기값 고정) */
  const badgeText = useMemo(() => {
    if (geoLoading) return "위치 확인 중…";
    if (geoError) return geoError;
    if (!pos) return "위치 없음";

    if (weatherLoading) return "날씨 불러오는 중…";
    if (weatherError) return "날씨 조회 실패";
    if (!weather) return "날씨 데이터 없음";

    const where =
      weather.addressName ||
      [weather.sido, weather.sigungu].filter(Boolean).join(" ");

    const t =
      typeof weather.temperature2m === "number"
        ? Math.round(weather.temperature2m)
        : null;

    return t !== null ? `${where} · ${t}°C` : `${where}`;
  }, [geoLoading, geoError, pos, weatherLoading, weatherError, weather]);

  /** 외부에서 날씨만 재요청하고 싶을 때 */
  const retryWeather = useCallback(() => {
    if (pos) fetchWeather(pos.lat, pos.lon);
  }, [pos, fetchWeather]);

  // 하위호환 필드 이름 유지: error/loading은 지오로케이션 기준
  return {
    // 지오로케이션
    pos,
    error: geoError,
    loading: geoLoading,
    perm,
    retry,

    // 날씨
    weather,
    weatherLoading,
    weatherError,
    retryWeather,

    // 헤더 배지용
    badgeText,
  };
}
