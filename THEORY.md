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
8. 
 Native TypeScript execution
 Built-in test runner, bundler, and package manager
 Faster cold starts and lower memory footprint
 Whether i will choose bun or Node on a real team project today and why: the "right" runtime is the one that removes friction for your specific workflow, not the one with the best benchmark headline so my choice will depend on my team's workflow

 <-- CLASS 32: Express & TypeScript -->
 9. { hit: "by-id", id: "featured" }
 Route 1 (/api/products/:id) as Express stops at the first matching route, so route 2 (the actual /featured route) never even gets checked.

 { hit: "by-id", id: "42" }
 Route 2 does not get checked because of the wildcard sitting on the top of the page

 { hit: "fallback" }
 app.use mounts middleware on a path prefix and is not an exact route itself so it matches the given path and anything nested under it. 
10. Type of req.params.id: it's always a string no matter what the URL actually contains.
The expression to convert it:
 Number(req.params.id);
 Why express does not convert it:
 URL paths are just text to Express and it has no way of knowing which is a number.
 11. Routes — decide which URL and HTTP method triggers which handler.
 Controllers — handle the HTTP conversation: parse the request, call the right service, and shape the response. 
 Services — contain the actual logic and data access: where products come from, how they're filtered/validated/transformed, completely independent of HTTP concerns.
 which file do i edit?
 i will edit only product.service.ts because CSV is purely an implementation detail inside the service but the content it exposes to the rest of the app stays identical. That's the entire value of separating these layers
 12. the missing line:
 app.use(express.json()); and it should be at the top of the page 
 Express, by default, does not parse the incoming request body at all. When a request arrives, Express hands your handler the raw HTTP request and express.json() is a middleware that runs before your handlers: it checks for Content-Type: application/json, reads and parses the body, and attaches the result to req.body.
 middleware runs in registration order (same "first match wins" logic as routes), it has to come before the routes that need it and  registering it after the POST route means requests reach the handler before the parser ever runs.
13. app.use("/api/products", productRouter) mounts productRouter at the /api/products prefix and every route defined inside that router gets /api/products automatically stitched onto the front of it.
router.get("/", ...)	returns GET /api/products
    router.get("/:id", ...)	returns GET /api/products/:id 
    router.get("/top") returns GET /api/products/top
14. Successful POST creating a product → 201 Created
    201 specifically signals that a new resource was created
    Request for a product id that doesn't exist → 404 Not Found
    404 indicates that nothing matches the identifier you are trying to look for.
    POST missing a required name field → 400 Bad Request
    This is a client error as the request itself is invalid
    Unexpected crash inside a route handler → 500 Internal Server Error
    This is a server-side failure and the server itself failed to complete a valid request
    Successful GET returning a list → 200 OK
    Typical request succeeded
 <--CLASS 33: Middleware & Error Handling-->
15. M1 in
M2 GET /
handler starts
handler ends
M1 out
When M1 out runs, and why:
M1 out runs after the route handler completes 
The reason is that next() is a function call that doesn't return until everything downstream of it finishes
16. Client sees: nothing. The request just hangs.
    Terminal sees: nothing either.
    Why Express can't guess "done": middleware often does async work (DB calls, API requests), so Express has no way to know if silence means it is still working and treats silence as still in progress. Sending response and calling are the only way express understands "done"
17. Why Express treats both differently:
Express doesn't inspect what the function does and decides purely by counting the function's declared parameters. If it has three parameters,express registers it as a normal middleware but if it has 4 parameters,then express treats it as an error handler.
What happens if we clean up B to only three parameters:
Express no longer recognizes it as an error handler at all. It gets registered as regular middleware instead
18. next() takes no argument and moves to the next matching middleware/route
next(err) takes an argument and tells Express that something has gone wrong and to skip all remaining middleware and jump to the nearest error-handling middleware 
Express distinguishes these purely by whether an argument was passed
Pipeline: [logger, json, routes, errorHandler]
a) logger runs next()
json runs next()
routes runs, calls next() partway through
   Express looks for the NEXT regular middleware after routes
   there isn't one (errorHandler is an error-handler, not regular middleware)
  if nothing else matches, Express falls through to its default 404 handler
  b) logger runs  next()
json runs next()
routes runs, calls next(err) partway through
  → Express immediately abandons the normal middleware chain
  → skips any remaining regular middleware/routes entirely
  → jumps straight to errorHandler (the first 4-argument middleware it finds)

19. res.on("finish", callback) just subscribes a listener and doesn't run anything. next() then hands off to the handler, which calls res.send(). But sending data over the network is async I/O, so .send() returns immediately and once the response is fully sent, Node fires "finish" and only then does the callback run and log.
So even though the listener is set up before the handler runs, its callback fires after, because it's waiting on an event that can't happen until sending is truly done
20. Express 4: Nothing catches the rejection automatically. If findProduct(id) throws, the request just hangs and the terminal may show an unhandled rejection warning, but Express's error middleware never fires.
Express 5: Rejected promises from async handlers are caught automatically and forwarded straight to the error middleware (err, req, res, next) with no extra code needed.
try/catch + next(err)
asyncHandler wrapper (avoids repeating try/catch everywhere)
To check express version:
npm list express
21. A 404 means Express checked every registered route and middleware, and none of them matched the incoming URL/method at all
while A 500 means a route did match and its handler did run but something went wrong during execution.

Why the 404 handler must come before the error handler:
Both middleware run in registration order, same as every route. The 404 handler is just a regular catch-all middleware. Registering the 404 handler before the error handler means: if no route matched, Express falls through the regular chain, hits the 404 handler, and responds. The error handler sits after it, ready to catch anything that explicitly errors out via next(err)
what happens when they are swapped: actual errors now have no error handler to catch them
Swapping the last two doesn't break the 404-handler's fundamental job, but it invites bugs and confusion about where errors actually get caught, especially in larger apps with more middleware