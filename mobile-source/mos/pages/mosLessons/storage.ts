import { useEffect, useMemo, useState } from "react";
import { seedData } from "./data";
import type { AppData } from "./types";

const STORAGE_KEY = "mos-teaching-notebook:data";

export function useAppData() {
  const [data, setData] = useState<AppData>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return seedData;
    }

    try {
      return mergeSeedData(JSON.parse(raw) as AppData);
    } catch {
      return seedData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  return useMemo(
    () => ({
      data,
      setData,
      resetData: () => setData(seedData),
      exportData: () => JSON.stringify(data, null, 2),
      importData: (json: string) => setData(JSON.parse(json) as AppData),
    }),
    [data],
  );
}

function mergeSeedData(current: AppData): AppData {
  return {
    students: mergeById(seedData.students, current.students),
    lessons: mergeById(seedData.lessons, current.lessons, (seedItem, currentItem) => ({
      ...seedItem,
      status: currentItem.status ?? seedItem.status,
      note: currentItem.note ?? seedItem.note,
    })),
    practices: mergeById(seedData.practices, current.practices),
    progress: mergeById(seedData.progress, current.progress),
  };
}

function mergeById<T extends { id: string }>(
  seedItems: T[],
  currentItems: T[],
  mergeItem: (seedItem: T, currentItem: T) => T = (seedItem) => seedItem,
) {
  const currentById = new Map(currentItems.map((item) => [item.id, item]));
  const seedIds = new Set(seedItems.map((item) => item.id));
  const mergedSeedItems = seedItems.map((seedItem) => {
    const currentItem = currentById.get(seedItem.id);
    return currentItem ? mergeItem(seedItem, currentItem) : seedItem;
  });
  const customItems = currentItems.filter((item) => !seedIds.has(item.id));

  return [...mergedSeedItems, ...customItems];
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export type AppStore = ReturnType<typeof useAppData>;
