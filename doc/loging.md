# Logging

## Standard logging

- **Fatal** something seriously
- **Error** important events that will cause the program execution to fail
- **Warn** crucial events that should be noticed to prevent fails
- **Notice** notable events that are not considered an error
- **Info** important events that detail a completed task
- **Debug** trace everyting, remove unensecary before commit
- **Trace** debug only during developemnt (have to be removed before commit)

## Native console.log

- **Log** Same as console.log - use only during development

## Loops and intervals operations loging

- **add + flush** for loging inside loop block use only during development

## Examples:

```js
logger.trace("Trace message example");
logger.debug("Debug message example");
logger.info("Info message example");
logger.notice("Notice message example");
logger.warn("Warn message example");
logger.error("Error message example");
logger.fatal("Fatal message example");

// print out objects in string format (JSON.stringify)
logger.trace([{a: "a"}]);
logger.trace({a: "a"});

// same as console.log
logger.log([{a: "a"}]);

// for intervals and loops
for...{
  logger.add("something")
}
logger.flush()

```
