# Contributing Guide

Thank you for your interest in improving the Polymarket Market Monitor template!

## 🎯 Project Goals

This template aims to:
1. **Teach developers** how to use Polymarket's Gamma API
2. **Demonstrate best practices** for React/Next.js applications
3. **Provide a production-ready starter** for building Polymarket integrations

## 🚀 Getting Started

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/polymarket-market-monitor.git
cd polymarket-market-monitor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Tools

- **TypeScript**: Provides type checking
- **ESLint**: Enforces code quality
- **Prettier**: (Recommended) Auto-format code

```bash
# Run linter
npm run lint

# Build to check for errors
npm run build
```

## 📋 How to Contribute

### Reporting Bugs

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser/OS information

### Suggesting Features

Have an idea? Open an issue with:
- Use case description
- Why it would be valuable
- Potential implementation approach

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add market detail page"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

## 📝 Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and returns
- Avoid `any` type (use `unknown` if necessary)
- Use interfaces for objects, types for unions/primitives

```typescript
// Good ✅
interface Market {
  id: string;
  question: string;
}

function formatMarket(market: Market): string {
  return market.question;
}

// Bad ❌
function formatMarket(market: any) {
  return market.question;
}
```

### React Components

- Use functional components with hooks
- Extract complex logic into custom hooks
- Keep components focused (single responsibility)

```typescript
// Good ✅
function MarketCard({ market }: { market: Market }) {
  const formattedPrice = useFormattedPrice(market);
  return <div>{formattedPrice}</div>;
}

// Bad ❌
function Everything() {
  // 500 lines of code doing many things
}
```

### Comments

- Use JSDoc for functions and components
- Explain **why**, not **what**
- Add comments for complex logic

```typescript
/**
 * Parse outcome prices from API response
 * 
 * Gamma API returns prices as JSON string, so we need to parse
 * and convert to numbers for calculations.
 */
function parseOutcomePrices(prices: string): number[] {
  // Implementation
}
```

### File Organization

```
components/
  market-dashboard.tsx    # Container component
  market-card.tsx         # Presentational component
  ui/                     # Shared UI components
    card.tsx
    badge.tsx

lib/
  api.ts                  # API client
  utils.ts                # Pure utility functions
  hooks/                  # Custom React hooks
    useMarkets.ts
```

## 🧪 Testing (Future)

When adding tests:

### Unit Tests
- Test utility functions in `lib/`
- Mock API calls
- Test edge cases

### Component Tests
- Test rendering with different props
- Test user interactions
- Test loading/error states

### E2E Tests
- Test critical user flows
- Test on multiple screen sizes
- Test in different browsers

## 🎨 Design Guidelines

### UI Consistency

- Use shadcn/ui components when possible
- Follow existing spacing/sizing patterns
- Maintain Polymarket brand colors

### Responsive Design

- Mobile-first approach
- Test on various screen sizes
- Use Tailwind breakpoints consistently

### Accessibility

- Use semantic HTML
- Ensure keyboard navigation works
- Provide alt text for images
- Maintain color contrast ratios

## 📦 Dependencies

### Adding New Dependencies

Before adding a new package, consider:
- Is it actively maintained?
- Bundle size impact
- TypeScript support
- Alternatives already in use

```bash
# Check bundle size impact
npm install package-name
npm run build

# Check the .next/analyze output
```

### Acceptable Dependencies

✅ UI libraries (components, icons)
✅ Data fetching utilities
✅ Date/number formatting
✅ Testing libraries

❌ Large utility libraries (lodash)
❌ Duplicate functionality
❌ Unmaintained packages

## 🐛 Debugging Tips

### Common Issues

**Issue: Markets not loading**
```bash
# Check API is accessible
curl https://gamma-api.polymarket.com/markets

# Check browser console for errors
# Open DevTools > Console
```

**Issue: Styles not applying**
```bash
# Rebuild Tailwind
npm run dev

# Check className syntax
# Ensure no typos in Tailwind classes
```

**Issue: TypeScript errors**
```bash
# Restart TypeScript server in VSCode
# Cmd+Shift+P > "TypeScript: Restart TS Server"

# Clear Next.js cache
rm -rf .next
npm run dev
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass (when implemented)
- [ ] No console errors or warnings
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
How to test these changes

## Screenshots (if applicable)
Before/after screenshots

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Added comments for complex logic
- [ ] Updated documentation
```

## 📚 Learning Resources

### Polymarket
- [Gamma API Docs](https://docs.polymarket.com/api-reference)
- [Polymarket Blog](https://polymarket.com/blog)

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### TanStack Query
- [Official Docs](https://tanstack.com/query/latest)
- [Best Practices](https://tkdodo.eu/blog/practical-react-query)

### TypeScript
- [Official Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 🤝 Community

- Be respectful and constructive
- Help others learn
- Share knowledge
- Celebrate contributions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, makes this template better for the entire Polymarket developer community!

---

Questions? Open a discussion or reach out to the maintainers!
