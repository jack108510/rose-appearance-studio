# Rose concept room

The homepage is a personal review gallery of six distinct appearance directions: Halo, Petal, Signal, Companion, Ribbon, and Prism. Each changes the form and interaction presentation, rather than simply recoloring the original widget. Local visual examples animate the designs; shortlists are saved only in the current browser and can be copied into a conversation. These concepts do not change production Rose. The user decides which directions are developed and shipped.

The earlier editable appearance studio is preserved at `editor.html`.

A separate design workspace for trying Rose appearances. It starts with the approved smoky glass and copper orb, and includes Pearl, Onyx, and Copper presets. Tune accent color, glass opacity, blur, corners, orb size, and orb tint. Switch canvas backgrounds and visual voice states, view the supplied campaign references, save a browser-local draft, and export CSS.

This workspace never changes the brain demo or any live Rose configuration. It uses the simulated widget for visual controls and sample transcript only; no microphone, audio, chat API, or external actions are used. Saved drafts are local to each browser. No build dependencies are required.

Run `python3 -m http.server 8805 --bind 127.0.0.1` and visit http://127.0.0.1:8805/.

GitHub Pages serves the root of the main branch. Exported CSS expects `assets/rose-voice-reference.jpg` relative to the stylesheet for the original copper orb texture.
