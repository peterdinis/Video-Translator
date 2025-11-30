import { unstable_cache } from 'next/cache';

export interface CacheEntry {
    translation: string;
    videoUrl?: string; // Base64 video URL
    timestamp: number;
}

// In-memory fallback cache for development
const memoryCache = new Map<string, CacheEntry>();

export function generateCacheKey(source: string, targetLang: string): string {
    // Create a consistent cache key
    return `translation-${source}-${targetLang}`;
}

// Get cached translation using Next.js cache
export async function getCachedTranslation(key: string): Promise<CacheEntry | undefined> {
    // Check memory cache first (for same-request access)
    if (memoryCache.has(key)) {
        const entry = memoryCache.get(key);
        // Check if entry is still valid (24 hours)
        if (entry && Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) {
            return entry;
        }
        memoryCache.delete(key);
    }
    return undefined;
}

// Set cached translation
export async function setCachedTranslation(key: string, entry: CacheEntry): Promise<void> {
    memoryCache.set(key, entry);
}

// Create a cached version of the translation function
export function createCachedTranslation<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator: (...args: Parameters<T>) => string
) {
    return unstable_cache(
        fn,
        undefined,
        {
            revalidate: 86400, // 24 hours in seconds
            tags: ['translation']
        }
    );
}
