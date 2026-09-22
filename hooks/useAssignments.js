"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { generateId } from "@/lib/utils";

const CACHE_KEY = "bid_assignments_cache";

function getCachedAssignments() {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn("Failed to parse cached assignments", e);
    }
  }
  return [];
}

export function useAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If cache exists, hydrate it immediately on client mount
    const cached = getCachedAssignments();
    if (cached.length > 0) {
      setAssignments(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    const q = query(collection(db, "assignments"));

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
        setAssignments(list);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(list));
          } catch (e) {}
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore assignments listener error:", err);
        setError(err.message || "Failed to load assignments");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Map assignments by dateKey for fast lookup
  const assignmentsByDate = useMemo(() => {
    const map = {};
    for (const item of assignments) {
      if (!item.dateKey) continue;
      if (!map[item.dateKey]) {
        map[item.dateKey] = [];
      }
      map[item.dateKey].push(item);
    }
    return map;
  }, [assignments]);

  const getAssignmentsForDate = useCallback(
    (dateKey) => {
      return assignmentsByDate[dateKey] || [];
    },
    [assignmentsByDate]
  );

  /**
   * Saves tasks for one or multiple employees on a given dateKey.
   * Optimistic immediate UI reflection + background Firestore writes.
   */
  const saveAssignments = async ({ dateKey, selectedEmployees, tasksList }) => {
    if (!dateKey) throw new Error("Date key is required");
    if (!selectedEmployees || selectedEmployees.length === 0) {
      throw new Error("Please select at least one employee");
    }

    const validTaskTexts = (tasksList || [])
      .map((t) => (typeof t === "string" ? t.trim() : t.text?.trim()))
      .filter((t) => t && t.length > 0);

    if (validTaskTexts.length === 0) {
      throw new Error("Please enter at least one task or note");
    }

    const dateAssignments = assignments.filter((a) => a.dateKey === dateKey);

    // Prepare optimistic updates
    const writeOperations = [];
    const updatedAssignments = [...assignments];

    for (const employee of selectedEmployees) {
      const existingIndex = updatedAssignments.findIndex(
        (a) => a.dateKey === dateKey && a.employeeId === employee.id
      );

      const newTasksObjects = validTaskTexts.map((text) => ({
        id: generateId(),
        text,
        completed: false,
      }));

      if (existingIndex !== -1) {
        const existing = updatedAssignments[existingIndex];
        const mergedTasks = [...(existing.tasks || []), ...newTasksObjects];
        const updatedDoc = {
          ...existing,
          tasks: mergedTasks,
          employeeName: employee.name || existing.employeeName,
          employeePhone: employee.phone || existing.employeePhone,
          employeeRole: employee.role || existing.employeeRole || "Team Member",
          headId: employee.headId || existing.headId || null,
          headName: employee.headName || existing.headName || null,
          isHead: !!employee.isHead,
          updatedAt: new Date().toISOString(),
        };

        updatedAssignments[existingIndex] = updatedDoc;

        writeOperations.push(async () => {
          const ref = doc(db, "assignments", existing.id);
          await updateDoc(ref, {
            tasks: mergedTasks,
            employeeName: employee.name || existing.employeeName,
            employeePhone: employee.phone || existing.employeePhone,
            employeeRole: employee.role || existing.employeeRole || "Team Member",
            headId: employee.headId || existing.headId || null,
            headName: employee.headName || existing.headName || null,
            isHead: !!employee.isHead,
            updatedAt: serverTimestamp(),
          });
        });
      } else {
        const newRef = doc(collection(db, "assignments"));
        const newDoc = {
          id: newRef.id,
          dateKey,
          date: dateKey,
          employeeId: employee.id,
          employeeName: employee.name,
          employeeRole: employee.role || "Team Member",
          employeePhone: employee.phone || "",
          headId: employee.headId || null,
          headName: employee.headName || null,
          isHead: !!employee.isHead,
          tasks: newTasksObjects,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updatedAssignments.push(newDoc);

        writeOperations.push(async () => {
          await setDoc(newRef, {
            dateKey,
            date: dateKey,
            employeeId: employee.id,
            employeeName: employee.name,
            employeeRole: employee.role || "Team Member",
            employeePhone: employee.phone || "",
            headId: employee.headId || null,
            headName: employee.headName || null,
            isHead: !!employee.isHead,
            tasks: newTasksObjects,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
      }
    }

    // 1. Instant local optimistic update (0ms UI lag)
    setAssignments(updatedAssignments);

    // 2. Perform background writes
    await Promise.all(writeOperations.map((op) => op()));
  };

  /**
   * Toggle task completion status
   */
  const toggleTaskComplete = async (assignmentId, taskId) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    const updatedTasks = (assignment.tasks || []).map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    // Instant optimistic update
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId ? { ...a, tasks: updatedTasks } : a
      )
    );

    const ref = doc(db, "assignments", assignmentId);
    await updateDoc(ref, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp(),
    });
  };

  /**
   * Update task text
   */
  const updateTaskText = async (assignmentId, taskId, newText) => {
    if (!newText?.trim()) throw new Error("Task text cannot be empty");
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    const updatedTasks = (assignment.tasks || []).map((t) => {
      if (t.id === taskId) {
        return { ...t, text: newText.trim() };
      }
      return t;
    });

    // Instant optimistic update
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId ? { ...a, tasks: updatedTasks } : a
      )
    );

    const ref = doc(db, "assignments", assignmentId);
    await updateDoc(ref, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp(),
    });
  };

  /**
   * Add a single new task to an existing assignment
   */
  const addTaskToAssignment = async (assignmentId, text) => {
    if (!text?.trim()) throw new Error("Task text cannot be empty");
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    const newTask = {
      id: generateId(),
      text: text.trim(),
      completed: false,
    };

    const updatedTasks = [...(assignment.tasks || []), newTask];

    // Instant optimistic update
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId ? { ...a, tasks: updatedTasks } : a
      )
    );

    const ref = doc(db, "assignments", assignmentId);
    await updateDoc(ref, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp(),
    });
  };

  /**
   * Delete an individual task from an assignment.
   */
  const deleteTaskFromAssignment = async (assignmentId, taskId) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    const updatedTasks = (assignment.tasks || []).filter((t) => t.id !== taskId);

    // Instant optimistic update
    setAssignments((prev) => {
      if (updatedTasks.length === 0) {
        return prev.filter((a) => a.id !== assignmentId);
      }
      return prev.map((a) =>
        a.id === assignmentId ? { ...a, tasks: updatedTasks } : a
      );
    });

    const ref = doc(db, "assignments", assignmentId);
    if (updatedTasks.length === 0) {
      await deleteDoc(ref);
    } else {
      await updateDoc(ref, {
        tasks: updatedTasks,
        updatedAt: serverTimestamp(),
      });
    }
  };

  /**
   * Delete an entire assignment for an employee on a date
   */
  const deleteAssignment = async (assignmentId) => {
    if (!assignmentId) throw new Error("Missing assignment ID");

    // Instant optimistic removal
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));

    const ref = doc(db, "assignments", assignmentId);
    await deleteDoc(ref);
  };

  return {
    assignments,
    assignmentsByDate,
    loading,
    error,
    getAssignmentsForDate,
    saveAssignments,
    toggleTaskComplete,
    updateTaskText,
    addTaskToAssignment,
    deleteTaskFromAssignment,
    deleteAssignment,
  };
}
