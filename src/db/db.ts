// src/db/db.ts
import Dexie, { type Table } from "dexie";

export interface Text {
  id?: number;
  title: string;
  content: string;
  audioData?: Blob; // Guardaremos el audio aquí
  createdAt: Date;
}

export interface Word {
  lemma: string; // The base form of the word
  status: 'known' | 'unknown';
  translation?: string;
}

export class MySubClassedDexie extends Dexie {
  texts!: Table<Text>;
  words!: Table<Word>;

  constructor() {
    super("englishReaderDB");
    this.version(1).stores({
      texts: "++id, title, createdAt", // ++id es autoincremental, el resto son índices
      words: "&lemma, status", // &lemma significa que es una clave primaria única
    });
  }
}

export const db = new MySubClassedDexie();
