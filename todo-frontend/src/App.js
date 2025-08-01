import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- DateTimePicker Modal Component ---
const DateTimePicker = ({ isOpen, onSave, onClose, initialDate }) => {
    const now = new Date();
    // Initialize state with current date to prevent crash on first render.
    // The useEffect below will synchronize it to the correct initialDate when the modal opens.
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [day, setDay] = useState(now.getDate());
    const [hour, setHour] = useState(now.getHours());
    const [minute, setMinute] = useState(now.getMinutes());

    // This effect hook synchronizes the picker's state with the selected task's date
    // every time the modal is opened. This fixes the bug where the old date was shown.
    useEffect(() => {
        if (isOpen) {
            // initialDate can be a string or null, so we must convert it to a valid Date object.
            const dateToSet = initialDate ? new Date(initialDate) : new Date();
            setYear(dateToSet.getFullYear());
            setMonth(dateToSet.getMonth());
            setDay(dateToSet.getDate());
            setHour(dateToSet.getHours());
            setMinute(dateToSet.getMinutes());
        }
    }, [initialDate, isOpen]);


    const years = Array.from({ length: 10 }, (_, i) => now.getFullYear() + i);
    const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
    const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleSave = () => {
        onSave(new Date(year, month, day, hour, minute));
        onClose();
    };

    if (!isOpen) return null;

    const Scroller = ({ values, selectedValue, onChange, unit }) => (
        <div className="flex-1 h-48 overflow-y-scroll bg-gray-700 rounded-lg p-2 snap-y">
            {values.map(value => (
                <div
                    key={value}
                    onClick={() => onChange(value)}
                    className={`p-2 text-center cursor-pointer rounded-md snap-center ${selectedValue === value ? 'bg-teal-500 font-bold' : 'hover:bg-gray-600'}`}
                >
                    {unit === 'month' ? value : String(value).padStart(2, '0')}
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold text-teal-300 mb-4">Set Due Date & Time</h3>
                <div className="flex space-x-2 text-sm">
                    <Scroller values={months} selectedValue={months[month]} onChange={val => setMonth(months.indexOf(val))} unit="month" />
                    <Scroller values={days} selectedValue={day} onChange={setDay} />
                    <Scroller values={years} selectedValue={year} onChange={setYear} />
                    <Scroller values={hours} selectedValue={hour} onChange={setHour} />
                    <Scroller values={minutes} selectedValue={minute} onChange={setMinute} />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 font-bold transition">Save</button>
                </div>
            </div>
        </div>
    );
};


const App = () => {
    // --- State Management ---
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isPickerOpen, setPickerOpen] = useState(false);
    const [currentEditingTaskId, setCurrentEditingTaskId] = useState(null); // Used for date picker
    const [editingTaskId, setEditingTaskId] = useState(null); // Used for inline text edit
    const [editingTaskText, setEditingTaskText] = useState('');

    const [loading, setLoading] = useState({
        question: false,
    });

    // --- Notifications ---
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
        const interval = setInterval(() => {
            setTasks(currentTasks => {
                const now = new Date();
                let changed = false;
                const updatedTasks = currentTasks.map(task => {
                    if (task.dueDate && new Date(task.dueDate) <= now && !task.completed && !task.notified) {
                        if (Notification.permission === 'granted') {
                            new Notification('Task Due!', { body: task.text, icon: 'https://placehold.co/32x32/14b8a6/ffffff?text=🔔' });
                        }
                        changed = true;
                        return { ...task, notified: true };
                    }
                    return task;
                });
                return changed ? updatedTasks : currentTasks;
            });
        }, 10000);
        return () => clearInterval(interval);
    }, []);


    // --- Initial Data Loading ---
    // This now uses mock data directly instead of trying to fetch from a backend.
    useEffect(() => {
        const initialTasks = [
            { "id": "mock-1", "text": "Plan a weekend trip", "completed": false, dueDate: null, notified: false },
            { "id": "mock-2", "text": "Learn React", "completed": true, dueDate: null, notified: false },
            { "id": "mock-3", "text": "Read a book", "completed": false, dueDate: null, notified: false },
        ];
        setTasks(initialTasks);
    }, []);

    // --- API & Helper Functions ---
    const callGemini = async (prompt) => {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = ""; // Add your Gemini API key here
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        }
        throw new Error("Failed to get a valid response from the API.");
    };

    const parseMarkdownToHTML = (text) => {
        if (!text) return '';
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^(### (.*))$/gm, '<h3>$2</h3>')
            .replace(/^(## (.*))$/gm, '<h2>$2</h2>')
            .replace(/^(# (.*))$/gm, '<h1>$2</h1>')
            .replace(/^\* (.*)$/gm, '<ul><li>$1</li></ul>')
            .replace(/^\- (.*)$/gm, '<ul><li>$1</li></ul>')
            .replace(/^\d+\. (.*)$/gm, '<ol><li>$1</li></ol>')
            .replace(/<\/ul>\n<ul>/g, '')
            .replace(/<\/ol>\n<ol>/g, '')
            .replace(/\n/g, '<br />');
        return html;
    };


    // --- CRUD & File Operations (Client-Side) ---
    const addTask = () => {
        if (newTask.trim() === '') return;
        const newTaskObj = {
            id: crypto.randomUUID(),
            text: newTask,
            completed: false,
            dueDate: null,
            notified: false
        };
        setTasks(prev => [...prev, newTaskObj]);
        setNewTask('');
    };

    const toggleTask = (id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const handleSetDueDate = (taskId, date) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate: date.toISOString(), notified: false } : t));
    };
    
    const openDateTimePicker = (taskId) => {
        setCurrentEditingTaskId(taskId);
        setPickerOpen(true);
    };
    
    const downloadTasks = () => {
        const header = "# To-Do List\n\n";
        const fileContent = tasks.reduce((acc, task) => {
            const checkbox = task.completed ? '- [x]' : '- [ ]';
            const dueDate = task.dueDate ? ` (Due: ${new Date(task.dueDate).toLocaleDateString()})` : '';
            return `${acc}${checkbox} ${task.text}${dueDate}\n`;
        }, header);

        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'tasks.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    // --- Task Editing ---
    const startEditing = (task) => {
        setEditingTaskId(task.id);
        setEditingTaskText(task.text);
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditingTaskText('');
    };

    const saveTask = (taskId) => {
        if (editingTaskText.trim() === '') {
            deleteTask(taskId);
        } else {
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, text: editingTaskText } : t
            ));
        }
        cancelEditing();
    };

    const handleEditKeyDown = (e, taskId) => {
        if (e.key === 'Enter') {
            saveTask(taskId);
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    // --- Gemini-Powered Features ---
    const askQuestion = async () => {
        if (question.trim() === '') return;
        setLoading(prev => ({ ...prev, question: true }));
        setAnswer('');
        try {
            const responseText = await callGemini(question);
            setAnswer(responseText);
        } catch (error) {
            console.error("Error asking question:", error);
            setAnswer('An error occurred while fetching the answer.');
        } finally {
            setLoading(prev => ({ ...prev, question: false }));
            setQuestion('');
        }
    };
    
    const currentTaskForDatePicker = useMemo(() => tasks.find(t => t.id === currentEditingTaskId), [tasks, currentEditingTaskId]);


    // --- JSX Rendering ---
    return (
        <>
            <DateTimePicker
                isOpen={isPickerOpen}
                onClose={() => setPickerOpen(false)}
                onSave={(date) => handleSetDueDate(currentEditingTaskId, date)}
                initialDate={currentTaskForDatePicker?.dueDate}
            />
            <div className="bg-gray-900 text-white min-h-screen font-sans">
                <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-3xl">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6 sm:mb-8 text-center text-teal-400">To-Do Manager</h1>

                    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg mb-6 sm:mb-8 flex items-center space-x-4">
                        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} placeholder="Add a new task..." className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                        <button onClick={addTask} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:-translate-y-1 transition">Add</button>
                    </div>

                    <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-teal-300">Your Tasks</h2>
                            <button onClick={downloadTasks} className="text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1 px-3 rounded-md transition disabled:opacity-50">
                                Download Tasks
                            </button>
                        </div>
                        <ul className="space-y-3">
                            {tasks.map(task => (
                                <li key={task.id} className={`p-4 rounded-lg transition duration-300 ${task.completed ? 'bg-gray-700 text-gray-500' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
                                    {editingTaskId === task.id ? (
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="text"
                                                value={editingTaskText}
                                                onChange={(e) => setEditingTaskText(e.target.value)}
                                                onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                                                className="flex-grow bg-gray-600 border-2 border-gray-500 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                                autoFocus
                                            />
                                            <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                                                <button onClick={() => saveTask(task.id)} className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md transition">Save</button>
                                                <button onClick={cancelEditing} className="text-sm bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span onClick={() => toggleTask(task.id)} className={`cursor-pointer flex-grow ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
                                                <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-400 font-bold ml-4 transition">Delete</button>
                                            </div>
                                            <div className="text-xs text-teal-400 mt-2 flex items-center justify-between">
                                                <span>{task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleString()}` : 'No due date'}</span>
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => openDateTimePicker(task.id)} className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-2 rounded-md transition">
                                                        {task.dueDate ? 'Edit Date' : 'Set Date'}
                                                    </button>
                                                    <button onClick={() => startEditing(task)} className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-2 rounded-md transition">Edit</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                            {tasks.length === 0 && <p className="text-gray-400 text-center py-4">You have no tasks yet!</p>}
                        </ul>
                    </div>

                    <div className="mt-6 sm:mt-8">
                        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-semibold mb-4 text-blue-300">Ask an Assistant</h2>
                            <div className="flex flex-col space-y-4">
                                <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && askQuestion()} placeholder="Ask anything..." className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                <button onClick={askQuestion} disabled={loading.question} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition disabled:opacity-50">{loading.question ? 'Asking...' : 'Ask'}</button>
                            </div>
                            {answer && (
                                <div className="bg-gray-700 p-4 rounded-lg mt-4">
                                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Answer:</h3>
                                    <div 
                                        className="prose prose-invert prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(answer) }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
