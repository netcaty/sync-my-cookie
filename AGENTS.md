# SyncMyCookie - Agent Guidelines

This document provides essential information for agentic coding assistants working on the SyncMyCookie Chrome extension.

## Build/Lint/Test Commands

### Primary Build Commands
- `yarn dev:verify` - Verify changes by running webpack build (REQUIRED after every code change)
- `yarn dev:chrome` - Development build with file watching for Chrome extension development
- `yarn dev:web` - Start webpack dev server for web-based testing
- `yarn build` - Create production build in `build/` directory
- `yarn clean` - Remove all files from `build/` directory

### Code Quality
- `yarn lint` - Run TSLint (currently echoes "lint disabled")

### Testing
No automated test framework is currently configured. Manual testing is recommended:
1. Run `yarn dev:verify` to verify changes compile
2. Load unpacked extension from `build/` directory in Chrome
3. Test cookie synchronization features manually
4. Verify auto-merge and auto-push functionality

### Development Workflow
1. Make changes to TypeScript/React source files in `src/`
2. Run `yarn dev:verify` to verify changes compile successfully
3. Load unpacked extension from `build/` in Chrome for testing
4. Commit changes after verification passes

## Code Style Guidelines

### Imports & Dependencies
- Use ES6 import syntax
- Group imports logically: React/ReactDOM first, then third-party libraries, then local utilities
- Prefer absolute imports over relative imports when possible
- Import types explicitly from TypeScript definition files

```typescript
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'antd';
import { getDomain } from '../utils/utils';
import { chromeUtils } from '../utils/chrome';
```

### Formatting & Style
- Use single quotes for string literals
- Include trailing commas in multiline object/array literals
- 2-space indentation
- Maximum line length: follow TSLint defaults

### TypeScript Conventions
- Enable strict mode (already configured)
- Define interfaces for all component props and state
- Use proper typing for Chrome extension APIs
- Avoid `any` type; use specific types or union types

```typescript
interface PopupState {
  isSetting: boolean;
  currentDomain: string;
  domainList: string[];
}

interface AutoConfiguration {
  autoPush: boolean;
  autoMerge: boolean;
  autoPushName: string[];
}
```

### React Patterns
- Use class components with TypeScript interfaces
- Initialize async operations in `componentDidMount`
- Bind event handlers as arrow functions in class properties
- Use Ant Design components for consistent UI

```typescript
class Popup extends Component<{}, State> {
  private handleDomainChange = async (domain: string) => { };

  public async componentDidMount() { }
}
```

### Naming Conventions
- **Variables/Functions**: camelCase
- **Components/Interfaces**: PascalCase
- **CSS Modules**: kebab-case
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case for utilities, PascalCase for components

### Error Handling
- Use try/catch blocks for async operations
- Handle Chrome API errors through promise rejections or callbacks
- Display user-friendly error messages using Ant Design Modal components
- Log errors for debugging but never expose sensitive data

### Security Best Practices
- Never log sensitive data (tokens, passwords, cookies, personal information)
- Use HTTPS for all external API calls
- Encrypt sensitive data before storage using KevastEncrypt
- Validate user input and sanitize data from external sources

### Chrome Extension Patterns
- Use promises for Chrome API calls instead of callbacks where possible
- Handle asynchronous operations properly in background scripts
- Store extension state using chrome.storage APIs
- Follow Chrome extension manifest v2 conventions

## Project Structure
```
src/
├── components/     # Reusable React components
├── utils/         # Utility functions and Chrome API wrappers
├── popup.tsx      # Main popup component
├── options.tsx    # Options/settings page
└── background.ts  # Background script for auto features

build/             # Compiled output (webpack destination)
assets/            # Static assets (icons, etc.)
scripts/           # Build helper scripts
```

## Key Dependencies & Libraries
- **React 16.8+** with TypeScript for UI components
- **Ant Design** for consistent component library
- **Kevast** ecosystem for encrypted storage (Chrome local/sync + GitHub Gist)
- **Lodash** for utility functions
- **Webpack 4** with Babel for TypeScript compilation

This codebase prioritizes security, type safety, and user experience while maintaining clean, maintainable TypeScript code.
