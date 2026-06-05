import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Database } from "@/types/database";

type TableName = keyof Database["public"]["Tables"];
type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
type Insert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
type Update<T extends TableName> = Database["public"]["Tables"][T]["Update"];

export function createCrudService<T extends TableName>(tableName: T) {
  const table = () => getSupabaseClient().from(tableName as string);

  return {
    async list(): Promise<Row<T>[]> {
      const { data, error } = await table().select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Row<T>[];
    },

    async getById(id: string): Promise<Row<T> | null> {
      const { data, error } = await table().select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as unknown as Row<T> | null;
    },

    async create(payload: Insert<T>): Promise<Row<T>> {
      const { data, error } = await table().insert(payload as never).select("*").single();
      if (error) throw error;
      return data as unknown as Row<T>;
    },

    async update(id: string, payload: Update<T>): Promise<Row<T>> {
      const { data, error } = await table().update(payload as never).eq("id", id).select("*").single();
      if (error) throw error;
      return data as unknown as Row<T>;
    },

    async remove(id: string): Promise<void> {
      const { error } = await table().delete().eq("id", id);
      if (error) throw error;
    },
  };
}
