import EventEmitter from "node:events"
import * as crypto from "node:crypto"

import ipc from "node-ipc"
import axios from "axios"
import type { Redis } from "redis"
import type EventSource from "eventsource"

import {
	type TaskCommand,
	type IpcClientEvents,
	type IpcMessage,
	type RooCodeSettings,
	IpcOrigin,
	IpcMessageType,
	ipcMessageSchema,
	TaskCommandName,
} from "@roo-code/types"

interface ExtendedTaskEvent {
	runId: string
	taskId: string
	event: "started" | "completed" | "failed" | "progress"
	data?: unknown
	timestamp: number
}

interface RunConfig {
	name: string
	description: string
	model: string
	tasks: Array<{
		id: string
		description: string
		type: string
	}>
}

interface ApiResponse {
	id: string
	[key: string]: unknown
}

export class IpcClient extends EventEmitter<IpcClientEvents> {
	private readonly _socketPath: string
	private readonly _id: string
	private readonly _log: (...args: unknown[]) => void
	private _isConnected = false
	private _clientId?: string
	private _redisClient: Redis | null = null
	private _eventSource: EventSource | null = null
	private _reconnectAttempts = 0
	private readonly _maxReconnectAttempts = 3
	private readonly _retryInterval = 1500
	private readonly _redisUrl: string
	private readonly _rooApiUrl: string

	constructor(
		socketPath: string,
		options: {
			log?: (...args: unknown[]) => void
			redisUrl?: string
			rooApiUrl?: string
		} = {},
	) {
		super()

		this._socketPath = socketPath
		this._id = `roo-code-evals-${crypto.randomBytes(6).toString("hex")}`
		this._log = options.log || console.log
		this._redisUrl = options.redisUrl || process.env.REDIS_URL || "redis://localhost:6379"
		this._rooApiUrl = options.rooApiUrl || process.env.ROO_API_URL || "http://localhost:3446"

		ipc.config.silent = true

		this.setupRedis()

		ipc.connectTo(this._id, this.socketPath, () => {
			ipc.of[this._id]?.on("connect", () => this.onConnect())
			ipc.of[this._id]?.on("disconnect", () => this.onDisconnect())
			ipc.of[this._id]?.on("message", (data) => this.onMessage(data))
		})
	}

	private onConnect() {
		if (this._isConnected) {
			return
		}

		this.log("[client#onConnect]")
		this._isConnected = true
		this.emit(IpcMessageType.Connect)
	}

	private onDisconnect() {
		if (!this._isConnected) {
			return
		}

		this.log("[client#onDisconnect]")
		this._isConnected = false
		this.emit(IpcMessageType.Disconnect)
	}

	private onMessage(data: unknown) {
		if (typeof data !== "object") {
			this._log("[client#onMessage] invalid data", data)
			return
		}

		const result = ipcMessageSchema.safeParse(data)

		if (!result.success) {
			this.log("[client#onMessage] invalid payload", result.error, data)
			return
		}

		const payload = result.data

		if (payload.origin === IpcOrigin.Server) {
			switch (payload.type) {
				case IpcMessageType.Ack:
					this._clientId = payload.data.clientId
					this.emit(IpcMessageType.Ack, payload.data)
					break
				case IpcMessageType.TaskEvent:
					this.emit(IpcMessageType.TaskEvent, payload.data)
					break
			}
		}
	}

	private log(...args: unknown[]) {
		this._log(...args)
	}

	public sendCommand(command: TaskCommand) {
		const message: IpcMessage = {
			type: IpcMessageType.TaskCommand,
			origin: IpcOrigin.Client,
			clientId: this._clientId!,
			data: command,
		}

		this.sendMessage(message)
	}

	public sendMessage(message: IpcMessage) {
		ipc.of[this._id]?.emit("message", message)
	}

	public disconnect() {
		try {
			ipc.disconnect(this._id)
			if (this._redisClient) {
				this._redisClient.quit()
			}
			if (this._eventSource) {
				this._eventSource.close()
			}
		} catch (error) {
			this.log("[client#disconnect] error disconnecting", error)
		}
	}

	public get socketPath() {
		return this._socketPath
	}

	public get clientId() {
		return this._clientId
	}

	public get isConnected() {
		return this._isConnected
	}

	public get isReady() {
		return this._isConnected && this._clientId !== undefined
	}

	// --- Redis Integration ---
	private async setupRedis(): Promise<void> {
		try {
			// Dynamic import to avoid module resolution issues
			const { createClient } = await import("redis")
			const redisClient = createClient({ url: this._redisUrl })

			redisClient.on("error", (err: Error) => {
				if (process.env.DEBUG) {
					this.log("Redis error:", err)
				}
			})

			redisClient.on("connect", () => {
				this.log("✅ Connected to Redis")
			})

			await redisClient.connect()
			this._redisClient = redisClient
		} catch (error) {
			if (process.env.DEBUG) {
				this.log("❌ Failed to connect to Redis:", error)
			}
		}
	}

	public async subscribeToTaskEvents(runId: string): Promise<void> {
		if (!this._redisClient) {
			this.log("❌ Redis client not available")
			return
		}

		try {
			const channel = `task_events:${runId}`
			await this._redisClient.subscribe(channel, (message: string) => {
				try {
					const event: ExtendedTaskEvent = JSON.parse(message)
					this.handleTaskEvent(event)
				} catch (error) {
					this.log("Error parsing task event:", error)
				}
			})
			this.log(`📡 Subscribed to task events for run: ${runId}`)
		} catch (error) {
			this.log("❌ Failed to subscribe to task events:", error)
		}
	}

