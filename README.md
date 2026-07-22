# 🌍 Smart Waste Manager

## 📑 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technologies Used](#3-technologies-used)
4. [System Architecture](#4-system-architecture)
5. [How the Project Works](#5-how-the-project-works)
6. [Key Algorithms & Logic](#6-key-algorithms--logic)
7. [Installation / Setup](#7-installation--setup)

---

## 1. Project Overview
**Smart Waste Manager** is an AI-driven, Gamified Platform for Efficient Waste Collection and Management.
It connects citizens, waste collectors, and system administrators to manage urban waste efficiently. It allows citizens to report waste locations using maps, enables collectors to find and clean up the waste, and provides admins with analytics.

---

## 2. Features
- **Role-Based Access Control:** Three distinct roles—Citizen, Collector, and Admin.
- **Interactive Mapping:** Users can drop pins on a map (Leaflet) to accurately report waste locations.
- **AI Fraud Prevention:** Integration with Google Gemini AI to analyze uploaded waste images and flag staged or fake photos.
- **Image Deduplication:** Prevents users from uploading the same waste image twice using SHA-256 hashing.
- **Gamification & Leaderboards:** Citizens and collectors earn points for reporting and collecting waste, fostering a competitive, green community.
- **Data Analytics Dashboard:** Admins get a comprehensive view of total waste collected, pending tasks, and user performance using Recharts.
- **Proof of Collection:** Collectors must upload an image as proof once the waste is cleared.

---

## 3. Technologies Used
- **Frontend / Fullstack Framework:** Next.js (React 19)
- **Programming Language:** TypeScript
- **Styling:** Tailwind CSS & Framer Motion
- **Database:** MongoDB (via Mongoose)
- **Authentication:** NextAuth.js (Auth.js) v5
- **AI Integration:** Google Generative AI (Gemini API)
- **Mapping:** React-Leaflet
- **Data Visualization:** Recharts

---

## 4. System Architecture
The system follows a Client-Server architecture hosted on a single Next.js Fullstack environment. The Next.js frontend communicates with Next.js App Route APIs, which interact with a managed MongoDB database.

**Data Flow:**
Citizen Uploads Image & Location -> API Hashes Image (Deduplication) -> API Sends to Gemini (Fraud Check) -> Saved to MongoDB as "Pending" -> Collector views on Map -> Collector updates to "Verified" with Proof.

---

## 5. How the Project Works
1. **Reporting Waste (Citizen):** Captures an image of the waste, selects the location on the interactive map, and submits. The system checks for fraud.
2. **Reviewing Tasks (Collector):** Sees a map of all "pending" waste reports nearby and accepts a task (status changes to "in-progress").
3. **Resolving Tasks:** Cleans the area, takes a photo of the clean spot, and uploads it as proof to mark it "verified".
4. **Reward Distribution:** Both the Citizen and the Collector receive points for a successful cycle. Ranks update on the Leaderboard.
5. **Admin Oversight:** Admins monitor system health, verify flagged suspicious reports, and view statistical graphs.

---

## 6. Key Algorithms & Logic
**1. Image Deduplication (SHA-256 Hash):**
To prevent a user from submitting the exact same image twice to farm points, the image file is converted into a SHA-256 hash string. Before saving a task, the DB checks if this `imageHash` already exists.

**2. AI Fraud Detection using Gemini:**
When an image is uploaded, it is passed to the Gemini Vision API. Based on the AI's JSON response, the task's `isSuspicious` boolean is toggled.

**3. AI Collector Verification:**
When the collector uploads proof of work, the system sends both the citizen's original "Before" photo and the collector's "After" photo to Gemini AI. It checks for a **Location Match** and **Waste Removal Validation**.

**4. Point Calculation Engine:**
Points are awarded via conditional logic based on the waste type/category after the task is verified. (e.g., Organic/Paper = 10 pts, Plastic = 15 pts, Metal = 20 pts, Hazardous = 25 pts, General = 5 pts).

---

## 7. Installation / Setup

**Requirements:** Node.js, npm/yarn, MongoDB URI, Gemini API Key.

**Steps:**
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection_string
   AUTH_SECRET=your_nextauth_secret_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in the browser.
