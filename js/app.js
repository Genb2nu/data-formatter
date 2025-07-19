class DataFormatterApp {
    constructor() {
        this.currentData = null;
        this.currentFormat = null;
        this.activeTab = 'beautify';
        this.treeView = new TreeView();
        this.zoomScale = 1;
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.panOffset = { x: 0, y: 0 };
        
        this.initializeElements();
        this.bindEvents();
        this.initializeTabs();
    }

    initializeElements() {
        this.elements = {
            urlInput: document.getElementById('url-input'),
            fetchBtn: document.getElementById('fetch-btn'),
            sampleSelect: document.getElementById('sample-select'),
            clearBtn: document.getElementById('clear-btn'),
            dataInput: document.getElementById('data-input'),
            processBtn: document.getElementById('process-btn'),
            
            tabBtns: document.querySelectorAll('.tab-btn'),
            tabPanes: document.querySelectorAll('.tab-pane'),
            
            beautifyOutput: document.getElementById('beautify-output'),
            treeOutput: document.getElementById('tree-output'),
            expandAllBtn: document.getElementById('expand-all-btn'),
            collapseAllBtn: document.getElementById('collapse-all-btn'),
            schemaVisualization: document.getElementById('schema-visualization'),
            schemaTables: document.getElementById('schema-tables'),
            convertOutput: document.getElementById('convert-output'),
            conversionDirection: document.getElementById('conversion-direction'),
            minifyOutput: document.getElementById('minify-output'),
            
            copyBtns: document.querySelectorAll('.copy-btn'),
            errorMessage: document.getElementById('error-message'),
            successMessage: document.getElementById('success-message'),
            darkModeToggle: document.getElementById('dark-mode-toggle'),
            zoomInBtn: document.getElementById('zoom-in-btn'),
            zoomOutBtn: document.getElementById('zoom-out-btn'),
            zoomResetBtn: document.getElementById('zoom-reset-btn'),
            fullscreenBtn: document.getElementById('fullscreen-btn'),
            zoomLevel: document.getElementById('zoom-level')
        };
    }

    bindEvents() {
        this.elements.fetchBtn.addEventListener('click', () => this.handleFetchData());
        this.elements.sampleSelect.addEventListener('change', () => this.handleLoadSample());
        this.elements.clearBtn.addEventListener('click', () => this.handleClear());
        this.elements.processBtn.addEventListener('click', () => this.handleProcessData());
        
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleTabChange(btn.dataset.tab));
        });
        
        this.elements.copyBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleCopy(btn.dataset.target));
        });
        
        document.querySelector('.error-close')?.addEventListener('click', () => {
            this.hideMessage('error');
        });
        
        this.elements.dataInput.addEventListener('input', () => this.clearResults());
        this.elements.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleFetchData();
        });
        
        this.elements.expandAllBtn.addEventListener('click', () => {
            this.treeView.expandAll(this.elements.treeOutput);
        });
        
        this.elements.collapseAllBtn.addEventListener('click', () => {
            this.treeView.collapseAll(this.elements.treeOutput);
        });
        
        this.elements.darkModeToggle.addEventListener('click', () => {
            this.toggleDarkMode();
        });
        
        // Schema zoom controls
        this.elements.zoomInBtn.addEventListener('click', () => {
            this.zoomSchema(1.2);
        });
        
        this.elements.zoomOutBtn.addEventListener('click', () => {
            this.zoomSchema(0.8);
        });
        
        this.elements.zoomResetBtn.addEventListener('click', () => {
            this.resetZoom();
        });
        
        this.elements.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Mouse wheel zoom
        this.elements.schemaVisualization.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
                this.zoomSchema(zoomFactor);
            }
        });
        
        // Pan functionality
        this.setupPanning();
    }

    initializeTabs() {
        this.showTab('beautify');
        this.initializeDarkMode();
    }

    initializeDarkMode() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = this.elements.darkModeToggle.querySelector('.theme-icon');
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        this.elements.darkModeToggle.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    zoomSchema(factor) {
        this.zoomScale *= factor;
        this.zoomScale = Math.max(0.25, Math.min(3, this.zoomScale)); // Limit zoom between 25% and 300%
        
        const visualization = this.elements.schemaVisualization.querySelector('.erd-visualization');
        if (visualization) {
            visualization.style.transform = `scale(${this.zoomScale}) translate(${this.panOffset.x}px, ${this.panOffset.y}px)`;
        }
        
        this.updateZoomIndicator();
    }

    resetZoom() {
        this.zoomScale = 1;
        this.panOffset = { x: 0, y: 0 };
        
        const visualization = this.elements.schemaVisualization.querySelector('.erd-visualization');
        if (visualization) {
            visualization.style.transform = `scale(1) translate(0px, 0px)`;
        }
        
        this.updateZoomIndicator();
    }

    updateZoomIndicator() {
        this.elements.zoomLevel.textContent = `${Math.round(this.zoomScale * 100)}%`;
    }

    toggleFullscreen() {
        const container = this.elements.schemaVisualization;
        
        if (container.classList.contains('fullscreen')) {
            container.classList.remove('fullscreen');
            this.elements.fullscreenBtn.textContent = '⛶';
            this.elements.fullscreenBtn.title = 'Fullscreen';
            
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
        } else {
            container.classList.add('fullscreen');
            this.elements.fullscreenBtn.textContent = '◱';
            this.elements.fullscreenBtn.title = 'Exit Fullscreen';
            
            // Request fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            }
        }
    }

    setupPanning() {
        const container = this.elements.schemaVisualization;
        
        container.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                this.isPanning = true;
                this.panStart = { x: e.clientX, y: e.clientY };
                container.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });
        
        container.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const deltaX = (e.clientX - this.panStart.x) / this.zoomScale;
                const deltaY = (e.clientY - this.panStart.y) / this.zoomScale;
                
                this.panOffset.x += deltaX;
                this.panOffset.y += deltaY;
                
                this.panStart = { x: e.clientX, y: e.clientY };
                
                const visualization = container.querySelector('.erd-visualization');
                if (visualization) {
                    visualization.style.transform = `scale(${this.zoomScale}) translate(${this.panOffset.x}px, ${this.panOffset.y}px)`;
                }
            }
        });
        
        container.addEventListener('mouseup', () => {
            this.isPanning = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mouseleave', () => {
            this.isPanning = false;
            container.style.cursor = 'grab';
        });
        
        // Handle fullscreen change
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                this.elements.schemaVisualization.classList.remove('fullscreen');
                this.elements.fullscreenBtn.textContent = '⛶';
                this.elements.fullscreenBtn.title = 'Fullscreen';
            }
        });
    }

    async handleFetchData() {
        const url = this.elements.urlInput.value.trim();
        if (!url) {
            this.showError('Please enter a valid URL');
            return;
        }

        try {
            this.setButtonLoading(this.elements.fetchBtn, true);
            const data = await DataFetcher.fetchFromUrl(url);
            this.elements.dataInput.value = data;
            this.showSuccess('Data fetched successfully');
            this.clearResults();
        } catch (error) {
            this.showError(`Failed to fetch data: ${error.message}`);
        } finally {
            this.setButtonLoading(this.elements.fetchBtn, false);
        }
    }

    handleLoadSample() {
        const sampleKey = this.elements.sampleSelect.value;
        if (!sampleKey) return;

        try {
            const sampleData = SampleData.getSample(sampleKey);
            this.elements.dataInput.value = sampleData;
            this.showSuccess('Sample data loaded');
            this.clearResults();
        } catch (error) {
            this.showError(`Failed to load sample: ${error.message}`);
        }
    }

    handleClear() {
        this.elements.urlInput.value = '';
        this.elements.sampleSelect.value = '';
        this.elements.dataInput.value = '';
        this.clearResults();
        this.showSuccess('All fields cleared');
    }

    async handleProcessData() {
        const inputData = this.elements.dataInput.value.trim();
        if (!inputData) {
            this.showError('Please enter some data to process');
            return;
        }

        try {
            this.setButtonLoading(this.elements.processBtn, true);
            
            const parseResult = DataParser.parseData(inputData);
            this.currentData = parseResult.data;
            this.currentFormat = parseResult.format;
            
            await this.updateAllTabs();
            this.showSuccess(`${parseResult.format.toUpperCase()} data processed successfully`);
            
        } catch (error) {
            this.showError(`Failed to process data: ${error.message}`);
            this.clearResults();
        } finally {
            this.setButtonLoading(this.elements.processBtn, false);
        }
    }

    async updateAllTabs() {
        if (!this.currentData) return;

        this.updateBeautifyTab();
        this.updateTreeViewTab();
        this.updateMinifyTab();
        this.updateConvertTab();
        await this.updateSchemaTab();
    }

    updateBeautifyTab() {
        try {
            const formatted = DataParser.formatData(this.currentData, this.currentFormat);
            this.elements.beautifyOutput.textContent = formatted;
            this.elements.beautifyOutput.className = `code-output ${this.currentFormat}-code`;
        } catch (error) {
            this.elements.beautifyOutput.textContent = `Error formatting data: ${error.message}`;
        }
    }

    updateTreeViewTab() {
        try {
            this.treeView.render(this.elements.treeOutput, this.currentData, this.currentFormat);
        } catch (error) {
            this.elements.treeOutput.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <div class="empty-state-title">Tree View Error</div>
                    <div class="empty-state-message">${error.message}</div>
                </div>
            `;
        }
    }

    updateMinifyTab() {
        try {
            const minified = DataParser.minifyData(this.currentData, this.currentFormat);
            this.elements.minifyOutput.textContent = minified;
        } catch (error) {
            this.elements.minifyOutput.textContent = `Error minifying data: ${error.message}`;
        }
    }

    updateConvertTab() {
        try {
            const targetFormat = this.currentFormat === 'json' ? 'xml' : 'json';
            const converted = DataConverter.convert(this.currentData, this.currentFormat, targetFormat);
            
            this.elements.convertOutput.textContent = converted;
            this.elements.conversionDirection.textContent = 
                `Converted from ${this.currentFormat.toUpperCase()} to ${targetFormat.toUpperCase()}`;
        } catch (error) {
            this.elements.convertOutput.textContent = `Error converting data: ${error.message}`;
            this.elements.conversionDirection.textContent = 'Conversion failed';
        }
    }

    async updateSchemaTab() {
        try {
            const schema = SchemaAnalyzer.analyzeSchema(this.currentData, this.currentFormat);
            this.renderSchemaVisualization(schema);
            this.renderSchemaTables(schema);
        } catch (error) {
            this.elements.schemaVisualization.innerHTML = 
                `<div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <div class="empty-state-title">Schema Analysis Failed</div>
                    <div class="empty-state-message">${error.message}</div>
                </div>`;
            this.elements.schemaTables.innerHTML = '';
        }
    }

    renderSchemaVisualization(schema) {
        if (!schema.tables || schema.tables.length === 0) {
            this.elements.schemaVisualization.innerHTML = 
                `<div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-title">No Schema Detected</div>
                    <div class="empty-state-message">The data doesn't appear to contain structured table data</div>
                </div>`;
            return;
        }

        if (typeof SchemaVisualizer !== 'undefined') {
            SchemaVisualizer.render(this.elements.schemaVisualization, schema);
        } else {
            this.elements.schemaVisualization.innerHTML = 
                `<div class="empty-state">
                    <div class="empty-state-icon">🔧</div>
                    <div class="empty-state-title">Visualization Loading</div>
                    <div class="empty-state-message">Schema visualization will be available soon</div>
                </div>`;
        }
    }

    renderSchemaTables(schema) {
        if (!schema.tables || schema.tables.length === 0) {
            this.elements.schemaTables.innerHTML = '';
            return;
        }

        const tablesHtml = schema.tables.map(table => `
            <div class="schema-table">
                <div class="schema-table-header">
                    ${table.name} (${table.fields.length} fields)
                </div>
                <div class="schema-table-body">
                    ${table.fields.map(field => `
                        <div class="schema-field">
                            <span class="field-name">${field.name}</span>
                            <span class="field-type">${field.type}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        this.elements.schemaTables.innerHTML = tablesHtml;
    }

    handleTabChange(tabName) {
        this.activeTab = tabName;
        this.showTab(tabName);
    }

    showTab(tabName) {
        this.elements.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        this.elements.tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });
    }

    async handleCopy(targetId) {
        const element = document.getElementById(targetId);
        if (!element) return;

        try {
            await navigator.clipboard.writeText(element.textContent);
            
            const copyBtn = document.querySelector(`[data-target="${targetId}"]`);
            copyBtn.classList.add('copied');
            setTimeout(() => copyBtn.classList.remove('copied'), 1000);
            
            this.showSuccess('Copied to clipboard');
        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
    }

    clearResults() {
        this.currentData = null;
        this.currentFormat = null;
        
        this.elements.beautifyOutput.textContent = '';
        this.elements.treeOutput.innerHTML = '';
        this.elements.convertOutput.textContent = '';
        this.elements.minifyOutput.textContent = '';
        this.elements.conversionDirection.textContent = '';
        this.elements.schemaVisualization.innerHTML = '';
        this.elements.schemaTables.innerHTML = '';
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showError(message) {
        this.elements.errorMessage.querySelector('.error-text').textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
        
        setTimeout(() => this.hideMessage('error'), 5000);
    }

    showSuccess(message) {
        this.elements.successMessage.querySelector('.success-text').textContent = message;
        this.elements.successMessage.classList.remove('hidden');
        
        setTimeout(() => this.hideMessage('success'), 3000);
    }

    hideMessage(type) {
        const element = type === 'error' ? this.elements.errorMessage : this.elements.successMessage;
        element.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DataFormatterApp();
});