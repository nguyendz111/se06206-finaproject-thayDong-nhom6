// server1.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',     // Replace with your MySQL username if different
  password: '',     // Replace with your MySQL password if you have one
  database: 'chess_game_db'
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Failed to connect to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Get all puzzles
app.get('/puzzles', (req, res) => {
  const query = 'SELECT * FROM chess_game ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching puzzles:', err);
      return res.status(500).json({ error: 'Failed to fetch puzzles' });
    }
    
    res.json(results);
  });
});

// Get a single puzzle by ID
app.get('/puzzles/:id', (req, res) => {
  const puzzleId = req.params.id;
  const query = 'SELECT * FROM chess_game WHERE id = ?';
  
  db.query(query, [puzzleId], (err, results) => {
    if (err) {
      console.error('Error fetching puzzle:', err);
      return res.status(500).json({ error: 'Failed to fetch puzzle' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    res.json(results[0]);
  });
});

// Create a new puzzle
app.post('/puzzles', (req, res) => {
  const { name, board_state, current_turn, difficulty_rating } = req.body;
  
  if (!name || !board_state || !current_turn || !difficulty_rating) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const query = 'INSERT INTO chess_game (name, board_state, current_turn, difficulty_rating) VALUES (?, ?, ?, ?)';
  
  db.query(query, [name, board_state, current_turn, difficulty_rating], (err, result) => {
    if (err) {
      console.error('Error creating puzzle:', err);
      return res.status(500).json({ error: 'Failed to create puzzle' });
    }
    
    res.status(201).json({ 
      id: result.insertId,
      name,
      board_state,
      current_turn,
      difficulty_rating
    });
  });
});

// Update a puzzle
app.put('/puzzles/:id', (req, res) => {
  const puzzleId = req.params.id;
  const { name, board_state, current_turn, difficulty_rating } = req.body;
  
  if (!name || !board_state || !current_turn || !difficulty_rating) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const query = 'UPDATE chess_game SET name = ?, board_state = ?, current_turn = ?, difficulty_rating = ? WHERE id = ?';
  
  db.query(query, [name, board_state, current_turn, difficulty_rating, puzzleId], (err, result) => {
    if (err) {
      console.error('Error updating puzzle:', err);
      return res.status(500).json({ error: 'Failed to update puzzle' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    res.json({ 
      id: puzzleId,
      name,
      board_state,
      current_turn,
      difficulty_rating
    });
  });
});

// Delete a puzzle
app.delete('/puzzles/:id', (req, res) => {
  const puzzleId = req.params.id;
  const query = 'DELETE FROM chess_game WHERE id = ?';
  
  db.query(query, [puzzleId], (err, result) => {
    if (err) {
      console.error('Error deleting puzzle:', err);
      return res.status(500).json({ error: 'Failed to delete puzzle' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    res.json({ message: 'Puzzle deleted successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});