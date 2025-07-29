# ThreePlayer Components

This directory contains the modular components for the 3D scene player.

## Component Structure

### Main Components

- **`ThreePlayer.tsx`** - Main component that orchestrates the 3D scene
- **`SceneContent.tsx`** - Handles the 3D scene logic, camera transitions, and script processing
- **`SelectorObject.tsx`** - Individual 3D selector objects with transmission material
- **`DetailView.tsx`** - Overlay component for displaying section details

### Utility Files

- **`types.ts`** - TypeScript interfaces and type definitions
- **`utils.ts`** - Utility functions and constants (camera configs, dispatch helper)
- **`index.ts`** - Barrel export file for clean imports

## Usage

```tsx
import { ThreePlayer } from './components';

// Use the main component
<ThreePlayer 
  width={800} 
  height={600} 
  projectData={projectData} 
/>
```

## Component Responsibilities

### ThreePlayer
- Main wrapper component
- Handles window sizing and client-side rendering
- Manages selected section state
- Renders Canvas and layout

### SceneContent
- Loads and manages 3D scene data
- Handles camera transitions between views
- Processes Three.js scripts
- Manages selector object rendering
- Handles user interactions and events

### SelectorObject
- Renders individual 3D objects with transmission material
- Handles hover effects and animations
- Displays tooltips
- Manages click interactions

### DetailView
- Displays section information overlay
- Handles modal animations
- Provides back navigation

## File Organization Benefits

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Components can be easily reused or tested independently
3. **Maintainability** - Easier to locate and modify specific functionality
4. **Type Safety** - Centralized type definitions ensure consistency
5. **Clean Imports** - Barrel exports provide clean import statements
