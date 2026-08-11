# MOS mobile source

This directory preserves the MOS lessons and mock-exam modules for a future mobile-specific source.

It is intentionally outside the web app's `src` directory. The current Vite/TypeScript build does not import, compile, or bundle these files, and the `/mos-lessons` and `/mos-exams` routes are no longer registered.

Contents:

- `pages/mosLessons`: MOS lesson workspace and lesson data
- `pages/mosExams`: MOS mock exams and PDF export logic
- `mos.css`: styles used only by the removed MOS screens

The preserved modules are a source snapshot, not a standalone mobile application. They still use React and Ant Design and can be adapted when the mobile app structure is defined.
