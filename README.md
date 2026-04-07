# NedAI App Shell

`nedai-app` is the client shell for the future server-backed NedAI experience.

## Current scope

- Branded splash, auth flow, chat-style home screen, sidebar, and settings screen
- Local mock auth state with persisted chat history
- No on-device runtime integrations or bundled local data packs

## Run locally

```bash
bun install
bunx expo start
```

## Backend status

The app shell now expects the server API to be available through `EXPO_PUBLIC_API_URL`.
