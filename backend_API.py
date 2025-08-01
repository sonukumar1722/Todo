from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import uuid
import io

app = Flask(__name__)
# Allow requests from the React frontend's default port
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# In-memory "database" for simplicity
todos = [
    {"id": str(uuid.uuid4()), "text": "Learn React", "completed": True, "dueDate": None, "notified": False},
    {"id": str(uuid.uuid4()), "text": "Build a Flask API", "completed": True, "dueDate": None, "notified": False},
    {"id": str(uuid.uuid4()), "text": "Connect React to Flask", "completed": False, "dueDate": None, "notified": False},
]

@app.route('/todos', methods=['GET'])
def get_todos():
    """Retrieves the list of all to-do items."""
    return jsonify(todos)

@app.route('/todos', methods=['POST'])
def add_todo():
    """Adds a new to-do item."""
    if not request.json or 'text' not in request.json:
        return jsonify({"error": "Missing 'text' in request body"}), 400
    
    new_todo = {
        "id": str(uuid.uuid4()),
        "text": request.json['text'],
        "completed": False,
        "dueDate": None,
        "notified": False
    }
    todos.append(new_todo)
    return jsonify(new_todo), 201

@app.route('/todos/<string:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Updates an existing to-do item."""
    todo = next((t for t in todos if t['id'] == todo_id), None)
    if todo is None:
        return jsonify({"error": "Todo not found"}), 404

    if not request.json:
        return jsonify({"error": "Invalid JSON"}), 400

    todo['text'] = request.json.get('text', todo['text'])
    todo['completed'] = request.json.get('completed', todo['completed'])
    todo['dueDate'] = request.json.get('dueDate', todo['dueDate'])
    
    return jsonify(todo)

@app.route('/todos/<string:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Deletes a to-do item by its ID."""
    global todos
    initial_len = len(todos)
    todos = [t for t in todos if t['id'] != todo_id]
    if len(todos) == initial_len:
        return jsonify({"error": "Todo not found"}), 404
        
    return jsonify({"message": "Todo deleted successfully"}), 200

@app.route('/download', methods=['GET'])
def download_tasks():
    """Generates a text file of the tasks and sends it for download."""
    buffer = io.BytesIO()
    
    header = "# To-Do List\n\n"
    buffer.write(header.encode('utf-8'))

    for task in todos:
        checkbox = '- [x]' if task['completed'] else '- [ ]'
        due_date_str = f" (Due: {task['dueDate']})" if task['dueDate'] else ''
        line = f"{checkbox} {task['text']}{due_date_str}\n"
        buffer.write(line.encode('utf-8'))
        
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name='tasks.txt',
        mimetype='text/plain'
    )

if __name__ == '__main__':
    app.run(debug=True, port=5000)
