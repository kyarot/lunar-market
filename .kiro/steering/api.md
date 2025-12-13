---
inclusion: fileMatch
fileMatchPattern: "src/lib/**/*.ts"
---

# API Integration Guidelines

## Error Handling
- Always wrap API calls in try/catch
- Provide fallback data when APIs fail
- Log errors to console for debugging
- Show user-friendly error messages

## Caching
- Cache API responses to reduce calls
- Use appropriate cache durations (5 min for insights, longer for static data)
- Clear cache when relevant data changes

## Rate Limiting
- Alpha Vantage: 5 calls/minute, 25 calls/day (free tier)
- Mistral AI: Check current limits
- Implement request queuing if needed

## Response Types
- Define TypeScript interfaces for all API responses
- Use strict typing for data transformations
- Validate response data before using

## Example Pattern
```typescript
export async function fetchData(): Promise<DataType | null> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return transformData(data);
  } catch (error) {
    console.error("API error:", error);
    return null;
  }
}
```
