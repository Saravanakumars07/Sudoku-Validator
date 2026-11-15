import { useState } from "react";
import "./App.css";

const emptyBoard = () => Array.from({ length: 9 }, () => Array(9).fill(""));

function App() {
  const [board, setBoard] = useState(emptyBoard());
  const [message, setMessage] = useState("");
  const [conflicts, setConflicts] = useState(new Set());

  const handleChange = (row, col, value) => {
    // Allow only 1-9 or empty, single digit
    if (value !== "" && !/^[1-9]$/.test(value)) return;
    const newBoard = board.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? value : c))
    );
    setBoard(newBoard);
    // Clear old highlight + message on edit (as per docx)
    setConflicts(new Set());
    setMessage("");
  };

  const handleValidate = () => {
    const newConflicts = new Set();

    const addConflict = (r, c) => newConflicts.add(`${r}-${c}`);

    // Check rows
    for (let r = 0; r < 9; r++) {
      const seen = {};
      for (let c = 0; c < 9; c++) {
        const v = board[r][c];
        if (v === "") continue;
        if (seen[v] !== undefined) {
          addConflict(r, c);
          addConflict(r, seen[v]);
        } else {
          seen[v] = c;
        }
      }
    }

    // Check columns
    for (let c = 0; c < 9; c++) {
      const seen = {};
      for (let r = 0; r < 9; r++) {
        const v = board[r][c];
        if (v === "") continue;
        if (seen[v] !== undefined) {
          addConflict(r, c);
          addConflict(seen[v], c);
        } else {
          seen[v] = r;
        }
      }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = {};
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const row = boxRow * 3 + r;
            const col = boxCol * 3 + c;
            const v = board[row][col];
            if (v === "") continue;
            if (seen[v] !== undefined) {
              const [pr, pc] = seen[v];
              addConflict(row, col);
              addConflict(pr, pc);
            } else {
              seen[v] = [row, col];
            }
          }
        }
      }
    }

    setConflicts(newConflicts);

    if (newConflicts.size > 0) {
      setMessage("Invalid Sudoku! Conflicts found.");
    } else {
      setMessage("Sudoku is valid so far!");
    }
  };

  const handleClear = () => {
    setBoard(emptyBoard());
    setMessage("");
    setConflicts(new Set());
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Sudoku Validator</h1>
        <p className="subtitle">Enter numbers 1-9. Check rows, columns and 3×3 boxes.</p>

        <div className="board">
          {board.map((rowArr, r) =>
            rowArr.map((value, c) => (
              <input
                key={`${r}-${c}`}
                type="text"
                inputMode="numeric"
                className={`cell ${conflicts.has(`${r}-${c}`) ? "invalid conflict error" : ""} ${c % 3 === 2 && c !== 8 ? "right-border" : ""} ${r % 3 === 2 && r !== 8 ? "bottom-border" : ""}`}
                value={value}
                maxLength={1}
                onChange={(e) => handleChange(r, c, e.target.value)}
              />
            ))
          )}
        </div>

        <div className="btn-row">
          <button type="button" className="validate-btn" onClick={handleValidate}>
            Validate
          </button>
          <button type="button" className="clear-btn" onClick={handleClear}>
            Clear
          </button>
        </div>

        {message && (
          <p className={message.includes("Invalid") ? "msg error-msg" : "msg success-msg"}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;