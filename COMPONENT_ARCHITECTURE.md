# Component Architecture

This document outlines the component architecture in the Motora application.

## Feature-First Architecture

The application follows a feature-first architecture pattern, where components are organized by feature rather than by type. This helps to:

1. Keep related code close together
2. Make features more self-contained
3. Improve maintainability and scalability

## Component Structure

### Features Directory

The `src/features` directory contains feature-specific components, organized by domain:

- `features/brands` - Brand-related components and logic
- `features/categories` - Category-related components and logic
- `features/products` - Product-related components and logic
- `features/auth` - Authentication-related components and logic

Each feature module exports its components through an `index.ts` file, making them easily importable from other parts of the application.

### Components Directory

The `src/components` directory contains shared UI components that are not specific to any particular feature:

- `components/layout` - Layout components (AppLayout, Sidebar, etc.)
- `components/tabs` - Tab components for different views
- `components/ui` - Shared UI components (modals, notifications, etc.)

## Import Patterns

To maintain clean imports, the application follows these patterns:

1. Feature components are imported directly from the feature module:
   ```typescript
   import { ProductCard, ProductList } from '../../features/products';
   ```

2. Shared UI components are imported from the components directory:
   ```typescript
   import { Notification, Dashboard } from '../../components/ui';
   ```

3. Types can be imported from the feature module or from a central types directory:
   ```typescript
   import { Product, SortConfig } from '../../features/products';
   // or
   import { User } from '../../types';
   ```

## Best Practices

1. Keep feature-specific components within their feature directory
2. Share common components in the components directory
3. Avoid duplicating component logic or creating wrapper components
4. Export components through index files to maintain clean imports 