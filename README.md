# Time Tracker - React + TypeScript + Vite

A modern time tracking application built with React, TypeScript, and Vite, following Clean Architecture principles.

## 🏗️ Architecture

This project follows Clean Architecture principles with a clear separation of concerns:

```
src/
├── application/         # Business logic (use cases)
│   └── useCases/       # Application-specific business rules
├── domain/             # Core entities and types
│   └── types.ts        # Domain types and interfaces
├── infrastructure/     # Data storage layer
│   └── storage/        # Local storage, API handlers
├── presentation/       # UI components and pages
│   ├── components/     # Reusable UI components
│   └── pages/         # Page components
├── shared/            # Reusable hooks, context, utils
│   ├── context/       # React context providers
│   ├── hooks/         # Custom hooks
│   └── constants/     # Application constants
├── App.tsx           # Main app component with routing
└── main.tsx          # Entry point
```

## 🚀 Features

- **React Router**: Navigation between dashboard, projects, timer, and settings
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS
- **Clean Architecture**: Separated concerns with clear boundaries
- **TypeScript**: Full type safety throughout the application
- **Local Storage**: Data persistence using browser storage

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Local Storage** - Data persistence

## 📦 Installation

```bash
npm install
```

## 🏃‍♂️ Development

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🧪 Architecture Principles

### Clean Architecture Layers

1. **Domain Layer** (`src/domain/`)
   - Contains business entities and types
   - No dependencies on external frameworks
   - Pure business logic

2. **Application Layer** (`src/application/`)
   - Contains use cases and business rules
   - Orchestrates domain entities
   - Handles application-specific logic

3. **Infrastructure Layer** (`src/infrastructure/`)
   - Data storage implementations
   - External API integrations
   - Framework-specific code

4. **Presentation Layer** (`src/presentation/`)
   - UI components and pages
   - User interaction handling
   - Visual representation

5. **Shared Layer** (`src/shared/`)
   - Reusable utilities, hooks, and context
   - Cross-cutting concerns
   - Common functionality

### Key Principles

- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Single Responsibility**: Each module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Interface Segregation**: Clients depend only on interfaces they use

## 🎨 UI Features

- **Sidebar Navigation**: Persistent navigation with active states
- **Dark Mode Toggle**: Seamless theme switching
- **Responsive Layout**: Works on desktop and mobile
- **Modern Design**: Clean, professional interface
- **Loading States**: Proper loading indicators
- **Error Handling**: Graceful error states

## 📱 Pages

- **Dashboard**: Overview with statistics and recent activity
- **Projects**: Project management with CRUD operations
- **Timer**: Time tracking with start/stop functionality
- **Settings**: Application configuration and preferences

## 🔧 Development Guidelines

1. **Keep logic out of components**: Use use cases in the application layer
2. **Type everything**: Use TypeScript interfaces for all data structures
3. **Follow naming conventions**: Clear, descriptive names
4. **Separate concerns**: UI, business logic, and data access are separate
5. **Testable code**: Write code that's easy to test
6. **Modern React**: Use functional components and hooks

## 🚀 Next Steps

- Implement real timer functionality
- Add project CRUD operations
- Implement data export/import
- Add notifications
- Add offline support
- Implement user authentication
- Add data visualization and charts
