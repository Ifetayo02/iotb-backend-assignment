<-- CLASS 31: Node.js Runtime, Buffer, Streams & Bun -->
1. First line: [
  '/usr/local/bin/node',
  '/path/to/app.js',
  '--port',
  '8080',
  '--host',
  'localhost'
]
Second line : [ '--port', '8080', '--host', 'localhost' ]

process.argv[0] is the path to the Node.js executable that's running the script, process.argv[1] is the path to the script file being executed (app.js), and everything from index 2 onward is the actual list of arguments thai is passed to the command line
they are different because process.argv array has 6 elements in total and process.argv.slice(2) removes the first two elements of the array before returning it.
2. We use .slice(2) because indices 0 and 1 are implementation details of how your script got run, not information about what the user wants. Our CLI logic should only contain the actual arguments the user passed by convention and passing argv[0] and argv[1] into our logic couples our code to the launcher, which pointless. Without slicing,we would have an offset which is not reliable as .slice(2) gets us a stable starting point for the "user's args"
3. The three outputs:
10
5
5
Why line 1 (10) differs from line 2 (5):
Buffer.from(str).length returns the number of bytes needed to store the string in UTF-8 encoding and not the number of chracters.
using UTF-8:
hello is 5 ASCII character and every ASCII character takes up exactly one byte making it 5 bytes
the second line is arabic and arabic is out of ASCII range and each character requires two bytes to encode making it 10 bytes
Why line 3 (5) differs from line 1 (10):
length in JavaScript does not count bytes at all but counts UTF-16 code units
4. readFileSync loads the whole 5 GB file into memory. The OS reads all those bytes in, then because we asked for "utf8", Node decodes them into a JS string and JS strings use UTF-16 internally, which takes more space than UTF-8 (2 bytes per character vs. 1 for plain text). So the 5 GB file can spinball to something like 10 GB just sitting in memory, as one giant string, before our code even runs.
The string lives on V8's heap (the JS engine's memory space)
createReadStream never loads the whole thing. It reads the file in small chunks (64 KB by default), hands you each chunk to process, then throws it away and grabs the next one to preserve memory. 