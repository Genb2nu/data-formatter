class SchemaVisualizer {
    static render(container, schema) {
        if (!schema || !schema.tables || schema.tables.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-title">No Schema to Visualize</div>
                    <div class="empty-state-message">Process some structured data to see the schema visualization</div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        container.className = 'schema-visualization';

        if (typeof d3 !== 'undefined') {
            this.renderD3Visualization(container, schema);
        } else {
            this.renderSimpleVisualization(container, schema);
        }
    }

    static renderSimpleVisualization(container, schema) {
        const vizContainer = document.createElement('div');
        vizContainer.className = 'erd-visualization';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '500');
        svg.setAttribute('viewBox', '0 0 1000 500');
        
        const tables = schema.tables;
        const tableWidth = 220;
        const margin = 80;
        
        // Calculate dynamic table heights based on field count
        const tableHeights = tables.map(table => Math.max(120, 40 + table.fields.length * 18));
        
        const cols = Math.min(3, tables.length);
        const rows = Math.ceil(tables.length / cols);
        
        const totalWidth = cols * (tableWidth + margin) - margin;
        const offsetX = (1000 - totalWidth) / 2;
        const offsetY = 50;

        tables.forEach((table, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = offsetX + col * (tableWidth + margin);
            const y = offsetY + row * 160; // Fixed row spacing
            const tableHeight = tableHeights[index];
            
            this.createERDTable(svg, table, x, y, tableWidth, tableHeight);
        });

        this.drawERDRelationships(svg, schema, tables, tableWidth, tableHeights, margin, offsetX, offsetY, cols);
        
        vizContainer.appendChild(svg);
        container.appendChild(vizContainer);
        
        const legend = this.createERDLegend();
        container.appendChild(legend);
    }

    static createERDTable(svg, table, x, y, width, height) {
        const tableGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tableGroup.setAttribute('transform', `translate(${x}, ${y})`);
        tableGroup.setAttribute('class', 'erd-table');
        
        // Get current theme colors
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const bgColor = isDark ? '#2d2d2d' : 'white';
        const borderColor = isDark ? '#404040' : '#2c3e50';
        const altBgColor = isDark ? '#252525' : '#f8f9fa';
        const textColor = isDark ? '#e0e0e0' : '#2c3e50';
        
        // Table border
        const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        border.setAttribute('width', width);
        border.setAttribute('height', height);
        border.setAttribute('fill', bgColor);
        border.setAttribute('stroke', borderColor);
        border.setAttribute('stroke-width', '2');
        border.setAttribute('rx', '4');
        
        // Table header
        const header = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        header.setAttribute('width', width);
        header.setAttribute('height', '30');
        header.setAttribute('fill', '#667eea');
        header.setAttribute('rx', '4');
        
        // Table header bottom
        const headerBottom = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        headerBottom.setAttribute('width', width);
        headerBottom.setAttribute('height', '15');
        headerBottom.setAttribute('y', '15');
        headerBottom.setAttribute('fill', '#667eea');
        
        // Table name
        const tableName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tableName.setAttribute('x', width / 2);
        tableName.setAttribute('y', '20');
        tableName.setAttribute('text-anchor', 'middle');
        tableName.setAttribute('font-weight', 'bold');
        tableName.setAttribute('font-size', '14');
        tableName.setAttribute('fill', 'white');
        tableName.textContent = table.name.toUpperCase();
        
        // Header separator line
        const separator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        separator.setAttribute('x1', '0');
        separator.setAttribute('y1', '30');
        separator.setAttribute('x2', width);
        separator.setAttribute('y2', '30');
        separator.setAttribute('stroke', borderColor);
        separator.setAttribute('stroke-width', '2');
        
        tableGroup.appendChild(border);
        tableGroup.appendChild(header);
        tableGroup.appendChild(headerBottom);
        tableGroup.appendChild(tableName);
        tableGroup.appendChild(separator);
        
        // Add fields
        table.fields.forEach((field, index) => {
            const fieldY = 48 + (index * 18);
            
            // Field background (alternate colors)
            if (index % 2 === 1) {
                const fieldBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                fieldBg.setAttribute('x', '1');
                fieldBg.setAttribute('y', fieldY - 10);
                fieldBg.setAttribute('width', width - 2);
                fieldBg.setAttribute('height', '18');
                fieldBg.setAttribute('fill', altBgColor);
                tableGroup.appendChild(fieldBg);
            }
            
            // PK/FK icons
            let iconX = 8;
            if (field.isPrimaryKey || table.primaryKey === field.name) {
                const pkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                pkIcon.setAttribute('x', iconX);
                pkIcon.setAttribute('y', fieldY);
                pkIcon.setAttribute('font-size', '12');
                pkIcon.setAttribute('font-weight', 'bold');
                pkIcon.setAttribute('fill', '#ffd700');
                pkIcon.textContent = '🔑';
                tableGroup.appendChild(pkIcon);
                iconX += 16;
            } else if (field.isForeignKey) {
                const fkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                fkIcon.setAttribute('x', iconX);
                fkIcon.setAttribute('y', fieldY);
                fkIcon.setAttribute('font-size', '12');
                fkIcon.setAttribute('fill', '#28a745');
                fkIcon.textContent = '🔗';
                tableGroup.appendChild(fkIcon);
                iconX += 16;
            }
            
            // Field name
            const fieldName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            fieldName.setAttribute('x', iconX);
            fieldName.setAttribute('y', fieldY);
            fieldName.setAttribute('font-size', '11');
            fieldName.setAttribute('fill', textColor);
            fieldName.setAttribute('font-weight', field.isPrimaryKey || table.primaryKey === field.name ? 'bold' : 'normal');
            fieldName.textContent = field.name;
            
            // Field type
            const fieldType = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            fieldType.setAttribute('x', width - 8);
            fieldType.setAttribute('y', fieldY);
            fieldType.setAttribute('text-anchor', 'end');
            fieldType.setAttribute('font-size', '10');
            fieldType.setAttribute('fill', isDark ? '#999' : '#666');
            fieldType.textContent = this.getShortType(field.type);
            
            tableGroup.appendChild(fieldName);
            tableGroup.appendChild(fieldType);
        });
        
        svg.appendChild(tableGroup);
    }

    static getShortType(type) {
        const typeMap = {
            'integer': 'INT',
            'decimal': 'DEC',
            'string': 'STR',
            'boolean': 'BOOL',
            'datetime': 'DATE',
            'email': 'EMAIL',
            'url': 'URL',
            'array': 'ARR',
            'object': 'OBJ'
        };
        return typeMap[type] || type.toUpperCase().substr(0, 4);
    }

    static drawERDRelationships(svg, schema, tables, tableWidth, tableHeights, margin, offsetX, offsetY, cols) {
        if (!schema.relationships) return;
        
        schema.relationships.forEach((rel, index) => {
            const parentIndex = tables.findIndex(t => t.name === rel.parentTable);
            const childIndex = tables.findIndex(t => t.name === rel.childTable);
            
            if (parentIndex === -1 || childIndex === -1) return;
            
            const parentCol = parentIndex % cols;
            const parentRow = Math.floor(parentIndex / cols);
            const childCol = childIndex % cols;
            const childRow = Math.floor(childIndex / cols);
            
            // Calculate connection points on table edges
            const parentX = offsetX + parentCol * (tableWidth + margin);
            const parentY = offsetY + parentRow * 160;
            const childX = offsetX + childCol * (tableWidth + margin);
            const childY = offsetY + childRow * 160;
            
            // Determine best connection points
            const { x1, y1, x2, y2 } = this.calculateConnectionPoints(
                parentX, parentY, tableWidth, tableHeights[parentIndex],
                childX, childY, tableWidth, tableHeights[childIndex]
            );
            
            const relType = rel.relationshipType || rel.type;
            const { stroke, strokeWidth, strokeDashArray } = this.getRelationshipStyle(relType);
            
            // Create ERD-style connector
            this.createERDConnector(svg, x1, y1, x2, y2, stroke, strokeWidth, strokeDashArray, relType);
        });
    }

    static getRelationshipStyle(relType) {
        switch (relType) {
            case 'one-to-one':
                return { stroke: '#28a745', strokeWidth: '2', strokeDashArray: null };
            case 'one-to-many':
                return { stroke: '#dc3545', strokeWidth: '2', strokeDashArray: '5,5' };
            case 'many-to-many':
                return { stroke: '#ffc107', strokeWidth: '3', strokeDashArray: '10,5' };
            default:
                return { stroke: '#999', strokeWidth: '2', strokeDashArray: '5,5' };
        }
    }

    static getRelationshipLabel(relType) {
        switch (relType) {
            case 'one-to-one':
                return '1:1';
            case 'one-to-many':
                return '1:N';
            case 'many-to-many':
                return 'N:M';
            default:
                return '1:N';
        }
    }

    static calculateConnectionPoints(x1, y1, w1, h1, x2, y2, w2, h2) {
        const centerX1 = x1 + w1 / 2;
        const centerY1 = y1 + h1 / 2;
        const centerX2 = x2 + w2 / 2;
        const centerY2 = y2 + h2 / 2;
        
        // Determine which sides to connect
        let connX1, connY1, connX2, connY2;
        
        if (Math.abs(centerX1 - centerX2) > Math.abs(centerY1 - centerY2)) {
            // Connect horizontally
            if (centerX1 < centerX2) {
                // Connect right side of table 1 to left side of table 2
                connX1 = x1 + w1;
                connY1 = centerY1;
                connX2 = x2;
                connY2 = centerY2;
            } else {
                // Connect left side of table 1 to right side of table 2
                connX1 = x1;
                connY1 = centerY1;
                connX2 = x2 + w2;
                connY2 = centerY2;
            }
        } else {
            // Connect vertically
            if (centerY1 < centerY2) {
                // Connect bottom of table 1 to top of table 2
                connX1 = centerX1;
                connY1 = y1 + h1;
                connX2 = centerX2;
                connY2 = y2;
            } else {
                // Connect top of table 1 to bottom of table 2
                connX1 = centerX1;
                connY1 = y1;
                connX2 = centerX2;
                connY2 = y2 + h2;
            }
        }
        
        return { x1: connX1, y1: connY1, x2: connX2, y2: connY2 };
    }

    static createERDConnector(svg, x1, y1, x2, y2, stroke, strokeWidth, strokeDashArray, relType) {
        // Create the connection line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', stroke);
        line.setAttribute('stroke-width', strokeWidth);
        if (strokeDashArray) {
            line.setAttribute('stroke-dasharray', strokeDashArray);
        }
        svg.appendChild(line);
        
        // Add relationship symbols
        this.addERDSymbols(svg, x1, y1, x2, y2, stroke, relType);
        
        // Add relationship label
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const labelBgColor = isDark ? '#2d2d2d' : 'white';
        
        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        labelBg.setAttribute('x', midX - 15);
        labelBg.setAttribute('y', midY - 10);
        labelBg.setAttribute('width', 30);
        labelBg.setAttribute('height', 16);
        labelBg.setAttribute('fill', labelBgColor);
        labelBg.setAttribute('stroke', stroke);
        labelBg.setAttribute('stroke-width', 1);
        labelBg.setAttribute('rx', 3);
        svg.appendChild(labelBg);
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', midX);
        label.setAttribute('y', midY + 3);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '10');
        label.setAttribute('font-weight', 'bold');
        label.setAttribute('fill', stroke);
        label.textContent = this.getRelationshipLabel(relType);
        svg.appendChild(label);
    }

    static addERDSymbols(svg, x1, y1, x2, y2, stroke, relType) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        // Add symbols based on relationship type
        switch (relType) {
            case 'one-to-one':
                this.addOneSymbol(svg, x1, y1, angle, stroke);
                this.addOneSymbol(svg, x2, y2, angle + Math.PI, stroke);
                break;
            case 'one-to-many':
                this.addOneSymbol(svg, x1, y1, angle, stroke);
                this.addManySymbol(svg, x2, y2, angle + Math.PI, stroke);
                break;
            case 'many-to-many':
                this.addManySymbol(svg, x1, y1, angle, stroke);
                this.addManySymbol(svg, x2, y2, angle + Math.PI, stroke);
                break;
        }
    }

    static addOneSymbol(svg, x, y, angle, stroke) {
        const symbolSize = 8;
        const offsetX = symbolSize * Math.cos(angle);
        const offsetY = symbolSize * Math.sin(angle);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x - offsetY / 2);
        line.setAttribute('y1', y + offsetX / 2);
        line.setAttribute('x2', x + offsetY / 2);
        line.setAttribute('y2', y - offsetX / 2);
        line.setAttribute('stroke', stroke);
        line.setAttribute('stroke-width', 2);
        svg.appendChild(line);
    }

    static addManySymbol(svg, x, y, angle, stroke) {
        const symbolSize = 12;
        const offsetX = symbolSize * Math.cos(angle);
        const offsetY = symbolSize * Math.sin(angle);
        
        // Create crow's foot symbol
        const lines = [
            { x1: x, y1: y, x2: x - offsetX + offsetY/2, y2: y - offsetY - offsetX/2 },
            { x1: x, y1: y, x2: x - offsetX, y2: y - offsetY },
            { x1: x, y1: y, x2: x - offsetX - offsetY/2, y2: y - offsetY + offsetX/2 }
        ];
        
        lines.forEach(lineData => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', lineData.x1);
            line.setAttribute('y1', lineData.y1);
            line.setAttribute('x2', lineData.x2);
            line.setAttribute('y2', lineData.y2);
            line.setAttribute('stroke', stroke);
            line.setAttribute('stroke-width', 2);
            svg.appendChild(line);
        });
    }

    static createERDLegend() {
        const legend = document.createElement('div');
        legend.className = 'schema-legend';
        legend.innerHTML = `
            <h4>ERD Legend</h4>
            <div class="legend-items">
                <div class="legend-item">
                    <span style="font-size: 14px;">🔑</span>
                    <span>Primary Key</span>
                </div>
                <div class="legend-item">
                    <span style="font-size: 14px;">🔗</span>
                    <span>Foreign Key</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #667eea;"></div>
                    <span>Table Header</span>
                </div>
            </div>
            <div class="legend-relationships">
                <h5>Relationship Types</h5>
                <div class="legend-items">
                    <div class="legend-item">
                        <div class="legend-line" style="border-top: 2px solid #28a745;"></div>
                        <span>1:1 (One-to-One)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-line" style="border-top: 2px dashed #dc3545;"></div>
                        <span>1:N (One-to-Many)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-line" style="border-top: 3px dashed #ffc107;"></div>
                        <span>N:M (Many-to-Many)</span>
                    </div>
                </div>
            </div>
            <div class="legend-types">
                <h5>Data Types</h5>
                <div class="legend-items">
                    <div class="legend-item"><span style="font-weight: bold;">INT</span> - Integer</div>
                    <div class="legend-item"><span style="font-weight: bold;">STR</span> - String</div>
                    <div class="legend-item"><span style="font-weight: bold;">DATE</span> - DateTime</div>
                    <div class="legend-item"><span style="font-weight: bold;">BOOL</span> - Boolean</div>
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .schema-legend {
                margin-top: 1rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
            }
            .schema-legend h4, .schema-legend h5 {
                margin: 0 0 0.5rem 0;
                color: #2c3e50;
            }
            .schema-legend h5 {
                font-size: 1rem;
                margin-top: 1rem;
            }
            .legend-items {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            .legend-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }
            .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 3px;
            }
            .legend-line {
                width: 20px;
                height: 1px;
            }
            .legend-relationships,
            .legend-types {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid #e0e0e0;
            }
            .erd-visualization {
                width: 100%;
                height: 500px;
                overflow: auto;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: white;
            }
            [data-theme="dark"] .erd-visualization {
                background: var(--card-bg);
                border-color: var(--border-color);
            }
        `;
        
        legend.appendChild(style);
        return legend;
    }

    static renderD3Visualization(container, schema) {
        const width = container.clientWidth || 800;
        const height = 400;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
            
        const simulation = d3.forceSimulation(schema.tables)
            .force('link', d3.forceLink(schema.relationships).id(d => d.name))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));
            
        const link = svg.append('g')
            .selectAll('line')
            .data(schema.relationships)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
            
        const node = svg.append('g')
            .selectAll('g')
            .data(schema.tables)
            .enter().append('g')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));
                
        node.append('rect')
            .attr('width', 120)
            .attr('height', 60)
            .attr('x', -60)
            .attr('y', -30)
            .attr('fill', '#f8f9fa')
            .attr('stroke', '#667eea')
            .attr('stroke-width', 2)
            .attr('rx', 8);
            
        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.5em')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text(d => d.name);
            
        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1em')
            .attr('font-size', '10px')
            .attr('fill', '#666')
            .text(d => `${d.fields.length} fields`);
            
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
                
            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });
        
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    static exportVisualization(container, format = 'png') {
        const svg = container.querySelector('svg');
        if (!svg) {
            throw new Error('No visualization found to export');
        }
        
        if (format === 'svg') {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            return 'data:image/svg+xml;base64,' + btoa(svgString);
        }
        
        // For other formats, would need html2canvas or similar library
        throw new Error(`Export format ${format} not yet implemented`);
    }
}