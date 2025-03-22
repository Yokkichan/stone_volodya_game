# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


This update includes the new project structure, which provides a clear overview of how the `src` directory is organized.
## Project Structure

The `src` directory is organized as follows:

```src/
├── assets/
│   ├── boost/        # Boost-related images
│   ├── bot_menu/      # Bottom Menu-related icon
│   ├── earn/           # Earn-related
│   ├── frens/          # Friend-related images
│   ├── ranks/           # Rank icons
│   └── ...              # Other assets
├── components/
│   ├── BottomNav.tsx
│   ├── ConfirmModal.tsx
│   └── Layout.tsx
├── pages/
│   ├── AirdropPage.tsx
│   ├── BoostsPage.tsx
│   ├── EarnPage.tsx
│   ├── FriendsPage.tsx
│   ├── LeaderboardPage.tsx
│   └── MainPage.tsx
├── store/
│   ├── slices/
│   │   ├── gameSlice.ts
│   │   └── userSlice.ts
│   ├── game.ts
│   └── index.ts
├── styles/
│   ├── airdrop-page.css
│   ├── boosts-page.css
│   ├── bottom-nav.css
│   ├── confirm-modal.css
│   ├── earn-page.css
│   ├── friends-page.css
│   ├── layout.css
│   ├── leaderboard-page.css
│   └── main-page.css
├── utils/
│   ├── api.ts
│   ├── socket.ts
│   └── telegram.ts
├── App.css
├── App.tsx
├── index.css
└── main.tsx
```


## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
