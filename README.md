# Tini Tiny Reporter

A zero-dependency collector for logs, errors, failed network requests and other events which are emitted in your JS application, for you to further analyse.

## Example Usages
### The Simplest Case

Call `defineReporter` and all future events will be notified to you in the `report`-callback.
```javascript
import { defineReporter } from "tini-tiny-reporter"

defineReporter({
    report: (context, data) => {
        // context  -> "error" | "exception"
        // data     -> captured log or exception with timestamp and other metadata
		
        // e.g. send to server
    },
    scope: [
        "error",
        "exception",
    ]
})
```

Now, when an `Error` is thrown **anywhere** in your code, you will know. Likewise with any `console.error(...)` call.

```javascript

```

### Networking Requests and Responses

## Masking Sensitive Data

- [ ] Finish Readme
- [ ] Rename to reporter