	private handleTaskEvent(event: ExtendedTaskEvent): void {
		this.log("📋 Task event received:", event)
		// Process task events from Redis
		this.emit("taskEvent", event)
	}

	// --- HTTP/SSE Integration ---
	public async connectToSSE(runId: string): Promise<void> {
		try {
			// Dynamic import to avoid module resolution issues
			const EventSource = (await import("eventsource")).default
			const sseUrl = `${this._rooApiUrl}/runs/${runId}/events`
			this._eventSource = new EventSource(sseUrl)

			this._eventSource.onopen = () => {
				this.log("✅ Connected to SSE stream")
			}

			this._eventSource.onmessage = (event: { data: string }) => {
				try {
					const data = JSON.parse(event.data)
					this.handleSSEEvent(data)
				} catch (error) {
					this.log("Error parsing SSE event:", error)
				}
			}

			this._eventSource.onerror = (error: Event) => {
				this.log("SSE error:", error)
			}
		} catch (error) {
			this.log("❌ Failed to connect to SSE:", error)
		}
	}

	private handleSSEEvent(event: unknown): void {
		this.log("📡 SSE event received:", event)
		// Process real-time updates from SSE
		this.emit("sseEvent", event)
	}

	// --- HTTP API Methods ---
	public async getRun(runId: string): Promise<ApiResponse> {
		try {
			const response = await axios.get(`${this._rooApiUrl}/runs/${runId}`)
			return response.data as ApiResponse
		} catch (error) {
			this.log("❌ Failed to get run:", error)
			throw error
		}
	}

	public async createRun(config: RunConfig): Promise<ApiResponse> {
		try {
			const response = await axios.post(`${this._rooApiUrl}/runs`, config)
			return response.data as ApiResponse
		} catch (error) {
			this.log("❌ Failed to create run:", error)
			throw error
		}
	}

	public async getTaskResults(runId: string, taskId: string): Promise<ApiResponse> {
		try {
			const response = await axios.get(`${this._rooApiUrl}/runs/${runId}/tasks/${taskId}/results`)
			return response.data as ApiResponse
		} catch (error) {
			this.log("❌ Failed to get task results:", error)
			throw error
		}
	}

	// --- Enhanced Communication Methods ---
	public async sendChat(text: string, configuration?: RooCodeSettings): Promise<void> {
		if (!this.isReady) {
			this.log("❌ Client not ready for communication")
			return
		}

		try {
			const command: TaskCommand = {
				commandName: TaskCommandName.StartNewTask,
				data: {
					configuration: configuration || ({} as RooCodeSettings),
					text: text,
					newTab: true,
				},
			}

			this.sendCommand(command)
			this.log(`📤 Sent chat message: ${text.substring(0, 50)}...`)
		} catch (error) {
			this.log("❌ Failed to send chat:", error)
		}
	}

	public sendTaskCommand(taskId: string, commandName: TaskCommandName, _data?: unknown): void {
		if (!this.isReady) {
			this.log("❌ Client not ready for communication")
			return
		}

		let command: TaskCommand
		switch (commandName) {
			case TaskCommandName.CancelTask:
				command = {
					commandName: TaskCommandName.CancelTask,
					data: taskId,
				}
				break
			case TaskCommandName.CloseTask:
				command = {
					commandName: TaskCommandName.CloseTask,
					data: taskId,
				}
				break
			default:
				this.log("❌ Unsupported task command:", commandName)
				return
		}

		this.sendCommand(command)
		this.log(`📤 Sent task command: ${commandName} for task: ${taskId}`)
	}

	// --- Reconnection Logic ---
	public async reconnect(): Promise<void> {
		if (this._reconnectAttempts < this._maxReconnectAttempts) {
			this._reconnectAttempts++
			this.log(`🔄 Reconnection attempt ${this._reconnectAttempts}/${this._maxReconnectAttempts}`)

			setTimeout(async () => {
				try {
					await this.connect()
					this._reconnectAttempts = 0
				} catch (err) {
					this.log("Reconnection failed:", err)
					if (this._reconnectAttempts >= this._maxReconnectAttempts) {
						this.log("❌ Max reconnection attempts reached")
						this.emit("maxReconnectAttemptsReached")
					}
				}
			}, this._retryInterval)
		} else {
			this.log("❌ Max reconnection attempts reached")
			this.emit("maxReconnectAttemptsReached")
		}
	}

	public async connect(): Promise<void> {
		try {
			// Test connection to Roo API
			await axios.get(`${this._rooApiUrl}/`)
			this.log("✅ Connected to Roo API")

			// Setup Redis connection
			await this.setupRedis()
		} catch (error) {
			this.log("❌ Failed to connect to Roo API:", error)
			throw error
		}
	}

	// --- Utility Methods ---
	public getConnectionStatus(): string {
		return this._isConnected ? "Connected" : "Disconnected"
	}

	public get redisClient() {
		return this._redisClient
	}

	public get rooApiUrl() {
		return this._rooApiUrl
	}
}
