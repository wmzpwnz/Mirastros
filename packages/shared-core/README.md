# @mirastros-universal/shared-core

Shared core library for Mirastros Universal platform.

## Features

- API client for backend communication
- Storage abstraction (localStorage/AsyncStorage)
- TypeScript interfaces for data models
- Redux store configuration
- Utility functions

## Usage

```typescript
import { MirastrosAPI, IStorage } from '@mirastros-universal/shared-core';

// Initialize API client
const api = new MirastrosAPI('http://localhost:8000');

// Use storage abstraction
const storage: IStorage = new WebStorage(); // or MobileStorage()
```
