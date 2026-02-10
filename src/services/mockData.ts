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
    question: `What does 01001000 01001001 spell in ASCII? Program to Print Fibonacci Series
Last Updated : 23 Jul, 2025
Ever wondered about the cool math behind the Fibonacci series? This simple pattern has a remarkable presence in nature, from the arrangement of leaves on plants to the spirals of seashells. We're diving into this Fibonacci Series sequence. It's not just math, it's in art, nature, and more! Let's discover the secrets of the Fibonacci series together.

What is the Fibonacci Series?
The Fibonacci series is the sequence where each number is the sum of the previous two numbers of the sequence. The first two numbers of the Fibonacci series are 0 and 1 and are used to generate the Fibonacci series.

FIBONACCI-SERIES
Fibonacci Series
How to Find the Nth term of Fibonacci Series?
In mathematical terms, the number at the nth position can be represented by:

Fn = Fn-1 + Fn-2

where, F0 = 0 and F1 = 1.

For example, Fibonacci series 10 terms are: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34

Please refer Different Ways to Find Nth Fibonacci Number for details.

Program to print first N terms of Fibonacci Series:
Given a number n, our task is to print first n terms of the Fibonacci Series.

Input : n = 5
Output : 0 1 1 2 3

Input n = 1
Output : 0 

We are simply going to run a loop and inside the loop, we are going to keep track of the previous 2 Fibonacci Numbers.

// C++ Program to print the fibonacci series
// using iteration (loops)
#include <iostream>
using namespace std;

// Function to print fibonacci series
void printFib(int n)
{
    if (n < 1)
    {
        cout << "Invalid Number of terms\n";
        return;
    }

    // When number of terms is greater than 0
    int prev1 = 1;
    int prev2 = 0;

    cout << prev2 << " ";

    // If n is 1, then we do not need to
    // proceed further
    if (n == 1)
        return;

    cout << prev1 << " ";

    // Print 3rd number onwards using
    // the recursive formula
    for (int i = 3; i <= n; i++)
    {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
        cout << curr << " ";
    }
}

// Driver code
int main()
{
    int n = 9;
    printFib(n);
    return 0;
}
#include <stdio.h>

// Function to print fibonacci series
void printFib(int n) {
    if (n < 1) {
        printf("Invalid Number of terms\n");
        return;
    }

    // When number of terms is greater than 0
    int prev1 = 1;
    int prev2 = 0;

    printf("%d ", prev2);

    // If n is 1, then we do not need to
    // proceed further
    if (n == 1)
        return;

    printf("%d ", prev1);

    // Print 3rd number onwards using
    // the recursive formula
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
        printf("%d ", curr);
    }
}

// Driver code
int main() {
    int n = 9;
    printFib(n);
    return 0;
}
class GfG {

    // Function to print fibonacci series
    static void printFib(int n) {
        if (n < 1) {
            System.out.println("Invalid Number of terms");
            return;
        }

        // When number of terms is greater than 0
        int prev1 = 1;
        int prev2 = 0;

        System.out.print(prev2 + " ");

        // If n is 1, then we do not need to
        // proceed further
        if (n == 1)
            return;

        System.out.print(prev1 + " ");

        // Print 3rd number onwards using
        // the recursive formula
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
            System.out.print(curr + " ");
        }
    }

    // Driver code
    public static void main(String[] args) {
        int n = 9;
        printFib(n);
    }
}
# Function to print fibonacci series
def print_fib(n):
    if n < 1:
        print("Invalid Number of terms")
        return

    # When number of terms is greater than 0
    prev1 = 1
    prev2 = 0

    print(prev2, end=" ")

    # If n is 1, then we do not need to
    # proceed further
    if n == 1:
        return

    print(prev1, end=" ")
    
    # Print 3rd number onwards using
    # the recursive formula
    for i in range(3, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
        print(curr, end=" ")

# Driver code
if __name__ == "__main__":
    n = 9
    print_fib(n)
using System;

class GfG
{
    // Function to print fibonacci series
    static void printFib(int n)
    {
        if (n < 1)
        {
            Console.WriteLine("Invalid Number of terms");
            return;
        }

        // When number of terms is greater than 0
        int prev1 = 1;
        int prev2 = 0;

        Console.Write(prev2 + " ");

        // If n is 1, then we do not need to
        // proceed further
        if (n == 1)
            return;

        Console.Write(prev1 + " ");

        // Print 3rd number onwards using
        // the recursive formula
        for (int i = 3; i <= n; i++)
        {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
            Console.Write(curr + " ");
        }
    }

    // Driver code
    static void Main(string[] args)
    {
        int n = 9;
        printFib(n);
    }
}
// Function to print fibonacci series
function printFib(n) {
    if (n < 1) {
        console.log("Invalid Number of terms");
        return;
    }

    // When number of terms is greater than 0
    let prev1 = 1;
    let prev2 = 0;

    process.stdout.write(prev2 + " ");

    // If n is 1, then we do not need to
    // proceed further
    if (n == 1) return;

    process.stdout.write(prev1 + " ");

    // Print 3rd number onwards using
    // the recursive formula
    for (let i = 3; i <= n; i++) {
        let curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
        process.stdout.write(curr + " ");
    }
}

// Driver code
let n = 9;
printFib(n);

Output
0 1 1 2 3 5 8 13 21 
Complexity Analysis
Time Complexity: O(n)
Auxiliary Space: O(1)
Relation Between Pascal triangle and Fibonacci numbers:
Pascal’s triangle is the arrangement of the data in triangular form which is used to represent the coefficients of the binomial expansions, i.e. the second row in Pascal’s triangle represents the coefficients in (x+y)2 and so on. In Pascal’s triangle, each number is the sum of the above two numbers. Pascal’s triangle has various applications in probability theory, combinatorics, algebra, and various other branches of mathematics.

Fibonacci-Pascal-relation

As shown in the image the diagonal sum of the pascal's triangle forms a fibonacci sequence.

Mathematically: \Sigma_{k=0}^{\left \lfloor n/2 \right \rfloor} \binom{n-k}{k} = F_{n+1}










where F_{t}








 is the t-th term of the Fibonacci sequence.

Golden Ratio:
Definition: The golden ratio, often denoted by the Greek letter phi (Φ) or the mathematical symbol τ (tau), is a special mathematical constant that has been of interest to mathematicians, scientists, artists, and architects for centuries. It is an irrational number, meaning its decimal representation goes on forever without repeating, and it is approximately equal to 1.6180339887...

The below image shows how the division of consecutive Fibonacci number forms a Golden Ratio i.e,

x-axis : F(n+1)/F(n), where F( ) represents a Fibonacci number.
y-axis : represents the value of the fraction obtained in x-axis.
Fibonacci-Golden-Ratio
The ratio of successive Fibonacci numbers approximates the golden ratio, and this relationship becomes more accurate as you move further along the Fibonacci sequence.

Fibonacci Spiral:
The Fibonacci spiral is created using a series of quarter circles, with radii that correspond to the Fibonacci numbers as shown in below image:Fibonacci-Spiral

The resulting spiral is known as a "Fibonacci spiral" or a "Golden Spiral" It is often associated with the Golden Ratio, which is an irrational number approximately equal to 1.61803398875. The Fibonacci spiral is considered visually pleasing and can be found in various aspects of art, architecture, and nature due to its aesthetic qualities and mathematical significance.

Problems based on Fibonacci Number/Series:
Sum of Fibonacci Numbers
How to check if a given number is Fibonacci number?
Program to print first n Fibonacci Numbers
Program to print Fibonacci Triangle
Minimum Fibonacci terms with sum equal to K
Largest subset whose all elements are Fibonacci numbers
Tiling Problem
Fibonacci Search
Matrix Exponentiation
Count Possible Decodings of a given Digit Sequence
Count number of binary strings without consecutive 1’s
Find nth Fibonacci number using Golden ratio
Maximum games played by winner
Count possible ways to construct buildings
Find two Fibonacci numbers whose sum can be represented as N
Minimum number of Fibonacci jumps to reach end
Some Facts about Fibonacci Numbers:
The Fibonacci numbers were first mentioned in Indian mathematics in a work by Pingala on enumerating potential patterns of Sanskrit poetry built from syllables of two lengths. The numbers were named after the Italian mathematician Leonardo of Pisa, also known as Fibonacci.
The Fibonacci sequence and the golden ratio are often found in natural patterns, such as the arrangement of leaves on a stem, the spirals of a pinecone, the seeds in a sunflower, and in art and architecture, like the Parthenon in Athens.
November 23 is Fibonacci Day as it forms the first 4 digits of fibonacci numbers 11/23.
Honey bees' family tree follows fibonacci sequence.
Applications of Fibonacci Number/Series:
Mile to kilometre approximation : If a distance in miles is a fibonacci number then the succeeding fibonacci number is its kilmometer representation. Example: If we take a number from Fibonacci series i.e., 13 then the kilometre value will be 20.9215 by formulae, which is nearly 21 by rounding.
Financial Analysis: In the field of technical analysis in finance, Fibonacci retracement is a popular tool used to identify potential levels of support and resistance in stock and commodity price charts.
Art and Design: The golden ratio, which is closely related to Fibonacci numbers, is often used in art and design to create aesthetically pleasing proportions and layouts. It can be seen in architecture, paintings, and sculptures.
Data Structures and Algorithms: Fibonacci heaps, a type of data structure in computer science, are used in certain algorithms, such as Dijkstra's algorithm, for efficient graph processing.
Thumbnail for Introduction to Fibonacci Numbers
Introduction to Fibonacci Numbers
Thumbnail for Properties of Fibonacci Numbers
Properties of Fibonacci Numbers
Thumbnail for Fibonacci Divisibility and GCD
Fibonacci Divisibility and GCD
`,
    
    answer: "HI", points: 100, hint: "Each 8-bit group is a character"
  },
  {
    id: 2, title: "Cipher Shift", description: "Classic Caesar cipher",
    question: "Decrypt 'KHOOR' using a Caesar cipher with shift 3 Decrypt 'KHOOR' using a Caesar cipher with Decrypt 'KHOOR' using a Caesar cipher with shift 3Decrypt 'KHOOR' using a Caesar cipher with shift 3Decrypt 'KHOOR' using a Caesar cipher with shift 3Decrypt 'KHOOR' using a Caesar cipher with shift 3Decrypt 'KHOOR' using a Caesar cipher with shift 3shift 3 Decrypt 'KHOOR' using a Caesar cipher with shift 3 Decrypt 'KHOOR' using a Caesar cipher with shift 3v Decrypt 'KHOOR' using a Caesar cipher with shift 3Decrypt 'KHOOR' using a Caesar cipher with shift 3Decrypt 'KHOOR' using a Caesar cipher with shift 3Decrypt 'KHOOR' using a Caesar cipher with shift 3",
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
