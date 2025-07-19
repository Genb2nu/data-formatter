class SchemaAnalyzer {
    static analyzeSchema(data, format) {
        try {
            if (format === 'json') {
                return this.analyzeJSONSchema(data);
            } else if (format === 'xml') {
                return this.analyzeXMLSchema(data);
            } else {
                throw new Error('Unsupported format for schema analysis');
            }
        } catch (error) {
            throw new Error(`Schema analysis failed: ${error.message}`);
        }
    }

    static analyzeJSONSchema(data) {
        const schema = {
            tables: [],
            relationships: [],
            metadata: {
                totalTables: 0,
                totalFields: 0,
                analyzedAt: new Date().toISOString()
            }
        };

        this.processJSONObject(data, schema, 'root');
        
        schema.metadata.totalTables = schema.tables.length;
        schema.metadata.totalFields = schema.tables.reduce((sum, table) => sum + table.fields.length, 0);
        
        return schema;
    }

    static analyzeXMLSchema(data) {
        const schema = {
            tables: [],
            relationships: [],
            metadata: {
                totalTables: 0,
                totalFields: 0,
                analyzedAt: new Date().toISOString()
            }
        };

        this.processXMLObject(data, schema, 'root');
        
        schema.metadata.totalTables = schema.tables.length;
        schema.metadata.totalFields = schema.tables.reduce((sum, table) => sum + table.fields.length, 0);
        
        return schema;
    }

    static processJSONObject(obj, schema, tableName, parentTable = null) {
        if (!obj || typeof obj !== 'object') return;

        if (Array.isArray(obj) && obj.length > 0) {
            const sampleItem = obj[0];
            if (typeof sampleItem === 'object' && !Array.isArray(sampleItem)) {
                this.createTableFromObject(sampleItem, schema, tableName, parentTable);
                
                for (let i = 1; i < Math.min(obj.length, 10); i++) {
                    this.mergeFieldsFromObject(obj[i], schema, tableName);
                }
            }
        } else if (typeof obj === 'object') {
            this.createTableFromObject(obj, schema, tableName, parentTable);
        }
    }

    static processXMLObject(obj, schema, tableName, parentTable = null) {
        if (!obj || typeof obj !== 'object') return;

        if (Array.isArray(obj) && obj.length > 0) {
            const sampleItem = obj[0];
            if (typeof sampleItem === 'object') {
                this.createTableFromXMLObject(sampleItem, schema, tableName, parentTable);
                
                for (let i = 1; i < Math.min(obj.length, 10); i++) {
                    this.mergeFieldsFromXMLObject(obj[i], schema, tableName);
                }
            }
        } else if (typeof obj === 'object') {
            this.createTableFromXMLObject(obj, schema, tableName, parentTable);
        }
    }

    static createTableFromObject(obj, schema, tableName, parentTable = null) {
        const existingTable = schema.tables.find(t => t.name === tableName);
        if (existingTable) return;

        const table = {
            name: tableName,
            fields: [],
            primaryKey: this.guessPrimaryKey(obj),
            foreignKeys: [],
            indexes: [],
            type: 'table'
        };

        for (const [key, value] of Object.entries(obj)) {
            const field = this.analyzeField(key, value, tableName);
            table.fields.push(field);

            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                const childTableName = this.pluralToSingular(key);
                this.processJSONObject(value, schema, childTableName, tableName);
                
                this.addRelationship(schema, tableName, childTableName, 'one-to-many');
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const childTableName = key;
                this.processJSONObject(value, schema, childTableName, tableName);
                
                this.addRelationship(schema, tableName, childTableName, 'one-to-one');
            }
        }

        schema.tables.push(table);
    }

    static createTableFromXMLObject(obj, schema, tableName, parentTable = null) {
        const existingTable = schema.tables.find(t => t.name === tableName);
        if (existingTable) return;

        const table = {
            name: tableName,
            fields: [],
            primaryKey: null,
            foreignKeys: [],
            indexes: [],
            type: 'table'
        };

        for (const [key, value] of Object.entries(obj)) {
            if (key === '@attributes') {
                for (const [attrName, attrValue] of Object.entries(value)) {
                    const field = this.analyzeField(attrName, attrValue, tableName);
                    field.isAttribute = true;
                    table.fields.push(field);
                }
            } else if (key === '#text') {
                const field = this.analyzeField('content', value, tableName);
                field.isTextContent = true;
                table.fields.push(field);
            } else if (Array.isArray(value)) {
                const childTableName = this.pluralToSingular(key);
                this.processXMLObject(value, schema, childTableName, tableName);
                
                this.addRelationship(schema, tableName, childTableName, 'one-to-many');
            } else if (typeof value === 'object' && value !== null) {
                const childTableName = key;
                this.processXMLObject(value, schema, childTableName, tableName);
                
                this.addRelationship(schema, tableName, childTableName, 'one-to-one');
            } else {
                const field = this.analyzeField(key, value, tableName);
                table.fields.push(field);
            }
        }

        table.primaryKey = this.guessPrimaryKey(obj);
        schema.tables.push(table);
    }

    static analyzeField(name, value, tableName) {
        const field = {
            name: this.sanitizeFieldName(name),
            type: this.inferDataType(value),
            nullable: value === null || value === undefined,
            defaultValue: null,
            constraints: [],
            examples: [value]
        };

        if (field.type === 'string' && typeof value === 'string') {
            field.maxLength = value.length;
            
            if (this.isEmail(value)) {
                field.format = 'email';
            } else if (this.isUrl(value)) {
                field.format = 'url';
            } else if (this.isDate(value)) {
                field.format = 'date';
                field.type = 'datetime';
            }
        }

        if (this.isPrimaryKeyCandidate(name)) {
            field.isPrimaryKey = true;
        }

        if (this.isForeignKeyCandidate(name, tableName)) {
            field.isForeignKey = true;
        }

        return field;
    }

    static inferDataType(value) {
        if (value === null || value === undefined) {
            return 'unknown';
        }

        if (typeof value === 'boolean') {
            return 'boolean';
        }

        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'integer' : 'decimal';
        }

        if (typeof value === 'string') {
            if (this.isDate(value)) {
                return 'datetime';
            }
            if (this.isEmail(value)) {
                return 'email';
            }
            if (this.isUrl(value)) {
                return 'url';
            }
            if (/^\d+$/.test(value)) {
                return 'string'; // Keep as string if it's a string of digits
            }
            return 'string';
        }

        if (Array.isArray(value)) {
            return 'array';
        }

        if (typeof value === 'object') {
            return 'object';
        }

        return 'unknown';
    }

    static isEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof value === 'string' && emailRegex.test(value);
    }

    static isUrl(value) {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    static isDate(value) {
        if (typeof value !== 'string') return false;
        
        const date = new Date(value);
        return !isNaN(date.getTime()) && value.includes('-');
    }

    static isPrimaryKeyCandidate(fieldName) {
        const pkPatterns = ['id', '_id', 'pk', 'key', 'uuid'];
        const lowerName = fieldName.toLowerCase();
        return pkPatterns.some(pattern => lowerName.includes(pattern));
    }

    static isForeignKeyCandidate(fieldName, tableName) {
        const lowerName = fieldName.toLowerCase();
        return lowerName.endsWith('_id') || lowerName.endsWith('id') && lowerName !== 'id';
    }

    static guessPrimaryKey(obj) {
        for (const key of Object.keys(obj)) {
            if (this.isPrimaryKeyCandidate(key)) {
                return key;
            }
        }
        return null;
    }

    static sanitizeFieldName(name) {
        return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    }

    static pluralToSingular(word) {
        if (word.endsWith('ies')) {
            return word.slice(0, -3) + 'y';
        }
        if (word.endsWith('es')) {
            return word.slice(0, -2);
        }
        if (word.endsWith('s')) {
            return word.slice(0, -1);
        }
        return word;
    }

    static addRelationship(schema, parentTable, childTable, type) {
        const relationship = {
            parentTable,
            childTable,
            type,
            foreignKey: `${parentTable}_id`,
            relationshipType: this.determineRelationshipType(type, schema, parentTable, childTable)
        };

        const exists = schema.relationships.some(rel => 
            rel.parentTable === parentTable && 
            rel.childTable === childTable
        );

        if (!exists) {
            schema.relationships.push(relationship);
        }
    }

    static determineRelationshipType(baseType, schema, parentTable, childTable) {
        if (baseType === 'one-to-many') {
            const reverseExists = schema.relationships.some(rel => 
                rel.parentTable === childTable && 
                rel.childTable === parentTable
            );
            
            if (reverseExists) {
                return 'many-to-many';
            }
            return 'one-to-many';
        }
        
        if (baseType === 'one-to-one') {
            return 'one-to-one';
        }
        
        return baseType;
    }

    static mergeFieldsFromObject(obj, schema, tableName) {
        const table = schema.tables.find(t => t.name === tableName);
        if (!table) return;

        for (const [key, value] of Object.entries(obj)) {
            const existingField = table.fields.find(f => f.name === this.sanitizeFieldName(key));
            
            if (existingField) {
                const newType = this.inferDataType(value);
                if (newType !== existingField.type && newType !== 'unknown') {
                    existingField.type = 'mixed';
                }
                
                if (value !== null && value !== undefined) {
                    existingField.nullable = false;
                }
                
                if (existingField.examples.length < 5) {
                    existingField.examples.push(value);
                }
                
                if (existingField.type === 'string' && typeof value === 'string') {
                    existingField.maxLength = Math.max(existingField.maxLength || 0, value.length);
                }
            } else {
                const field = this.analyzeField(key, value, tableName);
                table.fields.push(field);
            }
        }
    }

    static mergeFieldsFromXMLObject(obj, schema, tableName) {
        this.mergeFieldsFromObject(obj, schema, tableName);
    }

    static generateSQLDDL(schema) {
        let sql = '-- Generated Database Schema\n\n';
        
        for (const table of schema.tables) {
            sql += `CREATE TABLE ${table.name} (\n`;
            
            const fieldDefinitions = table.fields.map(field => {
                let definition = `  ${field.name} ${this.getSQLType(field)}`;
                
                if (field.isPrimaryKey) {
                    definition += ' PRIMARY KEY';
                }
                
                if (!field.nullable) {
                    definition += ' NOT NULL';
                }
                
                if (field.defaultValue !== null) {
                    definition += ` DEFAULT ${field.defaultValue}`;
                }
                
                return definition;
            });
            
            sql += fieldDefinitions.join(',\n');
            sql += '\n);\n\n';
        }
        
        for (const rel of schema.relationships) {
            sql += `-- Relationship: ${rel.parentTable} -> ${rel.childTable} (${rel.type})\n`;
            sql += `ALTER TABLE ${rel.childTable} ADD CONSTRAINT fk_${rel.childTable}_${rel.parentTable}\n`;
            sql += `  FOREIGN KEY (${rel.foreignKey}) REFERENCES ${rel.parentTable}(id);\n\n`;
        }
        
        return sql;
    }

    static getSQLType(field) {
        switch (field.type) {
            case 'integer':
                return 'INTEGER';
            case 'decimal':
                return 'DECIMAL(10,2)';
            case 'boolean':
                return 'BOOLEAN';
            case 'datetime':
                return 'TIMESTAMP';
            case 'email':
            case 'url':
            case 'string':
                const maxLength = field.maxLength ? Math.min(field.maxLength * 2, 255) : 255;
                return `VARCHAR(${maxLength})`;
            case 'array':
            case 'object':
                return 'JSON';
            default:
                return 'TEXT';
        }
    }
}