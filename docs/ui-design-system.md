# Cosmediq Design System & UI Specifications

This document outlines the design language, color systems, typography tokens, layout grid rules, and component specs for Cosmediq.

---

## 🎨 Design Philosophy: Medical Calm & Trust

Cosmediq represents a departure from over-animated, flashing "startup" layouts. We focus on a premium, clean, medical-grade experience engineered to promote trust, clarity, and ease of use. 

### Core UI Guidelines
1. **Reduce Cognitive Fatigue:** Clean, balanced spacing with minimal visual noise. High contrast layout options to prevent eye strain during long-hour clinical shifts.
2. **Subtle Motion:** Animations are strictly utility-based (e.g., quiet dropdown slides, soft opacity shifts on page loads). No erratic rotations or layout-shifting hovers.
3. **Ergonomic Controls:** Large target tap points, clean labels, immediate visual state changes, and smart defaults to minimize clicks.

---

## 🎨 Color Palette & Design Tokens

Cosmediq features HSL-based design variables mapped natively to light and dark theme configurations.

```
🏥 Primary: Medical Emerald Teal (HSL 170 / 173) -> Trust, cleanliness, health
💙 Secondary: Calming Serene Blue (HSL 200 / 203) -> Focus, security, efficiency
🧡 Accent: Warm Coral (HSL 12) -> Alerts, badges, primary CTA highlights
🌑 Neutral: Cool Obsidians & Pure Grays -> Easy-on-the-eye reading surfaces
```

### 1. Light Mode Tokens
- **Background (`--background`):** Soft, cool gray-white (`hsl(210, 40%, 98%)` / `#f8fafc`)
- **Card Background (`--card`):** Pure white (`hsl(0, 0%, 100%)`)
- **Primary Teal (`--primary`):** Calming medical teal (`hsl(170, 75%, 35%)` / `#0d9488`)
- **Secondary Blue (`--secondary`):** Rich clinical blue (`hsl(203, 80%, 40%)` / `#0284c7`)
- **Foreground Text (`--foreground`):** Slate gray (`hsl(222, 47%, 11%)` / `#0f172a`)
- **Muted Border (`--border`):** Off-white gray (`hsl(214, 32%, 91%)` / `#e2e8f0`)

### 2. Dark Mode Tokens
- **Background (`--background`):** Obsidian Slate (`hsl(222, 47%, 4%)` / `#030712`)
- **Card Background (`--card`):** Dark slate Obsidian (`hsl(222, 47%, 7%)` / `#0b0f19`)
- **Primary Teal (`--primary`):** Light Medical Emerald (`hsl(172, 80%, 45%)` / `#14b8a6`)
- **Secondary Blue (`--secondary`):** Bright slate blue (`hsl(200, 85%, 55%)` / `#38bdf8`)
- **Foreground Text (`--foreground`):** Crisp cool gray (`hsl(210, 40%, 98%)` / `#f8fafc`)
- **Muted Border (`--border`):** Dark obsidian gray (`hsl(217, 32%, 17%)` / `#1e293b`)

---

## 🔤 Typography System

We use clean, highly readable modern sans-serif typography. For headers and interfaces, we utilize a combination of Outfit (rounded, friendly yet clinical) and Inter (premium clarity for text).

- **Heading 1 (`h1`):** `32px` / `2rem` — Bold, premium, well-spaced
- **Heading 2 (`h2`):** `24px` / `1.5rem` — Semi-bold, calm transitions
- **Heading 3 (`h3`):** `20px` / `1.25rem` — Medium weight
- **Body Text (`body`):** `16px` / `1rem` — Regular weight, `line-height: 1.6` for low eye strain
- **Interface/Label:** `14px` / `0.875rem` — Medium weight, high contrast

---

## 🧩 Reusable Core UI System

All custom pages inside Phase 1 use consistent component variables:
- **Buttons (`Button`):** Styled with rounded-xl corners, smooth hover effects, transition-all timers, and calm teal borders.
- **Form Inputs (`Input`):** Clean borders, soft focus glow (emerald shadows), and explicit labels.
- **Glassmorphism Header (`Navbar`):** Transparent glass effect (`backdrop-blur-md` and `bg-background/80`) that stays static on top of the web page.
- **Cards (`Card`):** Modern rounded boundaries (`rounded-2xl`) with subtle border shadows and transparent offsets.
