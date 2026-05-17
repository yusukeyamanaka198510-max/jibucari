import { createSupabaseBrowserClient } from "./browserClient";

export interface UserProfileData {
  id: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  birthDate: string;
  gender: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressDetail: string;
  phone: string;
  email: string;
}

type DbRow = {
  id: string;
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  birth_date: string;
  gender: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address_detail: string;
  phone: string;
  email: string;
};

function toData(row: DbRow): UserProfileData {
  return {
    id: row.id,
    lastName: row.last_name,
    firstName: row.first_name,
    lastNameKana: row.last_name_kana,
    firstNameKana: row.first_name_kana,
    birthDate: row.birth_date,
    gender: row.gender,
    postalCode: row.postal_code,
    prefecture: row.prefecture,
    city: row.city,
    addressDetail: row.address_detail,
    phone: row.phone,
    email: row.email,
  };
}

export class SupabaseProfileRepository {
  private get supabase() {
    const client = createSupabaseBrowserClient();
    if (!client) throw new Error("Supabase が設定されていません");
    return client;
  }

  async get(userId: string): Promise<UserProfileData | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return toData(data as DbRow);
  }

  async upsert(userId: string, profile: Omit<UserProfileData, "id">): Promise<UserProfileData> {
    const row = {
      id: userId,
      last_name: profile.lastName,
      first_name: profile.firstName,
      last_name_kana: profile.lastNameKana,
      first_name_kana: profile.firstNameKana,
      birth_date: profile.birthDate,
      gender: profile.gender,
      postal_code: profile.postalCode,
      prefecture: profile.prefecture,
      city: profile.city,
      address_detail: profile.addressDetail,
      phone: profile.phone,
      email: profile.email,
    };

    const { data, error } = await this.supabase
      .from("profiles")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toData(data as DbRow);
  }
}
