# ✨ SoulScript – Personalized Bible Reader App

SoulScript is a full-stack, cross-platform Bible application designed to provide a **personalized and emotionally supportive scripture reading experience**. It helps users discover Bible verses based on their mood and build a deeper spiritual connection.

---

## 🚀 Features

### 🌿 Mood-Based Scripture Discovery
- Select emotions like **Anxiety, Hope, Gratitude, Loneliness**
- Get curated Bible verses tailored to your emotional state

### 📖 Premium Reading Experience
- Clean and distraction-free UI
- Multiple font styles (Serif, Sans, Mono)
- Persistent user preferences

### 🔐 User Authentication
- Secure login & registration
- Password encryption using **bcrypt**

### ❤️ Bookmarks & Favorites
- Save verses for later
- Create your own personalized collection

### 📶 Offline Support
- Works without internet using **IndexedDB (idb)**
- Cached Bible data and mood-based verses

### 📱 Cross-Platform Support
- Web (PWA)
- Android & iOS via **Capacitor**

---

## 🏗️ Tech Stack

### Frontend
- React 19
- Vite
- Framer Motion
- Lucide Icons
- Capacitor (Mobile Support)

### Backend
- Node.js
- Express.js (v5)
- MongoDB (Mongoose)
- BcryptJS (Authentication)

---

## 🧠 Architecture

- Client-Server API Architecture
- Offline-first approach with IndexedDB
- Modular backend (Routes, Controllers, Services, Models)

---

## 📂 Project Structure

```

SoulScript/
│
├── client/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   ├── routes/
│
├── server/          # Backend (Node + Express)
│   ├── routes/
│   ├── controllers/
│   ├── models/
│
├── capacitor.config.ts
└── README.md

````

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/soulscript.git
cd soulscript
````

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd client
npm install
npm run dev
```

---

### 4️⃣ Run Mobile App (Optional)

```bash
npx cap add android
npx cap open android
```

---

## 🌍 Future Improvements

* AI-based verse recommendations 🤖
* Voice-based scripture reading 🎧
* Community sharing features 🌐

---

## 🙌 Author

**Mahesh**
MCA Student | Java Developer 

---

## ⭐ Show Your Support

If you like this project, please give it a ⭐ on GitHub!

```
