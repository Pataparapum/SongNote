# AGENTS.md

## Project Shape
- Expo SDK 54 React Native app using Expo Router; `package.json` entrypoint is `expo-router/entry`.
- Routes live under `app/`; `app/_layout.tsx` defines the root stack and `app/(tabs)/_layout.tsx` defines the tab navigator.
- Shared UI/hooks/constants are in `components/`, `hooks/`, and `constants/`; imports can use the `@/*` alias from `tsconfig.json`.

## Commands
- Install with `npm install`; `package-lock.json` is the lockfile, so do not switch package managers.
- Start dev server: `npm start` or `npx expo start`.
- Platform shortcuts: `npm run android`, `npm run ios`, `npm run web`.
- Lint: `npm run lint` (`expo lint`, ESLint flat config from `eslint-config-expo`; `dist/*` is ignored).
- Typecheck: `npx tsc --noEmit` (strict TypeScript is enabled, but there is no package script for this).
- There is no configured test script or CI workflow in this repo.

## Expo / React Notes
- `app.json` enables `experiments.typedRoutes` and `experiments.reactCompiler`; avoid adding unnecessary `useMemo`/`useCallback` unless the codebase pattern or a measured issue requires it.
- `app.json` sets `newArchEnabled: true`, portrait orientation, automatic light/dark UI style, static web output, and scheme `songchord`.
- `react-native-reanimated` is imported in `app/_layout.tsx`; keep it loaded at the root when changing navigation/bootstrap code.

## Gotchas
- `npm run reset-project` is an interactive destructive starter-template script: it moves or deletes `app`, `components`, `hooks`, `constants`, and `scripts`. Do not run it unless explicitly requested.
- VS Code settings request explicit source fixes, import organization, and member sorting on save; expect formatting/import churn from user edits.

## About the app
- SongNote is a musician note app, focus on save the lyrics and chord what musician learn, the idea is that a musician can write or paste a song and easily set any chord of the song in any part of the song, `assign` a  `home note` and it respective `scale`, with the posibility of change the `home note`, changing the assigned `chords` for the equivalend in the new `scale`.
- The app is a monolitic app with modular architecture, multiplatform, without database, is going to save the diferent note in txt local archive, with the posibility of connect a drive service for save there the songs.
- The app is minimalist and easy for use

## Architecture
- **app/**
    - **pages/** 
    - **modules/**
    - **components/**
    - **UI/**

## Dependencies
- Material UI for the ui
- Nativewind for the style





