class DataParser {
    static parseData(inputData) {
        if (!inputData || typeof inputData !== 'string') {
            throw new Error('Invalid input data');
        }

        const trimmedData = inputData.trim();
        
        if (trimmedData.startsWith('{') || trimmedData.startsWith('[')) {
            return this.parseJSON(trimmedData);
        }
        
        if (trimmedData.startsWith('<') || trimmedData.includes('<?xml')) {
            return this.parseXML(trimmedData);
        }
        
        throw new Error('Unrecognized data format. Please provide valid JSON or XML data.');
    }

    static parseJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return { data, format: 'json' };
        } catch (error) {
            throw new Error(`Invalid JSON: ${error.message}`);
        }
    }

    static parseXML(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('Invalid XML structure');
            }
            
            const data = this.xmlToObject(xmlDoc.documentElement);
            return { data, format: 'xml' };
        } catch (error) {
            throw new Error(`Invalid XML: ${error.message}`);
        }
    }

    static xmlToObject(xmlNode) {
        const result = {};
        
        if (xmlNode.attributes && xmlNode.attributes.length > 0) {
            result['@attributes'] = {};
            for (let attr of xmlNode.attributes) {
                result['@attributes'][attr.name] = attr.value;
            }
        }
        
        if (xmlNode.childNodes && xmlNode.childNodes.length > 0) {
            for (let child of xmlNode.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent.trim();
                    if (text) {
                        if (Object.keys(result).length === 0) {
                            return this.convertValue(text);
                        } else {
                            result['#text'] = this.convertValue(text);
                        }
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const childName = child.nodeName;
                    const childValue = this.xmlToObject(child);
                    
                    if (result[childName]) {
                        if (!Array.isArray(result[childName])) {
                            result[childName] = [result[childName]];
                        }
                        result[childName].push(childValue);
                    } else {
                        result[childName] = childValue;
                    }
                }
            }
        }
        
        return Object.keys(result).length === 0 ? '' : result;
    }

    static convertValue(value) {
        if (typeof value !== 'string') return value;
        
        value = value.trim();
        
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value === 'null') return null;
        if (value === '') return '';
        
        if (/^\d+$/.test(value)) {
            return parseInt(value, 10);
        }
        
        if (/^\d*\.\d+$/.test(value)) {
            return parseFloat(value);
        }
        
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return value;
        }
        
        return value;
    }

    static formatData(data, format) {
        try {
            if (format === 'json') {
                return JSON.stringify(data, null, 2);
            } else if (format === 'xml') {
                return this.formatXML(this.objectToXML(data));
            }
            throw new Error('Unsupported format for formatting');
        } catch (error) {
            throw new Error(`Formatting failed: ${error.message}`);
        }
    }

    static minifyData(data, format) {
        try {
            if (format === 'json') {
                return JSON.stringify(data);
            } else if (format === 'xml') {
                return this.objectToXML(data).replace(/>\s+</g, '><').trim();
            }
            throw new Error('Unsupported format for minification');
        } catch (error) {
            throw new Error(`Minification failed: ${error.message}`);
        }
    }

    static objectToXML(obj, rootName = 'root') {
        if (typeof obj !== 'object' || obj === null) {
            return `<${rootName}>${this.escapeXML(String(obj))}</${rootName}>`;
        }

        let xml = '';
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === '@attributes') continue;
                if (key === '#text') continue;
                
                const value = obj[key];
                
                if (Array.isArray(value)) {
                    for (const item of value) {
                        xml += this.objectToXML(item, key);
                    }
                } else if (typeof value === 'object' && value !== null) {
                    xml += `<${key}`;
                    
                    if (value['@attributes']) {
                        for (const attr in value['@attributes']) {
                            xml += ` ${attr}="${this.escapeXML(value['@attributes'][attr])}"`;
                        }
                    }
                    
                    if (value['#text'] !== undefined) {
                        xml += `>${this.escapeXML(value['#text'])}</${key}>`;
                    } else {
                        xml += `>${this.objectToXML(value).replace(/<\/?root>/g, '')}</${key}>`;
                    }
                } else {
                    xml += `<${key}>${this.escapeXML(String(value))}</${key}>`;
                }
            }
        }
        
        if (rootName === 'root') {
            return xml;
        }
        
        return xml;
    }

    static escapeXML(text) {
        return text.replace(/[<>&'"]/g, function(char) {
            switch (char) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&#39;';
                case '"': return '&quot;';
                default: return char;
            }
        });
    }

    static formatXML(xmlString) {
        let formatted = '';
        let indent = 0;
        const tab = '  ';
        
        xmlString.split(/>\s*</).forEach(function(node) {
            if (node.match(/^\/\w/)) {
                indent--;
            }
            
            formatted += tab.repeat(indent) + '<' + node + '>\n';
            
            if (node.match(/^<?\w[^>]*[^\/]$/)) {
                indent++;
            }
        });
        
        return formatted.substring(1, formatted.length - 2);
    }

    static validateData(data, format) {
        try {
            if (format === 'json') {
                JSON.parse(typeof data === 'string' ? data : JSON.stringify(data));
                return { valid: true };
            } else if (format === 'xml') {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, 'text/xml');
                const parseError = xmlDoc.querySelector('parsererror');
                
                if (parseError) {
                    return { valid: false, error: 'Invalid XML structure' };
                }
                return { valid: true };
            }
            return { valid: false, error: 'Unsupported format' };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    static getDataStats(data, format) {
        try {
            const stats = {
                format: format,
                size: 0,
                depth: 0,
                elements: 0,
                arrays: 0,
                objects: 0,
                primitives: 0
            };

            if (format === 'json') {
                const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
                stats.size = jsonString.length;
                this.analyzeJSONStructure(data, stats);
            } else if (format === 'xml') {
                stats.size = data.length;
                this.analyzeXMLStructure(data, stats);
            }

            return stats;
        } catch (error) {
            throw new Error(`Stats analysis failed: ${error.message}`);
        }
    }

    static analyzeJSONStructure(obj, stats, depth = 0) {
        stats.depth = Math.max(stats.depth, depth);
        
        if (Array.isArray(obj)) {
            stats.arrays++;
            stats.elements++;
            obj.forEach(item => this.analyzeJSONStructure(item, stats, depth + 1));
        } else if (typeof obj === 'object' && obj !== null) {
            stats.objects++;
            stats.elements++;
            Object.values(obj).forEach(value => this.analyzeJSONStructure(value, stats, depth + 1));
        } else {
            stats.primitives++;
            stats.elements++;
        }
    }

    static analyzeXMLStructure(obj, stats, depth = 0) {
        stats.depth = Math.max(stats.depth, depth);
        stats.elements++;
        
        if (typeof obj === 'object' && obj !== null) {
            if (Array.isArray(obj)) {
                stats.arrays++;
                obj.forEach(item => this.analyzeXMLStructure(item, stats, depth + 1));
            } else {
                stats.objects++;
                Object.values(obj).forEach(value => {
                    if (typeof value !== 'string' || value.trim() !== '') {
                        this.analyzeXMLStructure(value, stats, depth + 1);
                    }
                });
            }
        } else {
            stats.primitives++;
        }
    }
}