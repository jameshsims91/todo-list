# <img src="./images/transparent-logo.svg" alt="Logo" width="24" height="24" vertical-align="middle"> Nudge: High-Performance Component Task Workspace

A premium, modular, component-driven task workspace built with vanilla JavaScript, optimized with **Webpack 5**, and styled using high-contrast design tokens responsive to Light and System Dark modes. 

Live Deployment URL: [View Your Project Site](https://github.io)

---

## 🛠️ Integrated Core Features

### 📁 Dynamic Split-Pane Explorer Dashboards
* **Categorized Modules:** Dedicated views for **Projects**, **Personal Tasks**, and fluid **Anytime** entries utilizing shared local structural storage keys.
* **Granular Checklist State Persistence:** Checklist checkboxes save state variations directly back to `localStorage` cache maps on the fly.
* **Tactile Row Sequencing:** Integrated HTML5 drag-and-drop mechanics supporting desktop mouse grip controls and responsive mobile touch event trackers.

### ⏱️ Embedded Productivity Widgets
* **Interactive Pomodoro Sidebar Clock:** A 25/5 focus timer built using the hardware-accelerated **Web Audio API** to generate direct sound synthesizer frequencies natively.
* **HTML5 Web Notifications API:** Displays background system banner notification alerts even when navigating outside your workspace tab session.
* **Premium Custom Calendar Picker Dropdown:** A grid-cell element picker engine built utilizing `date-fns` to quickly clear or adjust milestones chronologically.

### 📱 Premium Mobile-First Layout
* **Sliding Drawer Sidebar Menu:** Responsive slide-out navigation tray toggle with integrated multi-directional screen touch swipe indicators.
* **Automated Overdue Triggers:** Background trace script checks date profiles on launch, converting overdue entries to high priority and pushing alerts to your **System Inbox**.
* **Global Search Hub:** Multi-column text search dashboard matching title text strings and short notes against active filters instantly.

---

## 🚀 Architectural Tech Stack

* **Core Engine:** Vanilla JavaScript (ES6+ Modules ECMAScript specification)
* **Date Manipulation Calculations:** `date-fns` (Strict Unicode standard tokens)
* **Build Compilation Bundle:** Webpack 5 + Webpack Dev Server + CSS Loaders
* **Database Disk Layer:** Client-side Web `localStorage` Array Engine API

---

## 💻 Local Installation & Setup

Ensure you have [Node.js](https://nodejs.org) installed locally on your system environment framework.

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd todo-list
   ```

2. **Install development dependencies:**
   ```bash
   npm install
   ```

3. **Ignite the Webpack hot-reloading development server:**
   ```bash
   npm run start
   ```
   Open your browser window to `http://localhost:8080/` to test changes live.

4. **Compile production-ready minified bundles:**
   ```bash
   npm run build
   ```

---

## 🌐 Automated Subtree Deployment Script

This project includes a single-line automated build pipeline shortcut configuration mapped into your `package.json`. It automates git branch navigation steps, updates deployment histories, and forces subfolder content updates directly onto the live web server hosting partition:

```bash
# 1. Push source modifications code to your repository main history
git add .
git commit -m "feat: your new feature note description summary"
git push origin main

# 2. Run the automated deployment shortcut sequence
npm run deploy
```

The script shifts branches, compiles your application code into the production `dist/` directory, pushes that specific subfolder cleanly using `git subtree push` up to your remote `gh-pages` tracking branch, and snaps you right back to `main` seamlessly.
