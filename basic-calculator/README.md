# Basic Calculator

Simple, responsive calculator built with HTML, CSS, and JavaScript.

Features
- Basic arithmetic: addition, subtraction, multiplication, division
- Correct operator precedence (BODMAS/BIDMAS) using a shunting-yard parser
- Decimal support
- Clear (C) and Backspace (⌫)
- Keyboard input: numbers, + - * /, Enter (equals), Backspace, Escape (clear), % and sqrt (key `s`)
- Error handling: handles division by zero and invalid expressions, shows "Error" instead of crashing
- Extra features (implemented):
  - Square root (√)
  - Percentage (%) – converts the last number to percentage (divides by 100)
  - Memory functions: M+, M-, MR, MC

Project Structure
```
basic-calculator/
├── index.html   (structure and UI)
├── style.css    (styling)
├── script.js    (logic, parser, keyboard, memory)
└── README.md    (this file)
```

How to run
1. Open `index.html` in your browser (double-click the file or serve it via a static server).
2. Use your mouse to press buttons or use keyboard shortcuts.

Usage notes
- To compute percentage of the current number: type the number then press `%` (or click `%`).
- Square root: click the √ button or press `s` on the keyboard. It applies to the current expression value.
- Memory: use M+ to add the current evaluated value to memory; M- to subtract; MR to recall and put memory into the display; MC to clear memory.

Implementation details
- The calculator uses tokenization + shunting-yard algorithm to convert to RPN and then evaluate.
- Percentage is handled as a unary operator applied to the previous number.
- Error conditions (division by zero, invalid expression) are caught and shown as "Error" in the result area.

License
This project is provided as-is for learning purposes.
