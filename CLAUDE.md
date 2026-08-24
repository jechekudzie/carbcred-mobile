# CarbCred Mobile (Expo)

This repository is the **CarbCred Africa mobile app** — Expo (React Native) +
TypeScript. It is a client of the CarbCred platform API; the Laravel backend lives in
`/Users/mac/Herd/carbcred-system` and is owned by a separate Claude session.

## Read these first, in order

1. **The product contract** — audiences, brand, API surface, build order, screen map,
   kickoff checklist:
   `/Users/mac/Herd/carbcred-system/docs/MOBILE_APP_GUIDE.md`
2. **The house tech stack & setup guide** — follow it verbatim for packages, project
   structure, and configuration:
   `/Users/mac/Desktop/Coding Apps/React Native Documentation/react-native-tech-stack-guide.md`

The product contract is shared with the backend: when you need an endpoint that does
not exist, add it to its §5 list and tell the user so the backend session builds it.
Never invent or mock a production endpoint silently.

## Ground rules

- Stack per the house guide: Expo SDK ~54 + TypeScript, React Navigation
  (native-stack + bottom-tabs), TanStack Query + persist-client + axios, zustand,
  react-hook-form + zod, AsyncStorage + expo-secure-store, NativeWind v4,
  lucide-react-native, netinfo → onlineManager. Dark mode from day one.
- Backend: local `https://carbcred-system.test`, live test
  `https://carbcred-system.on-forge.com`. API under `/api/v1`, Sanctum bearer tokens.
- Test sign-ins (password `password`): admin@carbcredafrica.co.zw,
  staff@carbcredafrica.co.zw, ops@gwatera.co.zw.
- Brand: forest `#0e2b1e`, leaf `#a6c443`, deep leaf `#176034`, cream `#faf7f1`,
  sand `#f4efe4`, ink `#23241f`. Montserrat for display type. Assets:
  `carbcred-system/public/brand_assets/`.
- Enum values, statuses and permissions always come from the API — never hardcoded.
- Keep UX simple and straightforward: one obvious path per job, shallow navigation.
- Commit in small slices with clear messages.
