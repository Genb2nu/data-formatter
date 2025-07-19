class TreeView {
    constructor() {
        this.expandedNodes = new Set();
        this.nodeCounter = 0;
    }

    render(container, data, format) {
        if (!data) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🌳</div>
                    <div class="empty-state-title">No Data to Display</div>
                    <div class="empty-state-message">Process some data to see the tree view</div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        this.nodeCounter = 0;
        this.expandedNodes.clear();

        const treeHtml = this.createTreeNode(data, 'root', 0, true);
        container.innerHTML = treeHtml;

        this.bindEvents(container);
    }

    createTreeNode(data, key, level, isRoot = false) {
        const nodeId = `node_${this.nodeCounter++}`;
        const isExpanded = isRoot || this.expandedNodes.has(nodeId);
        
        if (data === null || data === undefined) {
            return this.createLeafNode(key, data, 'null');
        }

        if (Array.isArray(data)) {
            return this.createArrayNode(data, key, level, nodeId, isExpanded, isRoot);
        }

        if (typeof data === 'object') {
            return this.createObjectNode(data, key, level, nodeId, isExpanded, isRoot);
        }

        return this.createLeafNode(key, data, typeof data);
    }

    createArrayNode(data, key, level, nodeId, isExpanded, isRoot) {
        const count = data.length;
        const toggleClass = count > 0 ? (isExpanded ? 'expanded' : 'collapsed') : 'leaf';
        const childrenClass = isExpanded ? 'tree-children' : 'tree-children collapsed';
        const nodeClass = isRoot ? 'tree-node root' : 'tree-node';

        let html = `
            <div class="${nodeClass}">
                <div class="tree-item" data-node-id="${nodeId}">
                    <span class="tree-toggle ${toggleClass}"></span>
                    <span class="tree-key">${key}</span>
                    <span class="tree-type">[array]</span>
                    <span class="tree-count">(${count} items)</span>
                </div>
        `;

        if (count > 0) {
            html += `<div class="${childrenClass}" data-children-for="${nodeId}">`;
            
            data.forEach((item, index) => {
                html += this.createTreeNode(item, `[${index}]`, level + 1);
            });
            
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    createObjectNode(data, key, level, nodeId, isExpanded, isRoot) {
        const keys = Object.keys(data);
        const count = keys.length;
        const toggleClass = count > 0 ? (isExpanded ? 'expanded' : 'collapsed') : 'leaf';
        const childrenClass = isExpanded ? 'tree-children' : 'tree-children collapsed';
        const nodeClass = isRoot ? 'tree-node root' : 'tree-node';

        let html = `
            <div class="${nodeClass}">
                <div class="tree-item" data-node-id="${nodeId}">
                    <span class="tree-toggle ${toggleClass}"></span>
                    <span class="tree-key">${key}</span>
                    <span class="tree-type">{object}</span>
                    <span class="tree-count">(${count} properties)</span>
                </div>
        `;

        if (count > 0) {
            html += `<div class="${childrenClass}" data-children-for="${nodeId}">`;
            
            keys.forEach(objKey => {
                html += this.createTreeNode(data[objKey], objKey, level + 1);
            });
            
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    createLeafNode(key, value, type) {
        const formattedValue = this.formatValue(value, type);
        const valueClass = `tree-value ${type}`;

        return `
            <div class="tree-node">
                <div class="tree-item">
                    <span class="tree-toggle leaf"></span>
                    <span class="tree-key">${key}</span>
                    <span class="tree-type">(${type})</span>
                    <span class="${valueClass}">${formattedValue}</span>
                </div>
            </div>
        `;
    }

    formatValue(value, type) {
        switch (type) {
            case 'string':
                return `"${this.escapeHtml(String(value))}"`;
            case 'number':
                return String(value);
            case 'boolean':
                return String(value);
            case 'null':
                return 'null';
            case 'undefined':
                return 'undefined';
            default:
                return this.escapeHtml(String(value));
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindEvents(container) {
        container.addEventListener('click', (e) => {
            const item = e.target.closest('.tree-item');
            if (!item) return;

            const toggle = item.querySelector('.tree-toggle');
            if (!toggle || toggle.classList.contains('leaf')) return;

            const nodeId = item.dataset.nodeId;
            const children = container.querySelector(`[data-children-for="${nodeId}"]`);
            
            if (!children) return;

            if (toggle.classList.contains('expanded')) {
                toggle.classList.remove('expanded');
                toggle.classList.add('collapsed');
                children.classList.add('collapsed');
                this.expandedNodes.delete(nodeId);
            } else {
                toggle.classList.remove('collapsed');
                toggle.classList.add('expanded');
                children.classList.remove('collapsed');
                this.expandedNodes.add(nodeId);
            }
        });
    }

    expandAll(container) {
        const toggles = container.querySelectorAll('.tree-toggle.collapsed');
        toggles.forEach(toggle => {
            const item = toggle.closest('.tree-item');
            const nodeId = item.dataset.nodeId;
            const children = container.querySelector(`[data-children-for="${nodeId}"]`);
            
            if (children) {
                toggle.classList.remove('collapsed');
                toggle.classList.add('expanded');
                children.classList.remove('collapsed');
                this.expandedNodes.add(nodeId);
            }
        });
    }

    collapseAll(container) {
        const toggles = container.querySelectorAll('.tree-toggle.expanded');
        toggles.forEach(toggle => {
            const item = toggle.closest('.tree-item');
            const nodeId = item.dataset.nodeId;
            const children = container.querySelector(`[data-children-for="${nodeId}"]`);
            
            if (children && !item.closest('.tree-node.root')) {
                toggle.classList.remove('expanded');
                toggle.classList.add('collapsed');
                children.classList.add('collapsed');
                this.expandedNodes.delete(nodeId);
            }
        });
    }

    searchInTree(container, searchTerm) {
        if (!searchTerm) {
            this.clearSearchHighlights(container);
            return;
        }

        const items = container.querySelectorAll('.tree-item');
        let matchCount = 0;

        items.forEach(item => {
            const key = item.querySelector('.tree-key').textContent;
            const value = item.querySelector('.tree-value');
            const valueText = value ? value.textContent : '';
            
            const keyMatch = key.toLowerCase().includes(searchTerm.toLowerCase());
            const valueMatch = valueText.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (keyMatch || valueMatch) {
                item.classList.add('tree-search-match');
                this.expandParents(item, container);
                matchCount++;
            } else {
                item.classList.remove('tree-search-match');
            }
        });

        return matchCount;
    }

    expandParents(item, container) {
        let parent = item.closest('.tree-node').parentElement;
        
        while (parent && parent !== container) {
            if (parent.classList.contains('tree-children')) {
                const nodeId = parent.dataset.childrenFor;
                const parentItem = container.querySelector(`[data-node-id="${nodeId}"]`);
                const toggle = parentItem.querySelector('.tree-toggle');
                
                if (toggle && toggle.classList.contains('collapsed')) {
                    toggle.classList.remove('collapsed');
                    toggle.classList.add('expanded');
                    parent.classList.remove('collapsed');
                    this.expandedNodes.add(nodeId);
                }
            }
            parent = parent.parentElement;
        }
    }

    clearSearchHighlights(container) {
        const matches = container.querySelectorAll('.tree-search-match');
        matches.forEach(match => match.classList.remove('tree-search-match'));
    }

    exportTreeAsText(container) {
        const result = [];
        this.extractTextFromNode(container.querySelector('.tree-node.root'), result, 0);
        return result.join('\n');
    }

    extractTextFromNode(node, result, indent) {
        if (!node) return;

        const item = node.querySelector('.tree-item');
        if (item) {
            const key = item.querySelector('.tree-key').textContent;
            const type = item.querySelector('.tree-type').textContent;
            const value = item.querySelector('.tree-value');
            const valueText = value ? value.textContent : '';
            
            const prefix = '  '.repeat(indent);
            const line = value ? 
                `${prefix}${key} ${type}: ${valueText}` : 
                `${prefix}${key} ${type}`;
            
            result.push(line);
        }

        const children = node.querySelector('.tree-children');
        if (children && !children.classList.contains('collapsed')) {
            const childNodes = children.querySelectorAll(':scope > .tree-node');
            childNodes.forEach(child => {
                this.extractTextFromNode(child, result, indent + 1);
            });
        }
    }

    getNodeStats(data) {
        const stats = {
            totalNodes: 0,
            objects: 0,
            arrays: 0,
            primitives: 0,
            maxDepth: 0
        };

        this.analyzeNode(data, stats, 0);
        return stats;
    }

    analyzeNode(data, stats, depth) {
        stats.totalNodes++;
        stats.maxDepth = Math.max(stats.maxDepth, depth);

        if (Array.isArray(data)) {
            stats.arrays++;
            data.forEach(item => this.analyzeNode(item, stats, depth + 1));
        } else if (typeof data === 'object' && data !== null) {
            stats.objects++;
            Object.values(data).forEach(value => this.analyzeNode(value, stats, depth + 1));
        } else {
            stats.primitives++;
        }
    }
}