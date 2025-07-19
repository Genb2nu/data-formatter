class DataConverter {
    static convert(data, sourceFormat, targetFormat) {
        if (sourceFormat === targetFormat) {
            throw new Error('Source and target formats cannot be the same');
        }

        try {
            if (sourceFormat === 'json' && targetFormat === 'xml') {
                return this.jsonToXml(data);
            } else if (sourceFormat === 'xml' && targetFormat === 'json') {
                return this.xmlToJson(data);
            } else {
                throw new Error(`Conversion from ${sourceFormat} to ${targetFormat} is not supported`);
            }
        } catch (error) {
            throw new Error(`Conversion failed: ${error.message}`);
        }
    }

    static jsonToXml(jsonData, rootName = 'root') {
        try {
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += this.objectToXml(jsonData, rootName, 0);
            return this.formatXml(xml);
        } catch (error) {
            throw new Error(`JSON to XML conversion failed: ${error.message}`);
        }
    }

    static xmlToJson(xmlData) {
        try {
            return JSON.stringify(xmlData, null, 2);
        } catch (error) {
            throw new Error(`XML to JSON conversion failed: ${error.message}`);
        }
    }

    static objectToXml(obj, nodeName = 'item', level = 0) {
        nodeName = this.sanitizeXmlNodeName(nodeName);
        
        if (obj === null || obj === undefined) {
            return `<${nodeName} xsi:nil="true" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"></${nodeName}>`;
        }

        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
            return `<${nodeName}>${this.escapeXml(String(obj))}</${nodeName}>`;
        }

        if (Array.isArray(obj)) {
            let xml = `<${nodeName}>`;
            obj.forEach((item, index) => {
                const itemName = 'item';
                xml += this.objectToXml(item, itemName, level + 1);
            });
            xml += `</${nodeName}>`;
            return xml;
        }

        if (typeof obj === 'object') {
            let xml = `<${nodeName}>`;
            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    const cleanKey = this.sanitizeXmlNodeName(key);
                    
                    if (Array.isArray(value)) {
                        xml += `<${cleanKey}>`;
                        value.forEach(item => {
                            xml += this.objectToXml(item, 'item', level + 2);
                        });
                        xml += `</${cleanKey}>`;
                    } else {
                        xml += this.objectToXml(value, cleanKey, level + 1);
                    }
                }
            }
            
            xml += `</${nodeName}>`;
            return xml;
        }

        return `<${nodeName}>${this.escapeXml(String(obj))}</${nodeName}>`;
    }

    static sanitizeXmlNodeName(name) {
        if (typeof name !== 'string') {
            name = String(name);
        }
        
        name = name.replace(/[^a-zA-Z0-9_-]/g, '_');
        
        if (/^[0-9]/.test(name)) {
            name = '_' + name;
        }
        
        return name || 'node';
    }

    static escapeXml(text) {
        if (typeof text !== 'string') {
            text = String(text);
        }
        
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    static formatXml(xml) {
        let formatted = '';
        let indent = 0;
        const tab = '  ';
        
        // Split on closing tags to get proper structure
        const parts = xml.split(/(<\/[^>]+>)/);
        let buffer = '';
        
        for (let part of parts) {
            if (part.includes('</')) {
                // This is a closing tag
                indent = Math.max(0, indent - 1);
                formatted += buffer + '\n' + tab.repeat(indent) + part + '\n';
                buffer = '';
            } else if (part.trim()) {
                // This contains opening tags and content
                const openTags = part.match(/<[^\/][^>]*>/g) || [];
                const selfClosing = part.match(/<[^>]*\/>/g) || [];
                
                if (part.includes('<?xml')) {
                    formatted += part + '\n';
                } else {
                    buffer += tab.repeat(indent) + part.trim();
                    indent += openTags.length - selfClosing.length;
                }
            }
        }
        
        if (buffer.trim()) {
            formatted += buffer;
        }
        
        // Clean up extra newlines
        return formatted.replace(/\n\s*\n/g, '\n').trim();
    }

    static isNumeric(str) {
        return /^\d+$/.test(str);
    }

    static detectDataStructure(data) {
        const structure = {
            hasArrays: false,
            hasObjects: false,
            hasNestedStructures: false,
            maxDepth: 0,
            totalElements: 0
        };

        this.analyzeStructure(data, structure, 0);
        return structure;
    }

    static analyzeStructure(obj, structure, depth) {
        structure.maxDepth = Math.max(structure.maxDepth, depth);
        structure.totalElements++;

        if (Array.isArray(obj)) {
            structure.hasArrays = true;
            if (depth > 0) structure.hasNestedStructures = true;
            
            obj.forEach(item => {
                this.analyzeStructure(item, structure, depth + 1);
            });
        } else if (typeof obj === 'object' && obj !== null) {
            structure.hasObjects = true;
            if (depth > 0) structure.hasNestedStructures = true;
            
            Object.values(obj).forEach(value => {
                this.analyzeStructure(value, structure, depth + 1);
            });
        }
    }

    static generateConversionSummary(sourceFormat, targetFormat, data) {
        const structure = this.detectDataStructure(data);
        
        return {
            sourceFormat: sourceFormat,
            targetFormat: targetFormat,
            elementCount: structure.totalElements,
            maxDepth: structure.maxDepth,
            hasArrays: structure.hasArrays,
            hasObjects: structure.hasObjects,
            hasNestedStructures: structure.hasNestedStructures,
            conversionNotes: this.getConversionNotes(sourceFormat, targetFormat, structure)
        };
    }

    static getConversionNotes(sourceFormat, targetFormat, structure) {
        const notes = [];

        if (sourceFormat === 'json' && targetFormat === 'xml') {
            if (structure.hasArrays) {
                notes.push('JSON arrays will be converted to repeated XML elements');
            }
            if (structure.hasNestedStructures) {
                notes.push('Nested JSON objects will become nested XML elements');
            }
            notes.push('JSON property names will become XML element names');
        }

        if (sourceFormat === 'xml' && targetFormat === 'json') {
            notes.push('XML elements will become JSON properties');
            notes.push('XML attributes will be preserved in @attributes objects');
            notes.push('Text content will be stored in #text properties when mixed with elements');
        }

        if (structure.maxDepth > 5) {
            notes.push('Deep nesting detected - conversion may result in complex structure');
        }

        return notes;
    }

    static validateConversion(originalData, convertedData, sourceFormat, targetFormat) {
        try {
            if (targetFormat === 'json') {
                JSON.parse(convertedData);
            } else if (targetFormat === 'xml') {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(convertedData, 'text/xml');
                const parseError = xmlDoc.querySelector('parsererror');
                if (parseError) {
                    throw new Error('Generated XML is invalid');
                }
            }

            return { valid: true, message: 'Conversion successful and valid' };
        } catch (error) {
            return { valid: false, message: `Conversion validation failed: ${error.message}` };
        }
    }

    static getConversionPreview(data, sourceFormat, targetFormat, maxLength = 500) {
        try {
            const converted = this.convert(data, sourceFormat, targetFormat);
            
            if (converted.length <= maxLength) {
                return converted;
            }
            
            return converted.substring(0, maxLength) + '\n... (truncated)';
        } catch (error) {
            return `Preview failed: ${error.message}`;
        }
    }
}