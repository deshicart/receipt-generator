// Storage manager for IndexedDB - handles drafts, templates, and history
class StorageManager {
    constructor() {
        this.dbName = 'ReceiptGeneratorDB';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('drafts')) {
                    const draftStore = db.createObjectStore('drafts', { keyPath: 'id', autoIncrement: true });
                    draftStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains('templates')) {
                    const templateStore = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
                    templateStore.createIndex('name', 'name', { unique: false });
                }

                if (!db.objectStoreNames.contains('history')) {
                    const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                console.log('Database setup complete');
            };
        });
    }

    // Generic save method
    async save(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.add(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Generic update method
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.put(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Generic get all method
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Generic get by id method
    async getById(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Generic delete method
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Save draft
    async saveDraft(data) {
        const draft = {
            ...data,
            timestamp: new Date().toISOString(),
            type: 'draft'
        };
        return await this.save('drafts', draft);
    }

    // Get all drafts
    async getDrafts() {
        const drafts = await this.getAll('drafts');
        return drafts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Update draft
    async updateDraft(data) {
        const draft = {
            ...data,
            timestamp: new Date().toISOString(),
            type: 'draft'
        };
        return await this.update('drafts', draft);
    }

    // Delete draft
    async deleteDraft(id) {
        return await this.delete('drafts', id);
    }

    // Save template
    async saveTemplate(data, name) {
        const template = {
            ...data,
            name: name,
            timestamp: new Date().toISOString(),
            type: 'template'
        };
        return await this.save('templates', template);
    }

    // Get all templates
    async getTemplates() {
        const templates = await this.getAll('templates');
        return templates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Delete template
    async deleteTemplate(id) {
        return await this.delete('templates', id);
    }

    // Save to history
    async saveToHistory(data) {
        const history = {
            ...data,
            timestamp: new Date().toISOString(),
            type: 'history'
        };
        return await this.save('history', history);
    }

    // Get all history
    async getHistory() {
        const history = await this.getAll('history');
        return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Delete history item
    async deleteHistory(id) {
        return await this.delete('history', id);
    }

    // Clear all data from a store
    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

// Fallback to localStorage if IndexedDB is not available
class LocalStorageManager {
    constructor() {
        this.prefix = 'receipt_';
    }

    // Save to localStorage
    save(key, data) {
        try {
            const items = this.getAll(key);
            const item = {
                ...data,
                id: Date.now(),
                timestamp: new Date().toISOString()
            };
            items.push(item);
            localStorage.setItem(this.prefix + key, JSON.stringify(items));
            return Promise.resolve(item.id);
        } catch (error) {
            console.error('LocalStorage save error:', error);
            return Promise.reject(error);
        }
    }

    // Update in localStorage
    update(key, data) {
        try {
            const items = this.getAll(key);
            const index = items.findIndex(item => item.id === data.id);
            if (index !== -1) {
                items[index] = {
                    ...data,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(this.prefix + key, JSON.stringify(items));
            }
            return Promise.resolve(data.id);
        } catch (error) {
            console.error('LocalStorage update error:', error);
            return Promise.reject(error);
        }
    }

    // Get all from localStorage
    getAll(key) {
        try {
            const items = localStorage.getItem(this.prefix + key);
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error('LocalStorage get error:', error);
            return [];
        }
    }

    // Get by id from localStorage
    getById(key, id) {
        try {
            const items = this.getAll(key);
            return Promise.resolve(items.find(item => item.id === id));
        } catch (error) {
            console.error('LocalStorage getById error:', error);
            return Promise.reject(error);
        }
    }

    // Delete from localStorage
    delete(key, id) {
        try {
            const items = this.getAll(key);
            const filtered = items.filter(item => item.id !== id);
            localStorage.setItem(this.prefix + key, JSON.stringify(filtered));
            return Promise.resolve();
        } catch (error) {
            console.error('LocalStorage delete error:', error);
            return Promise.reject(error);
        }
    }

    // Draft methods
    async saveDraft(data) {
        return this.save('drafts', { ...data, type: 'draft' });
    }

    async getDrafts() {
        return this.getAll('drafts').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async updateDraft(data) {
        return this.update('drafts', data);
    }

    async deleteDraft(id) {
        return this.delete('drafts', id);
    }

    // Template methods
    async saveTemplate(data, name) {
        return this.save('templates', { ...data, name, type: 'template' });
    }

    async getTemplates() {
        return this.getAll('templates').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async deleteTemplate(id) {
        return this.delete('templates', id);
    }

    // History methods
    async saveToHistory(data) {
        return this.save('history', { ...data, type: 'history' });
    }

    async getHistory() {
        return this.getAll('history').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async deleteHistory(id) {
        return this.delete('history', id);
    }

    // Clear store
    async clearStore(storeName) {
        try {
            localStorage.removeItem(this.prefix + storeName);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

// Initialize the appropriate storage manager
let storage;

// Try to use IndexedDB, fallback to localStorage
if (window.indexedDB) {
    storage = new StorageManager();
} else {
    console.warn('IndexedDB not available, using localStorage');
    storage = new LocalStorageManager();
}
