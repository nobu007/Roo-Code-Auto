import EventEmitter from "node:events"
import { Socket } from "node:net"
import * as crypto from "node:crypto"

import ipc from "node-ipc"

import {
	type IpcServerEvents,
	type RooCodeIpcServer,
	IpcOrigin,
	IpcMessageType,
	type IpcMessage,
	ipcMessageSchema,
	type ProviderSettings,
	providerSettingsSchema,
	providerNames,
	type TaskCommand,
	TaskCommandName,
} from "@roo-code/types"

export class IpcServer extends EventEmitter<IpcServerEvents> implements RooCodeIpcServer {
	private readonly _socketPath: string
	private readonly _log: (...args: unknown[]) => void
	private readonly _clients: Map<string, Socket>
	private _providerSettings: ProviderSettings | null = null

	private _isListening = false

	constructor(socketPath: string, log = console.log) {
		super()

		this._socketPath = socketPath
		this._log = log
		this._clients = new Map()
	}

	public listen() {
		this._isListening = true

		ipc.config.silent = true

		ipc.serve(this.socketPath, () => {
			ipc.server.on("connect", (socket) => this.onConnect(socket))
			ipc.server.on("socket.disconnected", (socket) => this.onDisconnect(socket))
			ipc.server.on("message", (data) => this.onMessage(data))
		})

		ipc.server.start()
	}

	private onConnect(socket: Socket) {
		const clientId = crypto.randomBytes(6).toString("hex")
		this._clients.set(clientId, socket)
		this.log(`[server#onConnect] clientId = ${clientId}, # clients = ${this._clients.size}`)

		this.send(socket, {
			type: IpcMessageType.Ack,
			origin: IpcOrigin.Server,
			data: { clientId, pid: process.pid, ppid: process.ppid },
		})

		this.emit(IpcMessageType.Connect, clientId)
	}

	private onDisconnect(destroyedSocket: Socket) {
		let disconnectedClientId: string | undefined

		for (const [clientId, socket] of this._clients.entries()) {
			if (socket === destroyedSocket) {
				disconnectedClientId = clientId
				this._clients.delete(clientId)
				break
			}
		}

		this.log(`[server#socket.disconnected] clientId = ${disconnectedClientId}, # clients = ${this._clients.size}`)

		if (disconnectedClientId) {
			this.emit(IpcMessageType.Disconnect, disconnectedClientId)
		}
	}

	private onMessage(data: unknown) {
		if (typeof data !== "object") {
			this.log("[server#onMessage] invalid data", data)
			return
		}

		const result = ipcMessageSchema.safeParse(data)

		if (!result.success) {
			this.log("[server#onMessage] invalid payload", result.error.format(), data)
			return
		}

		const payload = result.data

		if (payload.origin === IpcOrigin.Client) {
			switch (payload.type) {
				case IpcMessageType.TaskCommand:
					this.handleTaskCommand(payload.clientId, payload.data)
					break
				default:
					this.log(`[server#onMessage] unhandled payload: ${JSON.stringify(payload)}`)
					break
			}
		}
	}

	private handleTaskCommand(clientId: string, data: TaskCommand) {
		switch (data.commandName) {
			case TaskCommandName.SetProviderSettings:
				try {
					this.setProviderSettings(data.data)
					this.send(clientId, {
						type: IpcMessageType.ProviderSettingsResponse,
						origin: IpcOrigin.Server,
						data: { success: true },
					})
				} catch (error) {
					this.log(`[server#handleTaskCommand] SetProviderSettings error:`, error)
					this.send(clientId, {
						type: IpcMessageType.ProviderSettingsResponse,
						origin: IpcOrigin.Server,
						data: { success: false, error: String(error) },
					})
				}
				break
			case TaskCommandName.GetProviderSettings: {
				const settings = this.getProviderSettings()
				this.send(clientId, {
					type: IpcMessageType.ProviderSettingsResponse,
					origin: IpcOrigin.Server,
					data: { success: true, settings: settings || undefined },
				})
				break
			}
			default:
				// 他のコマンドは既存のイベントエミッターに委譲
				this.emit(IpcMessageType.TaskCommand, clientId, data)
				break
		}
	}

	private log(...args: unknown[]) {
		this._log(...args)
	}

	public broadcast(message: IpcMessage) {
		// this.log("[server#broadcast] message =", message)
		ipc.server.broadcast("message", message)
	}

	public send(client: string | Socket, message: IpcMessage) {
		// this.log("[server#send] message =", message)

		if (typeof client === "string") {
			const socket = this._clients.get(client)

			if (socket) {
				ipc.server.emit(socket, "message", message)
			}
		} else {
			ipc.server.emit(client, "message", message)
		}
	}

	public get socketPath() {
		return this._socketPath
	}

	public get isListening() {
		return this._isListening
	}

	/**
	 * VSCode LM プロバイダー設定を設定する
	 */
	public setProviderSettings(settings: ProviderSettings) {
		const validationResult = providerSettingsSchema.safeParse(settings)

		if (!validationResult.success) {
			this.log("[server#setProviderSettings] Invalid provider settings:", validationResult.error.format())
			throw new Error("Invalid provider settings")
		}

		this._providerSettings = validationResult.data
		this.log("[server#setProviderSettings] Provider settings updated successfully")
	}

	/**
	 * 現在のプロバイダー設定を取得する
	 */
	public getProviderSettings(): ProviderSettings | null {
		return this._providerSettings
	}

	/**
	 * VSCode LM プロバイダーが設定されているかチェックする
	 */
	public isVsCodeLmConfigured(): boolean {
		return this._providerSettings?.apiProvider === "vscode-lm"
	}

	/**
	 * VSCode LM のモデルセレクターを取得する
	 */
	public getVsCodeLmModelSelector() {
		if (!this.isVsCodeLmConfigured()) {
			return null
		}

		return this._providerSettings?.vsCodeLmModelSelector || null
	}

	/**
	 * 利用可能なプロバイダー名の一覧を取得する
	 */
	public getAvailableProviders(): readonly string[] {
		return providerNames
	}

	/**
	 * 指定されたプロバイダーが利用可能かチェックする
	 */
	public isProviderAvailable(providerName: string): boolean {
		return (providerNames as readonly string[]).includes(providerName)
	}
}
