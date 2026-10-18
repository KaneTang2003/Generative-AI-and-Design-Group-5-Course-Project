# Idea Atlas - sharing package

This archive contains the website source, server-side AI clustering route, UI and layout, fixed demo dataset, example TXT upload, dependency manifests, and build configuration. Private API keys, Git history, installed dependencies, personal browser projects, and local runtime caches are excluded.

## Open the working website
https://idea-atlas-clustering.doretscheltema.chatgpt.site/

## Try the full demo without an API key
https://idea-atlas-clustering.doretscheltema.chatgpt.site/?demo=flow
The demo starts with 34 example ideas, plays clearly labelled simulated loading stages, and opens a fixed result with 15 clusters and 4 themes. Results can be edited and downloaded. Restart demo resets the example.
Direct result preview: https://idea-atlas-clustering.doretscheltema.chatgpt.site/?demo=1

## Run the source locally
Requires Node.js 22.13 or newer and npm.
1. Extract the ZIP and open a terminal in the idea-atlas folder.
2. Run: npm ci
3. For real AI clustering, copy .env.example to .env.local and replace the placeholder with your own Gemini API key. Keep this file private. The demo does not require a key.
4. Run: npm run dev
5. Open the Local URL printed by the server. Append /?demo=flow for the full demo.
Production build: npm run build
Local production preview after building: npm start

The app uses React, TypeScript, Vinext/Vite, and Cloudflare Worker tooling. Windows Application Control blocked the normal Worker preview on the original development computer; that is an environment-specific limitation. This source package has not been reinstalled and tested on a second computer.

## Deploy your own copy
This is a source handover, not an installer or a self-contained desktop application.
The included .openai/hosting.json deliberately omits the original Site ID. Create a new Site/deployment and configure its own project identity and server-side GEMINI_API_KEY. Do not use the original owner's deployment or credentials.
Gemini availability, limits and model access depend on your account. GEMINI_MODEL can be configured on the server.

## Using the tool
- Paste ideas or upload UTF-8 .txt/.csv, up to 250 ideas.
- Optionally request a number of clusters.
- Open themes/clusters, zoom and pan, and click idea nodes for their full original wording.
- All cards includes a Move to menu; moving changes only that instance.
- Add themes/clusters, rename them using the options menu, and export TXT or JSON.
- Projects save automatically in the same browser under Previous projects. This archive does not contain those browser-saved projects. Export each board separately if you want to share its contents.
- JSON downloads contain board data. Re-importing exported boards is not currently implemented.

## Files
app/: screens, cards, loading states and API route
lib/: parsing, validation, clustering rules, map layout, exports and demo board
public/demo-ideas.txt: example input file
.env.example: placeholder configuration; no private key
package.json and lockfiles: dependencies and scripts

The practice-reference upload UI was removed at the owner's request; older supporting reference-processing code may remain in the source. Demo stages are simulated; real requests use server processing updates.
