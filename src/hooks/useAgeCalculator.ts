import { useMemo } from "react";
import { calculateAge, getSchoolEntranceYear } from "@/domain/entities/resume";

/**
 * 生年月日から年齢・小学校入学年度を返す。
 * @param birthDate - ISO 8601 (YYYY-MM-DD)
 */
export function useAgeCalculator(birthDate: string) {
  const age = useMemo(() => calculateAge(birthDate), [birthDate]);
  const schoolEntranceYear = useMemo(
    () => getSchoolEntranceYear(birthDate),
    [birthDate]
  );

  return { age, schoolEntranceYear };
}
