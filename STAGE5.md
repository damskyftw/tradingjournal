Prompt 5.1: Thesis Form
Let's implement the thesis management feature:

1. Read the Thesis interface from our types
2. Create ThesisForm with fields for:
   - Quarter and year selection
   - Market outlook (radio buttons)
   - Strategy sections (arrays of strings)
   - Risk parameters
   - Goals with numeric inputs
3. Only one thesis per quarter allowed - add validation
4. Create template system:
   - Day trading template
   - Swing trading template
   - Long-term investing template
5. Link trades to thesis using dropdown in trade form

Test thoroughly. Commit: "feat: add thesis management form"
Prompt 5.2: Thesis Evolution
Implement thesis versioning and comparison:

1. Modify thesis to store version history
2. Create ThesisComparison component:
   - Side-by-side view of two versions
   - Highlight differences
   - Show change reasons
3. Add "Update Thesis" button that:
   - Creates new version
   - Prompts for change reason
   - Preserves history
4. Create timeline view of thesis evolution
5. Calculate and show goal achievement metrics

Focus on clear visualization of changes. Commit: "feat: add thesis evolution tracking"