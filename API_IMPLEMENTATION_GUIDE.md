# API Implementation Guide

## Overview
This implementation follows the Motora MDC rules by:
1. Implementing a structured API service with axios
2. Organizing API calls in a centralized location
3. Using TypeScript for type safety

## Complete API Structure

The API implementation follows a structured pattern:

```
src/
├── services/
│   └── api/
│       ├── axios-client.ts  # Axios client with interceptors
│       ├── index.ts         # API endpoint functions
│       └── types.ts         # TypeScript interfaces
└── hooks/
    └── useApi.ts            # React hook for API operations
```

## URL Structure

**Important**: The `axios-client.ts` file sets the baseURL to `/api` (or the value from REACT_APP_API_URL). This means:

1. In the `index.ts` file, all API endpoint paths should be relative to this base URL:
   - Correct: `/products` (becomes `/api/products`)
   - Incorrect: `/api/products` (becomes `/api/api/products` which causes 404 errors)

2. Never prefix your API paths with the API_URL in the `apis` object. The baseURL setting in axios-client already handles this.

## Steps to Update Docker Container

Since this is a Docker project, you need to rebuild the container to include the new dependencies:

```bash
# Use the provided rebuild script to update dependencies and rebuild
./rebuild-docker.sh
```

The script will:
1. Stop existing containers
2. Add required dependencies if missing
3. Update tsconfig.json if needed
4. Rebuild and restart the containers

## TypeScript Dependencies

Make sure you have the necessary TypeScript dependencies in your package.json:

```json
"dependencies": {
  "@types/node": "^18.15.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "axios": "^1.6.2"
}
```

And ensure your tsconfig.json has node types included:

```json
{
  "compilerOptions": {
    "types": ["node", "react", "react-dom"]
  }
}
```

## Using the API Service

The API service can be used in your components through the useApi hook:

```tsx
import { useApi } from '../hooks/useApi';
import { useState, useEffect } from 'react';

const MyComponent = () => {
  const { fetchData, products, isLoading, error } = useApi();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.tipeMotor}</div>
      ))}
    </div>
  );
};
```

## Available API Operations

The useApi hook provides the following operations:

```typescript
const {
  // Data
  products,       // Array of products
  categories,     // Array of categories
  brands,         // Array of brands
  
  // Status
  isLoading,      // Boolean loading state
  error,          // Error message or null
  
  // Operations
  fetchData,      // Fetches all data (products, categories, brands)
  
  // Product operations
  addProduct,     // Adds a new product
  updateProduct,  // Updates an existing product
  deleteProduct,  // Deletes a product
  
  // Category operations
  addCategory,    // Adds a new category
  updateCategory, // Updates an existing category
  deleteCategory, // Deletes a category
  
  // Brand operations
  addBrand,       // Adds a new brand
  updateBrand,    // Updates an existing brand
  deleteBrand     // Deletes a brand
} = useApi();
```

## Troubleshooting

If you encounter 404 errors like:
```
XHRGET https://your-domain.com/api/api/products [HTTP/2 404]
```

This indicates double `/api` prefixing. Check:
1. That `axios-client.ts` has the correct baseURL (usually `/api`)
2. That API endpoints in `index.ts` don't repeat this prefix

## Adding New API Endpoints

To add a new API endpoint:

1. Add the appropriate types to `src/services/api/types.ts`
2. Add the API function to `src/services/api/index.ts` (remember to use paths relative to baseURL)
3. Add a corresponding operation in `src/hooks/useApi.ts`

For example, to add a search feature:

```typescript
// In types.ts
export interface SearchParams {
  query: string;
  category?: number;
}

// In index.ts
export const apis = {
  // ... existing APIs
  searchProducts: (params: SearchParams) => 
    axiosClient.get<Product[]>('/products/search', { params })  // Note: no /api prefix
};

// In useApi.ts
const searchProducts = useCallback(async (params: SearchParams) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await apis.searchProducts(params);
    return response.data;
  } catch (err) {
    setError('Search failed');
    return [];
  } finally {
    setIsLoading(false);
  }
}, []);

// Add to return value
return {
  // ... existing returns
  searchProducts
};
```

This implementation complies with the Motora MDC rules for Docker projects and API structure.