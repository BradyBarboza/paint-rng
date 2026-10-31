PAINT RNG FINAL VERSION

RUN IT
Open index.html in a modern browser. No installation or build step is needed.
Keep index.html, style.css, script.js and the assets folder together.

HOW TO PLAY
1. Click the dice. It selects a random palette colour and brush size (4–64 px).
2. Click and drag, or use a touch screen/stylus, to paint.
3. Roll again whenever you want a new colour and size. Earlier strokes stay.
4. Clear canvas asks for confirmation before removing the drawing.

The colour's hex value identifies the exact random result. There is no colour
picker or brush-size slider. Each brush roll excludes the previous size, so
consecutive sizes always differ. Colours come from a coordinated palette and consecutive colours differ. Brush previews are scaled
to fit the toolbar; the pixel label is
the actual brush width.

FILES AND HOW THEY WORK
index.html: the canvas, instructions, buttons, results and confirmation dialog.
style.css: fonts, colours, spacing and smaller-screen layouts.
script.js: random rolls, pointer events and Canvas 2D drawing.
assets/: the supplied dice image, Figma logo dot and local Nunito fonts.

JavaScript stores each stroke's points, colour and size. Pointer down starts a
stroke, pointer move adds line segments, and pointer up ends it. Stored strokes
are redrawn when the window changes size, so resizing does not erase the art.
Smaller windows can crop the visible drawing area; expanding reveals it again.
Refreshing or closing the page loses the unsaved canvas. Save drawing stores a
PNG snapshot in My gallery in this browser. Download PNG keeps a copy on your
computer. The gallery holds up to 12 drawings; when full or unavailable, saving
downloads the new image instead. Clearing browser data removes gallery entries.
Exports capture the visible canvas, without controls, on a white background.

TESTING COMPLETED
JavaScript syntax check; first roll; mouse dragging; rerolling with old strokes
preserved; different brush widths; clear confirmation and cancellation; and a
390 x 844 mobile viewport review. Physical touch-device testing is still useful.

PART 2 PEER REVIEW
Ask classmates to roll, draw, reroll and start over without explaining the UI.
Ask what was unclear, whether randomness was fun, and what they would improve.
Record their actual comments before writing the feedback-and-revisions report.
Suggested discussion topics are not a substitute for actual peer feedback.

GITHUB PAGES
These are static files suitable for GitHub Pages. Put index.html, style.css,
script.js and assets/ in the published folder of your assignment repository.
Published website: https://bradybarboza.github.io/paint-rng/
Repository: https://github.com/BradyBarboza/paint-rng

ASSET CREDITS
Design: your Paint RNG Figma mockup.
Dice: image supplied by you; confirm its original source/license for submission.
Nunito: Google Fonts, SIL Open Font License; see assets/FONT-LICENSE.txt.
