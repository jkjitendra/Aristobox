import { useEffect, useState } from 'react';
import { db } from '../lib/database';
import { defaultKits } from '../data/kits';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await db.open();
        
        // Check if kits exist, if not, seed them
        const kitsCount = await db.kits.count();
        if (kitsCount === 0) {
          await db.kits.bulkAdd(defaultKits);
        }
        
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database initialization failed');
      }
    };

    initDatabase();
  }, []);

  return { isReady, error };
};
