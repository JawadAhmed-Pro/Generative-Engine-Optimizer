# GEO Project Handover & Setup Guide (macOS)

Welcome! This guide is designed to help you get the **Generative Engine Optimizer (GEO)** platform running locally on your MacBook and show you how to collaborate with **Antigravity** (the AI coding agent).

---

## 1. Prerequisites
Ensure you have the following installed on your Mac:
- **Python 3.13+** (Install via [python.org](https://www.python.org/) or `brew install python`)
- **Node.js 20+** (Install via [nodejs.org](https://nodejs.org/) or `brew install node`)
- **Git** (Pre-installed on macOS)

---

## 2. Cloning the Project
Open your terminal and run:
```bash
git clone https://github.com/JawadAhmed-Pro/Generative-Engine-Optimizer.git
cd Generative-Engine-Optimizer
```

---

## 3. Backend Setup
The backend is a FastAPI application.
```bash
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Setup Environment Variables
# Create a .env file (ask the lead for the specific API keys)
touch .env
```
**Example `.env` content:**
```env
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
DATABASE_URL=sqlite:///./geo.db
SECRET_KEY=your_random_secret_string
```

---

## 4. Frontend Setup
The frontend is built with Vite and React.
```bash
cd ../frontend

# Install dependencies
npm install
```

---

## 5. Running the Application
You will need two terminal windows/tabs open.

### Tab 1: Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Tab 2: Frontend
```bash
cd frontend
npm run dev
```
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Web App**: [http://localhost:5173](http://localhost:5173)

---

## 6. Using Antigravity (The AI Agent)
**Antigravity** is your powerful coding partner. To use it effectively:
1. **Explain the Task**: Just like talking to a teammate, tell Antigravity what you want to build or fix.
2. **Context Awareness**: Antigravity can read the entire codebase, run terminal commands, and even browse the web for documentation.
3. **Drafting Changes**: Antigravity will propose changes (diffs). You can review them before they are applied.
4. **Running Commands**: Antigravity can run your dev server, execute tests, and push to Git.

---

## 7. Testing & Pushing Changes
Once you've made improvements and verified them locally:

1. **Verify**: Run the local dev server and test the functionality in the browser.
2. **Commit**:
   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```
3. **Push**:
   ```bash
   git push origin main
   ```

---

## 🛠️ Key Components to Watch
- `backend/geo_optimizer.py`: The "Action Layer" for content rewriting.
- `backend/discovery_engine.py`: Real-world prompt scraping and AI simulation.
- `backend/competitor_analyzer.py`: Competitive gap analysis logic.

If you run into issues, ask **Antigravity** for help—it knows this codebase inside and out!
