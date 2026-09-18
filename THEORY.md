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
5. .pipe() moves data from a readable stream to a writable stream, but it does not deal with what happens when things go wrong.
pipeline() does the same data-moving job, but wraps it with proper error handling and cleanup in case of errors 
Failure scenario:

Let's assume we're streaming a large file into a writable stream that writes to disk, but the destination disk fills up halfway through.
When writable hits no space left on device and errors out, .pipe() does not automatically stop readable. The readable stream keeps reading chunks from disk and trying to push them into a writable that's already dead and those chunks have nowhere to go, so they just sit in memory, un-drained but the moment writable errors on no space left on device, pipeline() automatically calls .destroy() on readable too and close its file descriptor and stops it from reading further. The callback fires with the error, so you know exactly what happened and when. Nothing leaks, nothing hangs silently
6. '4e6f64652e6a73'
'Tm9kZS5qcw=='
7. Flat means memory usage stays the same no matter how big the file gets 

Bucket approach (`readFileSync`): load the whole file into memory at once.
- 10,000 rows → small memory use
- 10,000,000 rows → memory use growsalong with it

Memory grows linearly with file size and increasing the rows, roughly double the memory.

Pipe approach (streaming): only a small chunk (e.g. 64 KB) sits in memory at any moment — read it, process it, drop it, grab the next.
- 10,000 rows → tiny, constant memory
- 10,000,000 rows → same tiny, constant memory

Memory stays flat because it's never holding the whole file any attempt to actually increase the rows does not really affect the memory