class DataFetcher {
    static async fetchFromUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('Invalid URL provided');
        }

        const normalizedUrl = this.normalizeUrl(url);
        
        try {
            const response = await fetch(normalizedUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, application/xml, text/xml, text/plain, */*'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type') || '';
            let data;

            if (contentType.includes('application/json')) {
                data = await response.text();
            } else if (contentType.includes('xml')) {
                data = await response.text();
            } else {
                data = await response.text();
            }

            if (!data || data.trim().length === 0) {
                throw new Error('No data received from the URL');
            }

            return data;

        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Failed to fetch data. This might be due to CORS restrictions or network issues.');
            }
            throw error;
        }
    }

    static normalizeUrl(url) {
        url = url.trim();
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        try {
            new URL(url);
            return url;
        } catch (error) {
            throw new Error('Invalid URL format');
        }
    }

    static async fetchWithProxy(url) {
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
        
        try {
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`Proxy request failed: ${response.status}`);
            }
            
            return await response.text();
            
        } catch (error) {
            throw new Error(`Proxy fetch failed: ${error.message}`);
        }
    }

    static async fetchMultiple(urls) {
        if (!Array.isArray(urls) || urls.length === 0) {
            throw new Error('URLs must be a non-empty array');
        }

        const promises = urls.map(async (url, index) => {
            try {
                const data = await this.fetchFromUrl(url);
                return { success: true, data, url, index };
            } catch (error) {
                return { success: false, error: error.message, url, index };
            }
        });

        return await Promise.all(promises);
    }

    static validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static getUrlInfo(url) {
        try {
            const urlObj = new URL(url);
            return {
                protocol: urlObj.protocol,
                hostname: urlObj.hostname,
                pathname: urlObj.pathname,
                search: urlObj.search,
                hash: urlObj.hash,
                port: urlObj.port
            };
        } catch (error) {
            throw new Error('Invalid URL format');
        }
    }

    static isSafeUrl(url) {
        try {
            const urlObj = new URL(url);
            
            const allowedProtocols = ['http:', 'https:'];
            if (!allowedProtocols.includes(urlObj.protocol)) {
                return false;
            }

            const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
            if (blockedHosts.includes(urlObj.hostname)) {
                return false;
            }

            if (urlObj.hostname.startsWith('192.168.') || 
                urlObj.hostname.startsWith('10.') || 
                urlObj.hostname.startsWith('172.')) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }
}