# FairShare 🤝✨

**FairShare** is a modern, offline-first web application designed to help university students and teams divide group tasks fairly and efficiently. Forget the hassle of manual delegation—FairShare uses a smart algorithm to balance the workload based on task effort scores, ensuring everyone contributes equally. 🎓💼

<div align="center">
  
  <br/>
  <br/>
  <a href="https://ampsoria.github.io/FairShare/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Try_Live_Demo-6366f1?style=for-the-badge" alt="Live Demo" />
  </a>
</div>

## 📸 Demo (ตัวอย่างการใช้งาน)

<div align="center">
  <img src="public/demo.png" alt="FairShare Demo" width="100%" />
</div>

## ✨ Features (จุดเด่น)

- 🏢 **Project Workspaces:** Create dedicated workspaces for different subjects, group projects, or assignments.
- 👥 **Member Management:** Easily add team members to your workspace with beautiful avatars.
- 🧠 **Smart Task Assignment:** Add tasks with customizable "Effort Scores" (1-5), deadlines, and recurrence. Our algorithm automatically assigns tasks to members to balance the overall workload.
- 📴 **Offline First:** Built with `Zustand` and `localStorage`, the app works 100% offline. No database connection required. Your data stays securely on your device.
- 🎨 **Premium Modern UI:** Enjoy a beautiful, highly responsive interface featuring Glassmorphism, animated Aurora backgrounds, and micro-interactions powered by Framer Motion.

## 🛠 Tech Stack (เทคโนโลยีที่ใช้)

- **Framework:** React 18 ⚛️
- **Language:** TypeScript 📘
- **Bundler:** Vite ⚡
- **Styling:** Tailwind CSS + Vanilla CSS (Custom Design System) 💅
- **State Management:** Zustand (with Persist Middleware) 🐻
- **Animations:** Motion (Framer Motion) 🎬
- **Icons:** Lucide React 🔶

## 🚀 Getting Started (วิธีติดตั้งและใช้งาน)

To get a local copy up and running, follow these simple steps:

### 📋 Prerequisites

Make sure you have Node.js installed on your machine. 📦

### 💻 Installation

1. **Clone the repository** (or download the source code):
   ```bash
   git clone https://github.com/Ampsoria/FairShare.git
   ```
2. **Navigate into the project directory**:
   ```bash
   cd FairShare
   ```
3. **Install the dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. **Open your browser** and visit `http://localhost:5173/` to use the app! 🌐

## 💡 How it works (Algorithm) ⚙️

FairShare uses a greedy algorithm approach to balance tasks:
1. 📝 Tasks are sorted by their **Effort Score** (highest to lowest).
2. 🔄 The algorithm iterates through the tasks and assigns each task to the member who currently has the **lowest total effort score**.
3. ⚖️ This ensures that no single member is overloaded with heavy tasks while others do the light ones.

## 📱 Future Roadmap 🗺️

- 🌐 Real-time collaboration via Firebase (Integration is pre-structured in `src/firebase/`).
- 📄 Export task assignments as PDF or image.
- ✅ Task completion tracking and progress bars (Already partially implemented!).

## 📄 License 📜

This project is open-source and available under the [MIT License](LICENSE). 🔓

---
*Designed and built with ❤️ to end group work disputes.* ✨
