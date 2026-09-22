"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizePhoneNumber } from "@/lib/whatsapp";

const CACHE_KEY = "bid_employees_v3_cache";

export const DEFAULT_HEADS = [
  {
    id: "head_harleen",
    name: "Harleen",
    role: "TeamHead",
    isHead: true,
    phone: "",
  },
  {
    id: "head_namika",
    name: "Namika",
    role: "Hr and crmhead",
    isHead: true,
    phone: "",
  },
];

function getCachedEmployeesRaw() {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse cached employees", e);
    }
  }
  return DEFAULT_HEADS;
}

function ensureDefaultHeads(list = []) {
  const cached = getCachedEmployeesRaw();
  const cachedHarleen = cached.find((e) => e && e.id === "head_harleen");
  const cachedNamika = cached.find((e) => e && e.id === "head_namika");

  const map = new Map();
  list.forEach((item) => {
    if (item && item.id) {
      map.set(item.id, item);
    }
  });

  // Ensure Harleen
  if (!map.has("head_harleen")) {
    map.set("head_harleen", {
      id: "head_harleen",
      name: "Harleen",
      role: "TeamHead",
      isHead: true,
      phone: cachedHarleen?.phone || "",
    });
  } else {
    const h = map.get("head_harleen");
    map.set("head_harleen", {
      ...h,
      name: "Harleen",
      role: "TeamHead",
      isHead: true,
      phone: h.phone || cachedHarleen?.phone || "",
    });
  }

  // Ensure Namika
  if (!map.has("head_namika")) {
    map.set("head_namika", {
      id: "head_namika",
      name: "Namika",
      role: "Hr and crmhead",
      isHead: true,
      phone: cachedNamika?.phone || "",
    });
  } else {
    const n = map.get("head_namika");
    map.set("head_namika", {
      ...n,
      name: "Namika",
      role: "Hr and crmhead",
      isHead: true,
      phone: n.phone || cachedNamika?.phone || "",
    });
  }

  return Array.from(map.values());
}

export function useEmployees() {
  const [employees, setEmployees] = useState(DEFAULT_HEADS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hydrate cached employees on client mount
    const cached = getCachedEmployeesRaw();
    setEmployees(ensureDefaultHeads(cached));

    // Realtime subscription to employees collection
    const q = query(collection(db, "employees"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });

        const merged = ensureDefaultHeads(list);
        setEmployees(merged);

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
          } catch (e) {}
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore employees listener error:", err);
        setError(err.message || "Failed to load employees");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update a Head's WhatsApp number or details
  const updateHeadPhone = async (headId, phone) => {
    if (!headId) return;
    const cleanedPhone = phone?.trim() ? normalizePhoneNumber(phone) : "";
    const headDefaults = DEFAULT_HEADS.find((h) => h.id === headId);
    if (!headDefaults) return;

    // Instant local optimistic update
    setEmployees((prev) => {
      const next = prev.map((e) =>
        e.id === headId ? { ...e, phone: cleanedPhone } : e
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    // Firestore update
    try {
      const ref = doc(db, "employees", headId);
      await setDoc(
        ref,
        {
          id: headId,
          name: headDefaults.name,
          role: headDefaults.role,
          isHead: true,
          phone: cleanedPhone,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Firestore update head phone error:", err);
    }
  };

  // Add team member under a specific head
  const addEmployee = async ({ name, role, phone, headId = "head_harleen" }) => {
    if (!name?.trim()) throw new Error("Team member name is required");
    
    const cleanedPhone = phone?.trim() ? normalizePhoneNumber(phone) : "";

    const newDocRef = doc(collection(db, "employees"));
    const head = DEFAULT_HEADS.find((h) => h.id === headId) || DEFAULT_HEADS[0];

    const newEmployee = {
      id: newDocRef.id,
      name: name.trim(),
      role: role?.trim() || "Team Member",
      phone: cleanedPhone,
      headId: head.id,
      headName: head.name,
      isHead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Instant optimistic update
    setEmployees((prev) => {
      const updated = [...prev, newEmployee];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    try {
      await setDoc(newDocRef, {
        name: name.trim(),
        role: role?.trim() || "Team Member",
        phone: cleanedPhone,
        headId: head.id,
        headName: head.name,
        isHead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newDocRef.id;
    } catch (err) {
      console.error("Firestore write error:", err);
      throw err;
    }
  };

  // Update team member
  const updateEmployee = async (id, { name, role, phone, headId }) => {
    if (!id) throw new Error("Missing member ID");
    if (!name?.trim()) throw new Error("Name is required");

    const cleanedPhone = phone?.trim() ? normalizePhoneNumber(phone) : "";
    const targetHeadId = headId || "head_harleen";
    const head = DEFAULT_HEADS.find((h) => h.id === targetHeadId) || DEFAULT_HEADS[0];

    setEmployees((prev) => {
      const next = prev.map((e) =>
        e.id === id
          ? {
              ...e,
              name: name.trim(),
              role: role?.trim() || "Team Member",
              phone: cleanedPhone,
              headId: head.id,
              headName: head.name,
              updatedAt: new Date().toISOString(),
            }
          : e
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    const ref = doc(db, "employees", id);
    await updateDoc(ref, {
      name: name.trim(),
      role: role?.trim() || "Team Member",
      phone: cleanedPhone,
      headId: head.id,
      headName: head.name,
      updatedAt: serverTimestamp(),
    });
  };

  // Delete team member
  const deleteEmployee = async (id) => {
    if (!id) throw new Error("Missing ID");
    if (id === "head_harleen" || id === "head_namika") {
      throw new Error("Cannot delete primary head");
    }

    setEmployees((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    const ref = doc(db, "employees", id);
    await deleteDoc(ref);
  };

  return {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    updateHeadPhone,
    deleteEmployee,
  };
}
