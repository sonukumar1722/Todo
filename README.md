# Full-Stack To-Do Manager with AI Features

This is a comprehensive to-do manager application built with a React frontend and a Python (Flask) backend. It includes features for task management, notifications, AI-powered assistance, and data export.

## Features

* **CRUD Operations:** Create, read, update, and delete tasks.
* **Task Editing:** Edit task descriptions directly in the list.
* **Due Dates & Notifications:** Set a due date and time for each task and receive a browser notification when it's due.
* **AI Assistant:** Ask the integrated AI assistant any question and get a formatted response.
* **Downloadable Task List:** Export your current to-do list as a formatted `.txt` file.
* **Responsive Design:** The interface is optimized for both desktop and mobile devices.

## Tech Stack

* **Frontend:** React
* **Backend:** Python (Flask)
* **AI Integration:** Gemini API
* **Styling:** Tailwind CSS

## Prerequisites

Ensure you have the following installed on your system:

* [Node.js and npm](https://nodejs.org/en/) (for the React frontend)
* [Python 3](https://www.python.org/downloads/) (for the Flask backend)
* `pip` (Python package installer)

## How to Run Locally

Follow these steps to get the application running on your local machine.

### 1. Backend Setup (Python/Flask)

First, get the backend server running.

1.  **Navigate to the Backend Directory:**
    Open your terminal and navigate to the directory where you saved the backend Python file.

2.  **Create a Virtual Environment (Recommended):**
    It's good practice to create a virtual environment to manage project dependencies.

    ```bash
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    ./venv/Scripts/activate
    ```

3.  **Install Dependencies:**
    Install Flask and Flask-CORS.

    ```bash
    pip install Flask Flask-Cors
    ```

4.  **Run the Flask Server:**
    Start the backend server.

    ```bash
    python backend_API.py
    ```

    You should see output indicating that the server is running on `http://127.0.0.1:5000`. Keep this terminal window open.

### 2. Frontend Setup (React)

Now, set up and run the React frontend.

1.  **Open a New Terminal:**
    Open a new terminal window or tab.

2.  **Create a New React App:**
    If you haven't already, create a new React application.

    ```bash
    npx create-react-app todo-frontend
    cd todo-frontend
    ```

3.  **Install and Initialize Tailwind CSS:**
    These commands will install Tailwind and create the `tailwind.config.js` and `postcss.config.js` files.

    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```
    Note:  If not installed create it manuualy in the `./TODO/todo-frontend/` directory.

4.  **Configure Tailwind's Template Paths:**
    Open the `./TODO/todo-frontend/tailwind.config.js` fil and replace its content to tell Tailwind which files to scan for classes.

    ```javascript
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        "./src/**/*.{js,jsx,ts,tsx}",
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    ```
    Open the `./TODO/todo-frontend/postcss.config.js` fil and replace its content.
    
    ```javascript
    module.exports = {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    };
    ```

5.  **Add Tailwind Directives to your CSS:**
    Open the `./src/index.css` file and replace its content with the following lines:

    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

6.  **Replace `App.js`:**
    Open the `src` directory and replace the entire content of `App.js` with the React code provided in the other document.

7.  **Start the React Development Server:**
    From within the `todo-frontend` directory, run:

    ```bash
    npm start
    ```

    This will open a new tab in your web browser with the application running, usually at `http://localhost:3000`.

## How to Use the Application

* **Adding a Task:** Type your task into the input field and click "Add" or press Enter.
* **Completing a Task:** Click on the text of a task to toggle its completed status.
* **Editing a Task:** Click the "Edit" button, make your changes, and click "Save".
* **Deleting a Task:** Click the "Delete" button next to a task.
* **Setting a Due Date:** Click "Set Date" or "Edit Date" to open the date/time picker.
* **Downloading Tasks:** Click the "Download Tasks" button to save your list as a text file.
* **Asking the AI:** Type a question into the "Ask an Assistant" box and click "Ask".
