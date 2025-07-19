# Data Formatter 📊

A powerful web application for analyzing, formatting, and visualizing JSON/XML data with professional database schema generation.

![Data Formatter](https://img.shields.io/badge/Status-Complete-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![CSS](https://img.shields.io/badge/CSS-Grid%20%26%20Flexbox-blue)

## ✨ Features

### 🔧 Core Functionality
- **JSON/XML Parser**: Parse and validate JSON/XML with comprehensive error handling
- **Format Conversion**: Bidirectional JSON ↔ XML conversion with proper structure preservation
- **Data Beautification**: Format and prettify data with syntax highlighting
- **Minification**: Compress JSON/XML for production use
- **Tree View**: Interactive hierarchical display of data structure

### 🗃️ Schema Analysis
- **Professional ERD Diagrams**: Generate Entity Relationship Diagrams from data
- **Relationship Detection**: Automatic 1:1, 1:N, and N:M relationship identification
- **Visual Indicators**: Primary key (🔑) and foreign key (🔗) symbols
- **Interactive Zoom**: 25% - 300% zoom with pan functionality
- **Fullscreen Mode**: Dedicated view for complex schemas

### 🎨 User Interface
- **Dark/Light Mode**: Toggle between themes with persistent preferences
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Tabbed Interface**: Organized results in Beautify, Tree View, Schema, Convert, and Minify tabs
- **Copy Functionality**: One-click copy to clipboard for all results

### 📡 Data Sources
- **Manual Input**: Direct paste of JSON/XML data
- **URL Fetching**: Load data from remote endpoints with CORS handling
- **Sample Data**: Pre-loaded realistic examples for testing
- **Clear Function**: Reset all inputs and outputs

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/data-formatter.git
   cd data-formatter
   ```

2. **Open in browser**:
   Simply open `index.html` in your web browser. No build process required!

3. **Start analyzing data**:
   - Paste JSON/XML data or load samples
   - Click "Process Data" to analyze
   - Explore results in different tabs
   - Use zoom controls for schema visualization

## 📁 Project Structure

```
data-formatter/
├── index.html              # Main application page
├── css/
│   ├── styles.css          # Main layout and theming
│   ├── tabs.css            # Tab component styling
│   └── components.css      # Reusable component styles
├── js/
│   ├── app.js              # Main application logic
│   ├── parser.js           # JSON/XML parsing utilities
│   ├── converter.js        # Format conversion engine
│   ├── schema.js           # Database schema analysis
│   ├── visualizer.js       # ERD visualization renderer
│   ├── treeview.js         # Tree view component
│   ├── fetcher.js          # URL data fetching
│   └── samples.js          # Sample data definitions
└── tasks/
    └── todo.md             # Development progress tracking
```

## 🎯 Usage Examples

### Schema Visualization
1. Load the "JSON - Users Data" sample
2. Click "Process Data"
3. Navigate to the "Schema" tab
4. Use zoom controls to explore the ERD
5. Try fullscreen mode for better viewing

### Format Conversion
1. Input JSON data
2. Process the data
3. Check the "Convert Format" tab for XML output
4. Copy the result for use in your project

### Tree View Navigation
1. Load complex nested data
2. Use the "Tree View" tab
3. Expand/collapse nodes to explore structure
4. Use "Expand All" or "Collapse All" controls

## 🛠️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: CSS Grid, Flexbox, and CSS Custom Properties
- **Parsing**: Built-in JSON.parse() and DOMParser for XML
- **Visualization**: SVG-based ERD generation
- **Theme**: CSS variables for dynamic theming

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance
- Client-side processing (no server required)
- Efficient parsing algorithms
- Smooth animations with CSS transitions
- Responsive design optimizations

## 🎨 Screenshots

### Light Mode Schema View
Professional ERD diagrams with clean, readable styling and relationship indicators.

### Dark Mode with Zoom
Interactive zoom and pan functionality with proper dark mode contrast.

### Tree View
Hierarchical data exploration with expand/collapse controls.

## 🔧 Development

### Adding New Features
1. Core logic goes in `js/` modules
2. Styling in appropriate CSS files
3. Update `app.js` for UI integration
4. Test across different data types

### Extending Schema Analysis
- Modify `js/schema.js` for new relationship types
- Update `js/visualizer.js` for visual representation
- Add new field types in type detection

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Built with modern web standards
- ERD styling inspired by professional database tools
- Dark mode implementation following accessibility guidelines

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**