export type Scope =
	"log"
	| "info"
	| "debug"
	| "warn"
	| "error"
	| "exception"
	| "onOnline"
	| "onSuccessfulRequest"
	| "onUnsuccessfulRequest"
	| "onSuccessfulResponse"
	| "onUnsuccessfulResponse"

// eslint-disable-next-line
type AxiosUse<V> = (onFulfilled?: ((value: V) => V | Promise<V>) | null, onRejected?: ((error: any) => any) | null, options?: any) => number

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

export interface ReporterOptions {
	report: (context: Scope, ...data: any []) => void
	scope: Scope []
	networkingFrameworks?: {
		axios?: Axios,
	}
}

export const _console = console

export const defineReporter = (options: ReporterOptions) => {

	const _report = options.report
	options.report = (scope, data) => {
		if (options.scope.includes(scope)) {
			const date = new Date()
			data = {
				data,
				context: scope,
				timestamp: `${new Date().toLocaleString()}:${date.getMilliseconds()}`,
			}
			_report(scope, data)
		}
	}

	console = {
		..._console,
		log(...data: any[]): void {
			_console.log(...data)
			options.report("log", ...data)
		},
		info(...data: any[]): void {
			_console.info(...data)
			options.report("info", ...data)
		},
		debug(...data: any[]): void {
			_console.debug(...data)
			options.report("debug", ...data)
		},
		warn(...data: any[]): void {
			_console.warn(...data)
			options.report("warn", ...data)
		},
		error(...data: any[]): void {
			_console.error(...data)
			options.report("error", ...data)
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

		options.report("exception", data)
	}

	window.ononline = () => {
		options.report("onOnline", { message: "Device is online again." })
	}

	options.networkingFrameworks?.axios?.interceptors.request.use(value => {
		options.report("onSuccessfulRequest", value)
		return value
	}, error => {
		options.report("onUnsuccessfulRequest", error)
		return error
	})

	options.networkingFrameworks?.axios?.interceptors.response.use(value => {
		options.report("onSuccessfulResponse", value)
		return value
	}, error => {
		options.report("onUnsuccessfulResponse", error)
		return error
	})
}