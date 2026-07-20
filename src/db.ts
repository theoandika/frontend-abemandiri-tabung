import { Dexie, Table } from "dexie";

export interface MemberTransaction {
  id: string;
  date: string;
  site: {
	id: string
	name: string
  };
  member: {
    label: string;
    value: string;
  } | null;
  transaction_type: string;
  tube_status: string;
  note: string;
  nominal: string;
  document?: File | null;
  barcodes: {
    id: string;
    value: string;
  }[];
  created_at: string;
  retry_count?: number;
}

export class LocalDB extends Dexie {
  memberTransactions!: Table<MemberTransaction>;
  constructor() {
    super("LocalDB");
    this.version(1).stores({
      memberTransactions: "id",
    });
  }
}

export const db = new LocalDB();