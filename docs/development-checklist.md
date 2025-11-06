# Development Checklist: Variables & Dependencies

## Before Creating Any Component

### ✅ SCSS Variables Check

- [ ] All color variables defined in `styles/variables.scss`
- [ ] All border-radius variables defined
- [ ] All spacing/sizing variables available
- [ ] All typography variables ready
- [ ] Import statements use `@use '@/styles/variables' as *`

### ✅ TypeScript Types Check

- [ ] All interfaces defined in `types/` directory
- [ ] All enums created before component usage
- [ ] Export statements in barrel files (`index.ts`)
- [ ] Import paths use `@/types/` alias

### ✅ Component Dependencies

- [ ] All required utility functions exist
- [ ] Context providers available if needed
- [ ] Parent components created before children
- [ ] All imports resolve correctly

### ✅ Testing Strategy

- [ ] Build compilation check: `npm run build`
- [ ] Development server test: `npm run dev`
- [ ] TypeScript check: `npx tsc --noEmit`
- [ ] Linting check: `npm run lint`

## Component Creation Order

1. **Foundation Layer**
   - Variables & design tokens
   - Base types & interfaces
   - Utility functions

2. **Core Layer**
   - Context providers
   - Base UI components
   - Layout components

3. **Feature Layer**
   - Business logic components
   - Page components
   - Integration components

## Quick Commands for Validation

```bash
# Check all TypeScript types
npx tsc --noEmit

# Check SCSS compilation
npm run build

# Check ESLint rules
npm run lint

# Check imports resolve
npm run dev
```

## Emergency Variable Creation Template

When you need a variable that doesn't exist:

```scss
// In styles/variables.scss
$variable-name: value;

// Then use in component
@use '@/styles/variables' as *;
.class {
  property: $variable-name;
}
```
