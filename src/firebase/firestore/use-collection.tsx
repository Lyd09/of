"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Query,
  DocumentData,
  FirestoreError,
  QueryConstraint,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseCollectionOptions {
  constraints?: QueryConstraint[];
}

export function useCollection<T extends DocumentData>(
  collectionRef: Query,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedConstraints = useMemo(() => options?.constraints || [], [options?.constraints]);

  useEffect(() => {
    if (!collectionRef) {
      setIsLoading(false);
      return;
    }

    const finalQuery = query(collectionRef, ...memoizedConstraints);
    
    const unsubscribe = onSnapshot(
      finalQuery,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error in useCollection:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionRef, memoizedConstraints]);

  return { data, isLoading, error };
}
