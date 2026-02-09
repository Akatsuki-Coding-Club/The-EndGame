/* Mock puzzle data for all 15 levels */

export interface Puzzle {
  id: number;
  title: string;
  description: string;
  question: string;
  answer: string;
  points: number;
  hint?: string;
}

export const puzzles: Puzzle[] = [
  {
    id: 1, title: "Binary Dawn", description: "Decode the binary message",
    question: "What does 01001000 01001001 spell in ASCII?",
    answer: "HI", points: 100, hint: "Each 8-bit group is a character"
  },
  {
    id: 2, title: "Cipher Shift", description: "Classic Caesar cipher",
    question: "Decrypt 'KHOOR' using a Caesar cipher with shift 3",
    answer: "HELLO", points: 150, hint: "Shift each letter back"
  },
  {
    id: 3, title: "Pattern Lock", description: "Find the missing number",
    question: "What comes next: 2, 6, 18, 54, ?",
    answer: "162", points: 200, hint: "Multiply by 3"
  },
  {
    id: 4, title: "Hex Matrix", description: "Convert the hex code",
    question: "What is 0xFF in decimal?",
    answer: "255", points: 250, hint: "F = 15 in hex"
  },
  {
    id: 5, title: "Logic Gate", description: "Boolean logic puzzle",
    question: "If A=1, B=0, what is A AND (A OR B)?",
    answer: "1", points: 300, hint: "Evaluate inner brackets first"
  },
  {
    id: 6, title: "Quantum Key", description: "Math sequence",
    question: "Fibonacci: 1, 1, 2, 3, 5, 8, 13, ?",
    answer: "21", points: 350, hint: "Sum of previous two"
  },
  {
    id: 7, title: "Neural Path", description: "Word puzzle",
    question: "Rearrange: OTORLPCO → a word meaning 'rules'",
    answer: "PROTOCOL", points: 400, hint: "Related to this game's name"
  },
  {
    id: 8, title: "Data Stream", description: "Base conversion",
    question: "What is binary 1010 in decimal?",
    answer: "10", points: 450, hint: "Powers of 2"
  },
  {
    id: 9, title: "Firewall Breach", description: "Logic puzzle",
    question: "I have cities but no houses, forests but no trees. What am I?",
    answer: "MAP", points: 500, hint: "Think navigation"
  },
  {
    id: 10, title: "Crypto Vault", description: "Math challenge",
    question: "What is the square root of 1764?",
    answer: "42", points: 550, hint: "The answer to everything"
  },
  {
    id: 11, title: "Warp Core", description: "Science question",
    question: "What element has atomic number 79?",
    answer: "GOLD", points: 600, hint: "A precious metal, symbol Au"
  },
  {
    id: 12, title: "Signal Noise", description: "Pattern recognition",
    question: "Complete: J, F, M, A, M, J, J, A, S, O, N, ?",
    answer: "D", points: 650, hint: "Think calendar"
  },
  {
    id: 13, title: "Dark Matter", description: "Advanced cipher",
    question: "In Morse: -.. . -.-. --- -.. . = ?",
    answer: "DECODE", points: 700, hint: "Dash dot patterns"
  },
  {
    id: 14, title: "Singularity", description: "Final approach",
    question: "What 6-letter word becomes shorter when you add 2 letters?",
    answer: "SHORT", points: 800, hint: "Add '-er' to the answer"
  },
  {
    id: 15, title: "End Protocol", description: "The final challenge",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
    answer: "ECHO", points: 1000, hint: "Sound reflection"
  },
];

export const blipPuzzle: Puzzle = {
  id: 99, title: "Blip Escape", description: "Solve to escape the Blip early",
  question: "What is 2^10?",
  answer: "1024", points: 200, hint: "Powers of two"
};

/* Mock team credentials: team1/password1 ... team30/password30 */
export interface Team {
  id: string;
  name: string;
  password: string;
}

export const teams: Team[] = Array.from({ length: 30 }, (_, i) => ({
  id: `team${i + 1}`,
  name: `Team ${i + 1}`,
  password: `password${i + 1}`,
}));

/* Admin credentials */
export const adminCredentials = { id: "admin", password: "admin123" };
