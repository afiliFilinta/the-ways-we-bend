# The Ways We Bend

An interactive web experience about the straight lines we are taught to follow
and the curves that shape who we become.

The experience invites you to complete a series of guided drawing exercises.
Your lines are evaluated as the rules gradually loosen, leading into a short
scroll-based story about imperfection, change, and individuality.

## Run locally

You will need [Node.js](https://nodejs.org/) `20.19+` or `22.12+`.

```bash
git clone git@github.com:afiliFilinta/the-ways-we-bend.git
cd the-ways-we-bend
npm install
npm run dev
```

Open the local URL printed by Vite.

To create and preview a production build:

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Built with

- [Three.js](https://threejs.org/) for the interactive 3D drawing scene
- [Vite](https://vite.dev/) for local development and production builds
- Web Audio API for responsive pencil sounds

## Project structure

- `index.html` — interface and story content
- `main.js` — drawing interaction, scoring, animation, and audio behavior
- `style.css` — visual system and responsive layout
- `public/audio/` — soundtrack, sound effects, and their license notes

## Credits

Designed and developed by [Muzaffer Karsli].

Audio:

- “Swirl, Pencil, Drawing sound effect” by BeeProductive, used under the
  [Pixabay Content License](https://pixabay.com/service/license-summary/)
- “Contemplation,” likely by Joth, listed as
  [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)

See [`public/audio/LICENSES.md`](public/audio/LICENSES.md) for source links,
checksums, and the verification note for “Contemplation.”
