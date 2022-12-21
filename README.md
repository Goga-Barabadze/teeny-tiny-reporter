# Tini Tiny Reporter

A zero-dependency reporter for logs, errors, failed network requests and other events which are emitted in your JS application, at one spot, for you to further analyse.

## Example Usages
### A simple example

Call `defineReporter` and all future events from that moment on will be reported to you in the `report`-callback.
```javascript
import { defineReporter } from "tini-tiny-reporter"

defineReporter({
    report: (meta, data) => {
        // meta -> "error" | "exception", timestamp and stack
        // data -> captured log or exception
		
        // e.g. send to the central logs

        // Note: Events emitted in the callback are not reported
    },
    scopes: [
        "error",
        "exception",
    ],
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
`tini-tiny-reporter` can notify you when requests or their responses succeeded or failed with their own scopes. `Fetch` is supported without the need of configuration, `axios` needs to be passed to `defineReporter`:
```javascript
import { defineReporter } from "tini-tiny-reporter"
import axios from "axios"

defineReporter({
    report: (meta, data) => {
        // ...
    },
    networkingFrameworks: {
        axios,
    },
    scopes: [
        "error",
        "exception",
        "unsuccessfulRequest",  // also: successfulRequest
        "unsuccessfulResponse", // also: successfulResponse
    ],
})
```

## All Scopes

| **Scope**               |                      **Notes**                       |
|:------------------------|:----------------------------------------------------:|
| `log`                   |                    `console.log`                     |
| `info`                  |                    `console.info`                    |
| `debug`                 |                   `console.debug`                    |
| `warn`                  |                    `console.warn`                    |
| `error`                 |                   `console.error`                    |
| `exception`             |                 `throw new Error()`                  |
| `online`                |         We have re-established connectivity          |
| `successfulRequest`     |            Request went down as expected             |
| `unsuccessfulRequest`   |   Something bad happened while sending the request   |
| `successfulResponse`    |          Response was received as expected           |
| `unsuccessfulResponse`  | Something didn't happen as planned with the response |

