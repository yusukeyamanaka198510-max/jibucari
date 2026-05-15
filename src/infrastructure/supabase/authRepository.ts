import { createSupabaseBrowserClient } from "./browserClient";
import type { User } from "@supabase/supabase-js";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthRepository {
  signUp(credentials: AuthCredentials): Promise<User>;
  signIn(credentials: AuthCredentials): Promise<User>;
  signOut(): Promise<void>;
  getUser(): Promise<User | null>;
}

/**
 * Supabase Email/Password 認証リポジトリ実装。
 */
export class SupabaseAuthRepository implements AuthRepository {
  private get supabase() {
    const client = createSupabaseBrowserClient();
    if (!client) throw new Error("Supabase が設定されていません");
    return client;
  }

  async signUp({ email, password }: AuthCredentials): Promise<User> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("ユーザー作成に失敗しました");
    return data.user;
  }

  async signIn({ email, password }: AuthCredentials): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("ログインに失敗しました");
    return data.user;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async getUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }
}
