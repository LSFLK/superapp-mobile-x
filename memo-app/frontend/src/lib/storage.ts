/**
 * Generic storage utility with Time-To-Live (TTL) support.
 * Handles persistence via React Native Bridge with fallback to localStorage.
 * Automatically cleans up expired items and migrates legacy data.
 */

export interface TTLItem<T> {
    data: T;
    timestamp: number;
}

export class TTLStorage<T> {
    private key: string;
    private ttlMs: number;

    constructor(key: string, ttlDays: number = 30) {
        this.key = key;
        this.ttlMs = ttlDays * 24 * 60 * 60 * 1000;
    }

    /**
     * Get raw string value from storage (Bridge or localStorage)
     */
    private async getRaw(): Promise<string | null> {
        if (window.nativebridge?.requestGetLocalData) {
            const result = await window.nativebridge.requestGetLocalData({ key: this.key });
            return result.value || null;
        }
        // Fallback
        return localStorage.getItem(this.key);
    }

    /**
     * Save raw string value to storage (Bridge or localStorage)
     */
    private async saveRaw(value: string): Promise<void> {
        if (window.nativebridge?.requestSaveLocalData) {
            await window.nativebridge.requestSaveLocalData({ key: this.key, value });
        } else {
            // Fallback
            try {
                localStorage.setItem(this.key, value);
            } catch (e) {
                console.warn(`Failed to save to localStorage (${this.key}):`, e);
            }
        }
    }

    /**
     * Get valid (non-expired) items.
     * Automatically cleans up expired items and migrates legacy formats.
     */
    async get(): Promise<T[]> {
        const raw = await this.getRaw();
        if (!raw) return [];

        try {
            const parsed = JSON.parse(raw);
            const now = Date.now();

            // Handle legacy format: Array of T (no timestamps)
            // We detect this by checking if the first item is NOT an object with a timestamp property
            // or if it matches the expected data type T directly.
            // For simplicity, we assume if it's an array and items don't look like TTLItems, it's legacy.
            if (Array.isArray(parsed) && parsed.length > 0) {
                const firstItem = parsed[0];
                const isLegacy = !firstItem || typeof firstItem !== 'object' || !('timestamp' in firstItem) || !('data' in firstItem);

                if (isLegacy) {
                    // Migrate: Wrap existing items with current timestamp
                    const migrated: TTLItem<T>[] = parsed.map((data: T) => ({ data, timestamp: now }));
                    await this.saveRaw(JSON.stringify(migrated));
                    return parsed;
                }
            }

            // Handle TTL format: Array of TTLItem<T>
            if (Array.isArray(parsed)) {
                const validItems = (parsed as TTLItem<T>[]).filter(item => {
                    return item.timestamp && (now - item.timestamp < this.ttlMs);
                });

                // If we filtered out items (expired), save the cleaned list
                if (validItems.length !== parsed.length) {
                    await this.saveRaw(JSON.stringify(validItems));
                }

                return validItems.map(item => item.data);
            }

            return [];
        } catch (error) {
            console.error(`Failed to parse storage for ${this.key}:`, error);
            return [];
        }
    }

    /**
     * Add an item to storage.
     * Preserves timestamps of existing items.
     * @param item The item to add
     * @param uniqueKey Optional key to check for uniqueness (e.g., 'id' for objects). If not provided, uses JSON string comparison.
     */
    async add(item: T, uniqueKey?: keyof T): Promise<void> {
        const raw = await this.getRaw();
        let items: TTLItem<T>[] = [];
        const now = Date.now();

        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                // Handle legacy read during add
                if (Array.isArray(parsed)) {
                    if (parsed.length > 0) {
                        const firstItem = parsed[0];
                        const isLegacy = !firstItem || typeof firstItem !== 'object' || !('timestamp' in firstItem) || !('data' in firstItem);
                        if (isLegacy) {
                            items = parsed.map((data: T) => ({ data, timestamp: now }));
                        } else {
                            items = parsed;
                        }
                    } else {
                        items = parsed;
                    }
                }
            } catch (e) {
                // Ignore parse error, start fresh
            }
        }

        // Check if item already exists
        const exists = items.some(existing => {
            if (uniqueKey && typeof item === 'object' && item !== null) {
                return existing.data[uniqueKey] === item[uniqueKey];
            }
            // Default to simple equality or JSON string comparison for primitives/simple objects
            return existing.data === item || JSON.stringify(existing.data) === JSON.stringify(item);
        });

        if (!exists) {
            items.push({ data: item, timestamp: now });
            await this.saveRaw(JSON.stringify(items));
        }
    }
}
