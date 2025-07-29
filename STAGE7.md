Prompt 7.1: Search Implementation
Implement powerful search functionality:

1. Create SearchBar component with:
   - Full-text search across all trade notes
   - Debounced input (300ms)
   - Search suggestions
   - Result highlighting
2. Add advanced search with filters:
   - Date range
   - Ticker
   - Outcome
   - Note content
3. Save recent searches
4. Export search results
5. Integrate with trade list view

Use Fuse.js for fuzzy search. Commit: "feat: add advanced search functionality"
Prompt 7.2: Analytics Charts
Create analytics visualizations:

1. First install recharts
2. Create Analytics page with:
   - Performance over time (line chart)
   - Win rate by month (bar chart)
   - Trade frequency heatmap
   - Best/worst trades table
   - Average hold time by outcome
3. Make charts interactive with tooltips
4. Add date range selector
5. Export charts as images

Ensure charts are responsive and performant. Commit: "feat: add analytics with charts"