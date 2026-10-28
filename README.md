# REAL TENNIS ARENA

A new browser-based 3D tennis game project. This repository is independent from previous game projects.

## Current foundation

- Babylon.js-powered 3D arena
- App-style home, match setup, settings, and gameplay HUD
- HTML, CSS, and JavaScript separated
- Landscape-first responsive layout
- Keyboard and touch input foundation
- Stylized procedural placeholder athletes and tennis court
- Initial ball motion prototype

## Important status note

This is the first foundation build, not a finished tennis game. The current player models are procedural placeholders, not final rigged character assets. Full racket-to-ball collision, tennis rules, polished animations, complete singles/doubles AI, and online multiplayer remain future milestones.

## Run locally

Open `index.html` through a local web server or publish the repository with GitHub Pages. The Babylon.js library is currently loaded from its official CDN, so an internet connection is required. For a production build, pin and bundle dependencies rather than relying on an unversioned CDN.

## GitHub Pages

In repository Settings → Pages, publish from the `main` branch and the root folder.

## Structure

- `index.html` — app screens and entry point
- `css/main.css` — responsive app UI and HUD
- `js/scene.js` — Babylon.js scene, court, lights, placeholder athletes
- `js/main.js` — navigation, input, prototype game loop

## Planned milestones

1. Validate scene and responsive layout.
2. Replace placeholder athletes with suitable rigged 5–6-head stylized GLB characters.
3. Implement racket collision, shot types, serve, bounces, net/out detection, and scoring.
4. Implement CPU positioning and complete singles/doubles rules.
5. Add polished animations, audio, settings persistence, and performance profiling.
6. Consider online multiplayer after local match logic is stable.
