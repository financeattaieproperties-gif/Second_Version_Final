# Attaie Call Center — Windows Desktop App (`.exe`)

Installable desktop application for Call Center agents (`https://website.attaieproperties.com/callcenter/`).

Because this wrapper loads the Call Center workspace over HTTPS inside a dedicated Electron window:
- Firebase Authentication, session cookies (`SameSite=Strict`), and CSRF protection work identically to a browser.
- Call Center agents get a dedicated taskbar icon, system tray quick show/hide, single-instance lock, and instant switching between **V2 Testing** (`website.attaieproperties.com`) and **Live Production** (`attaieproperties.af`).

---

## Build the Windows `.exe` Installer

Run these commands on a **Windows PC** (recommended for NSIS & Portable `.exe`) inside `callcenter-desktop/`:

```bash
cd callcenter-desktop
npm install
npm run pack:win
```

Output installers appear inside `callcenter-desktop/release/`:
- **`Attaie Call Center Setup 2.0.0.exe`** — Standard Windows NSIS Installer (creates Desktop & Start Menu shortcuts)
- **`Attaie Call Center 2.0.0.exe`** — Single-file Portable `.exe` (no installation needed)

## Build the Website Admin `.exe` Installer

From `admin-panel/`:

```bash
cd admin-panel
npm install
npm run pack
```

Output installers appear inside `admin-panel/release/`:
- **`Attaie Admin Setup 1.0.0.exe`** — Standard Windows NSIS Installer
- **`Attaie Admin 1.0.0.exe`** — Portable `.exe`

Note: The packaged Website Admin `.exe` connects to `https://website.attaieproperties.com` by default and includes a **Change Server** option on the sign-in screen to switch to `https://attaieproperties.af`.
