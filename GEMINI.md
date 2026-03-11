# GEMINI.md

## Project Overview
This project, **mylink**, contains a Next.js application named **my-profile**. It is a modern web application bootstrapped with `create-next-app`, utilizing the latest React and Next.js features.

### Core Technologies
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Linting:** [ESLint](https://eslint.org/)
- **Fonts:** Geist and Geist Mono via `next/font`

## Project Structure
The primary application code is located in the `my-profile/` directory:

- `my-profile/app/`: Contains the App Router components, layouts, and global styles.
  - `layout.tsx`: Root layout defining the HTML structure and global fonts.
  - `page.tsx`: The main landing page component.
  - `globals.css`: Global CSS and Tailwind directives.
- `my-profile/public/`: Static assets like SVG icons and logos.
- `my-profile/next.config.ts`: Next.js configuration.
- `my-profile/package.json`: Project dependencies and scripts.

## Building and Running
Commands should be executed from within the `my-profile/` directory.

### Development
Run the development server with hot-reloading:
```bash
npm run dev
```

### Build
Build the application for production:
```bash
npm run build
```

### Production Start
Start the production server after building:
```bash
npm run start
```

### Linting
Run ESLint to check for code quality issues:
```bash
npm run lint
```

## Development Conventions
- **App Router:** Follow Next.js App Router conventions (e.g., `page.tsx` for routes, `layout.tsx` for shared layouts).
- **Styling:** Use Tailwind CSS 4 utility classes for styling.
- **TypeScript:** Ensure all new components and functions are properly typed.
- **Formatting:** Adhere to the project's ESLint configuration for consistent code style.
