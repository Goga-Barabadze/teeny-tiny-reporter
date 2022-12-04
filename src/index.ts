export type Scope =
	"log"
	| "info"
	| "debug"
	| "warn"
	| "error"
	| "exception"
	| "online"
	| "successfulRequest"
	| "unsuccessfulRequest"
	| "successfulResponse"
	| "unsuccessfulResponse"

type AxiosUse<V> = (
		onFulfilled?:
			((value: V) => V | Promise<V>)
			| null,
		onRejected?: ((error: any) => any) // eslint-disable-line
			| null,
		options?: any // eslint-disable-line
	) => number

type Axios = {
	interceptors: {
		request: {
			use: AxiosUse<any>, // eslint-disable-line
		},
		response: {
			use: AxiosUse<any>, // eslint-disable-line
		}
	}
}

export interface Meta {
	scope: Scope,
	timestamp?: string,
	stacktrace?: string [],
}

export interface ReporterOptions {
	// The central callback for all events
	report: (meta: Meta, ...data: any[]) => void,
	// The events you want to listen to
	scopes: Scope [],
	// References to networking frameworks, to enable their interception
	networkingFrameworks?: {
		axios?: Axios,
	}
}

/**
 * A non-intercepted version of the `console` object. It's a copy of the original `console` before anything was changed.
 *
 * @since 1.0.0
 * @see console
 * @example
 *
 * _console.log("Love is always wise, hatred is always foolish")
 * // => Logs "Love is always wise, hatred is always foolish"
 */
export const _console = console

/**
 * Calling `defineReporter` will set up all the necessary hooks/interceptions for you, to enable the reporting of events
 * which you configure with the `scopes` option.
 *
 * @since 1.0.0
 * @param options as defined with the `ReporterOptions` interface
 * @see ReporterOptions
 * @example
 *
 * import { defineReporter } from "tini-tiny-reporter"
 *
 * defineReporter({
 *     report: (meta, data) => {
 *     	   // e.g. send to the central logs
 *     },
 *     networkingFrameworks: {
 *         axios,
 *     },
 *     scopes: [
 *         "exception",
 *         "error",
 *         "unsuccessfulRequest",
 *         "unsuccessfulResponse",
 *     ],
 * })
 */
export const defineReporter = (options: ReporterOptions) => {

	const _report = options.report
	// Intercept the internal report call and add metadata
	options.report = (meta, ...data: any []) => {
		if (options.scopes.includes(meta.scope)) {
			const date = new Date()

			const stacktrace = Error().stack?.split("\n")
			stacktrace?.shift() // Remove internal report interception
			stacktrace?.shift() // Remove internal report call

			meta = {
				...meta,
				timestamp: `${date.toLocaleString()}:${date.getMilliseconds()}`,
				stacktrace,
			}

			_report(meta, ...data)
		}
	}

	console = {
		..._console,
		log(...data: any[]): void {
			_console.log(...data)
			options.report({ scope: "log" }, ...data)
		},
		info(...data: any[]): void {
			_console.info(...data)
			options.report({ scope: "info" }, ...data)
		},
		debug(...data: any[]): void {
			_console.debug(...data)
			options.report({ scope: "debug" }, ...data)
		},
		warn(...data: any[]): void {
			_console.warn(...data)
			options.report({ scope: "warn" }, ...data)
		},
		error(...data: any[]): void {
			_console.error(...data)
			options.report({ scope: "error" }, ...data)
		},
	}

	window.onerror = (event, source, lineno, colno, error) => {
		const data = {
			event,
			source,
			lineno,
			colno,
			error,
		}

		options.report({ scope: "exception" }, data)
	}

	window.ononline = () => {
		options.report({ scope: "online" }, { message: "Device is online again." })
	}

	const _fetch = fetch
	window.fetch = async (input, init) => {
		return await _fetch(input, init) // TODO: "successfulRequest" and "unsuccessfulRequest"
			.then(value => {
				options.report({ scope: "successfulResponse" }, value)
				return value
			})
			.catch(reason => {
				options.report({ scope: "unsuccessfulResponse" }, reason)
				return reason
			})
	}

	options.networkingFrameworks?.axios?.interceptors.request.use(value => {
		options.report({ scope: "successfulRequest" }, value)
		return value
	}, error => {
		options.report({ scope: "unsuccessfulRequest" }, error)
		return error
	})

	options.networkingFrameworks?.axios?.interceptors.response.use(value => {
		options.report({ scope: "successfulResponse" }, value)
		return value
	}, error => {
		options.report({ scope: "unsuccessfulResponse" }, error)
		return error
	})
}