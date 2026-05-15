# 6 USER MANUAL

This chapter provides a comprehensive guide for setting up and operating the **Generative Engine Optimizer (GEO)**. It covers everything from system prerequisites to a detailed walk-through of the application's core features, ensuring that even non-technical users can effectively utilize the system for AI-native content optimization.

## 6.1 Introduction
The User Manual serves as a technical bridge between the system’s complex backend architecture and the user’s need for actionable SEO results. In this chapter, we outline the hardware and software specifications required to run the environment locally, provide a step-by-step installation guide for the project folder, and deliver an operating manual that explains how to navigate the GEO Perception Layer, optimize content, and generate schema markup.

## 6.2 Hardware/Software Requirements for the System

To ensure optimal performance, especially when running local database services and multiple API connections, the following requirements must be met:

### **Hardware Requirements**
| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Processor** | Intel Core i5 (8th Gen) or AMD Ryzen 5 | Intel Core i7 / Apple M1/M2/M3 |
| **RAM** | 8 GB | 16 GB or higher |
| **Storage** | 2 GB free space (SSD preferred) | 5 GB free space (SSD) |
| **Internet** | Stable connection (for LLM API calls) | High-speed Fiber connection |

### **Software Requirements**
*   **Operating System:** Windows 10/11, macOS (12.0+), or Ubuntu Linux (20.04+).
*   **Runtime Environments:** 
    *   **Node.js:** v18.0.0 or higher (for the React Frontend).
    *   **Python:** v3.10.0 or higher (for the FastAPI Backend).
*   **Database:** PostgreSQL 14+ (or a cloud-hosted instance like Supabase/Neon).
*   **Web Browser:** Modern browser (Chrome, Edge, or Firefox) with JavaScript enabled.
*   **API Keys:** 
    *   Groq Cloud API Key (for Llama 3.3 models).
    *   Google AI Studio API Key (for Gemini 2.0).

---

## 6.3 Installation guide for Application

Since the project is provided as a complete system folder, follow these steps to initialize the environment:

### **Step 1: Folder Preparation**
1.  Extract the `GEO_Project.zip` folder to your local drive (e.g., `C:\GEO`).
2.  Open your terminal or command prompt (CMD/PowerShell) and navigate to the folder.

### **Step 2: Backend Configuration**
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Configure the environment variables:
    *   Locate the `.env` file.
    *   Input your `GROQ_API_KEY`, `GEMINI_API_KEY`, and `DATABASE_URL`.

### **Step 3: Frontend Configuration**
1.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

### **Step 4: Launching the System**
1.  Start the Backend Server (from the `backend` folder):
    ```bash
    python main.py
    ```
2.  Start the Frontend Server (from the `frontend` folder):
    ```bash
    npm run dev
    ```
3.  Open `http://localhost:5173` in your browser.

> [!TIP]
> **[TO DO: Insert Screenshot of the terminal running both servers successfully]**

---

## 6.4 Operating Manual

This section explains how to use the core features of the GEO system.

### **1. Dashboard & Analysis**
The Dashboard provides an overview of your current SEO performance.
*   **Upload/Paste Content:** Enter your raw text or a URL in the analysis field.
*   **Run GEO Audit:** Click "Analyze" to trigger the multi-layer scoring system (Structural, Semantic, and Citation Worthiness).

> [!IMPORTANT]
> **[TO DO: Insert Screenshot of the Dashboard showing a completed analysis score]**

### **2. Content Optimization (The Action Layer)**
Navigate to the "Content Optimization" tab to rewrite or generate content.
*   **Rewrite Mode:** Paste existing content to have it restructured into the "Inverted Pyramid" format.
*   **Generate Mode:** Enter a topic idea, and the system will ground it in real-time search data before generating a draft.
*   **Strategy Selection:** Choose from "Authority Boost," "Concise," or "Technical" to change the optimization tone.

> [!IMPORTANT]
> **[TO DO: Insert Screenshot of the Optimization Tab with the 'Optimize' button highlighted]**

### **3. Schema Generation**
One of the most powerful features for Generative Search is the Schema Generator.
*   Switch to the **Schema Tab**.
*   Select the type of schema (Article, FAQ, or HowTo).
*   Fill in the required fields (Author, Description, etc.).
*   Click **Generate Schema** to get the JSON-LD code for your website.

> [!TIP]
> **[TO DO: Insert Screenshot of the Schema Tab showing generated JSON-LD code]**

### **4. Live Verifier**
The system includes a "Live Verifier" that checks if your content is actually being cited by AI engines for specific queries.
*   View the **Probability Metrics** card in the analysis results.
*   If a gap is found, the system will suggest "GEO Signals" to inject into your content to improve citation likelihood.

> [!IMPORTANT]
> **[TO DO: Insert Screenshot of the Probability Metrics card showing a 'Validated' status]**
