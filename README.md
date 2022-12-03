# Tini Tiny Reporter

A zero-dependency reporter for logs, errors, failed network requests and other events which are emitted in your JS application, at one spot, for you to further analyse.

## Example Usages
### The Simplest Case

Call `defineReporter` and all future events will be notified to you in the `report`-callback.
```javascript
import { defineReporter } from "tini-tiny-reporter"

defineReporter({
    report: (meta, data) => {
        // meta -> "error" | "exception", timestamp and stack
        // data -> captured log or exception
		
        // e.g. send to server
    },
    scopes: [
        "error",
        "exception",
    ]
})
```

Now, when an `Error` is thrown **anywhere** in your code, you will know. Likewise with any `console.error(...)` call.

```javascript
// Somewhere in your code
console.error("Something unexpected happened...")

// meta -> { "scope": "error", "timestamp": "03/12/2022, 14:27:00:210", "stacktrace": [...] }
// data -> "Something unexpected happened..."
```

### Networking Requests and Responses

## Masking Sensitive Data

- [ ] Finish Readme