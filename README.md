#Project Name
AI SUMMARIZE(TEAM NAME:ALGORITHM PIONEERS)
#Problem Statement
Build an AI research assistant to help students explore and summarize content
Explain clearly what problem your project is solving.

#Project Description
Farmers face significant challenges in accessing real-time and predictive market insights, leading to poor pricing decisions and reduced income. Due to a lack of awareness about price fluctuations, demand trends, and optimal selling locations, farmers often sell their produce at suboptimal prices.

There is a need for an intelligent system that leverages AI and data analytics to provide farmers with accurate price predictions, demand insights, and actionable recommendations to maximize their profits and reduce uncertainty in agricultural markets.
## Google AI Usage
### Tools / Models Used
- 

### How Google AI Was Used
Explain clearly how AI is integrated into your project.

---

## Proof of Google AI Usage
Attach screenshots in a /proof folder:

![AI Proof](https://drive.google.com/file/d/1jT_lplSc78Y2aFsj1yk7vWi0uWZakOzk/view?usp=sharing))
https://drive.google.com/file/d/1AsYSELpQvX-NRGIiki_g6KsqAchABABI/view?usp=sharing
---

## Screenshots 
Add project screenshots:

![Screenshot1](https://drive.google.com/file/d/1cGqYwUIBXEoPcSxNP136g0mtyUQImNQG/view?usp=sharing)  
![Screenshot2](https://drive.google.com/file/d/1gTxtctYB3S--s_R_p1f8WTGseq89RD6q/view?usp=sharing)

---

## Demo Video
Upload your demo video to Google Drive and paste the shareable link here(max 3 minutes).
[Watch Demo](#)

---

## Installation Steps

```bash
# Clone the repository
git clone <your-repo-link>

# Go to project folder
cd project-name

# Install dependencies
npm install

# Run the project
npm start











# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
