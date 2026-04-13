---
description: How to run the GEO application and see the new premium UI changes.
---

// turbo-all
1. Navigate to the frontend directory:
```bash
cd /Users/apple/Downloads/Generative-Engine-Optimizer-main/frontend
```

2. Terminate any existing vite processes to ensure a clean start:
```bash
pkill -f vite || true
```

3. Start the development server with a clean cache:
```bash
npm run dev -- --force
```

4. Open your browser and navigate to:
`http://localhost:5173`

5. **CRITICAL**: Once the page loads, perform a **Hard Refresh** to clear browser cache:
   - **Mac**: `Cmd + Shift + R`
   - **Windows/Linux**: `Ctrl + F5`

6. If you still see the old UI, try opening the link in an **Incognito Window**.
