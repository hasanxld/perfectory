import { readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

// All Solar icons actually used across the app.
const USED = [
  "hamburger-menu-broken",
  "bolt-bold",
  "logout-3-broken",
  "close-circle-broken",
  "user-circle-bold",
  "refresh-bold",
  "soundwave-bold",
  "arrow-left-broken",
  "crown-bold",
  "check-circle-bold",
  "stars-bold",
  "microphone-3-bold",
  "rocket-2-bold",
  "diskette-bold",
  "eye-bold",
  "danger-triangle-bold",
  "user-plus-bold",
  "bolt-circle-bold",
  "add-circle-bold",
  "clock-circle-bold",
  "arrow-right-broken",
  "magic-stick-3-bold",
  "pause-bold",
  "play-bold",
  "stop-bold",
  "user-speak-bold",
  "alt-arrow-down-bold",
  "info-circle-bold",
  "login-3-bold",
  "user-cross-bold",
  "home-2-bold",
  "lock-keyhole-bold",
  "notebook-bold",
  "pen-bold",
]

const solarPath = require.resolve("@iconify-json/solar/icons.json")
const full = JSON.parse(readFileSync(solarPath, "utf8"))

const icons = {}
const missing = []
for (const name of USED) {
  if (full.icons[name]) {
    icons[name] = full.icons[name]
  } else {
    missing.push(name)
  }
}

const subset = {
  prefix: full.prefix,
  icons,
  width: full.width,
  height: full.height,
}

writeFileSync(
  new URL("../lib/solar-icons.json", import.meta.url),
  JSON.stringify(subset),
)

console.log(`[icons] bundled ${Object.keys(icons).length}/${USED.length} icons`)
if (missing.length) console.log(`[icons] MISSING: ${missing.join(", ")}`)
