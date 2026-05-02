import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, isFirebaseConfigured, storage } from "./firebase";
import { ministries as seedMinistries, offices as seedOffices } from "@/data/ministries";
import { services as seedServices } from "@/data/services";
import type { Ministry, Office, Service } from "@/types";

const LS_SERVICES = "ssn_services_v1";
const LS_MINISTRIES = "ssn_ministries_v1";
const LS_OFFICES = "ssn_offices_v1";

function loadLS<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return fallback;
}

function saveLS<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Subscribe to services. Returns unsubscribe. */
export function subscribeServices(cb: (rows: Service[]) => void): () => void {
  if (!isFirebaseConfigured || !db) {
    cb(loadLS<Service>(LS_SERVICES, seedServices));
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_SERVICES) cb(loadLS<Service>(LS_SERVICES, seedServices));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }
  return onSnapshot(collection(db, "services"), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Service);
    if (rows.length === 0) {
      cb(seedServices);
    } else {
      cb(rows);
    }
  });
}

export function subscribeMinistries(cb: (rows: Ministry[]) => void): () => void {
  if (!isFirebaseConfigured || !db) {
    cb(loadLS<Ministry>(LS_MINISTRIES, seedMinistries));
    return () => {};
  }
  return onSnapshot(collection(db, "ministries"), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ministry);
    cb(rows.length ? rows : seedMinistries);
  });
}

export function subscribeOffices(cb: (rows: Office[]) => void): () => void {
  if (!isFirebaseConfigured || !db) {
    cb(loadLS<Office>(LS_OFFICES, seedOffices));
    return () => {};
  }
  return onSnapshot(collection(db, "offices"), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Office);
    cb(rows.length ? rows : seedOffices);
  });
}

export async function fetchServicesOnce(): Promise<Service[]> {
  if (!isFirebaseConfigured || !db) {
    return loadLS<Service>(LS_SERVICES, seedServices);
  }
  const snap = await getDocs(collection(db, "services"));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Service);
  return rows.length ? rows : seedServices;
}

export async function upsertService(s: Service): Promise<void> {
  const next: Service = { ...s, updatedAt: Date.now() };
  if (!isFirebaseConfigured || !db) {
    const cur = loadLS<Service>(LS_SERVICES, seedServices);
    const idx = cur.findIndex((x) => x.id === s.id);
    if (idx >= 0) cur[idx] = next;
    else cur.push(next);
    saveLS(LS_SERVICES, cur);
    return;
  }
  await setDoc(doc(db, "services", next.id), next);
}

export async function deleteService(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const cur = loadLS<Service>(LS_SERVICES, seedServices).filter(
      (x) => x.id !== id,
    );
    saveLS(LS_SERVICES, cur);
    return;
  }
  await deleteDoc(doc(db, "services", id));
}

export async function upsertMinistry(m: Ministry): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const cur = loadLS<Ministry>(LS_MINISTRIES, seedMinistries);
    const idx = cur.findIndex((x) => x.id === m.id);
    if (idx >= 0) cur[idx] = m;
    else cur.push(m);
    saveLS(LS_MINISTRIES, cur);
    return;
  }
  await setDoc(doc(db, "ministries", m.id), m);
}

export async function deleteMinistry(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const cur = loadLS<Ministry>(LS_MINISTRIES, seedMinistries).filter(
      (x) => x.id !== id,
    );
    saveLS(LS_MINISTRIES, cur);
    return;
  }
  await deleteDoc(doc(db, "ministries", id));
}

export async function upsertOffice(o: Office): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const cur = loadLS<Office>(LS_OFFICES, seedOffices);
    const idx = cur.findIndex((x) => x.id === o.id);
    if (idx >= 0) cur[idx] = o;
    else cur.push(o);
    saveLS(LS_OFFICES, cur);
    return;
  }
  await setDoc(doc(db, "offices", o.id), o);
}

export async function deleteOffice(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const cur = loadLS<Office>(LS_OFFICES, seedOffices).filter(
      (x) => x.id !== id,
    );
    saveLS(LS_OFFICES, cur);
    return;
  }
  await deleteDoc(doc(db, "offices", id));
}

export async function uploadDocument(
  file: File,
  pathPrefix = "documents",
): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    // In demo mode we read the file as a Blob URL — works in the browser tab only.
    return URL.createObjectURL(file);
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `${pathPrefix}/${Date.now()}_${safeName}`;
  const r = storageRef(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}
