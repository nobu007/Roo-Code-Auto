import { describe, test, expect, beforeEach, afterEach } from "vitest"
import { IpcServer } from "./ipc-server.js"
import { ProviderSettings } from "@roo-code/types"

describe("IpcServer VSCode LM Integration", () => {
	let server: IpcServer
	const socketPath = "/tmp/test-ipc-server"

	beforeEach(() => {
		server = new IpcServer(socketPath)
	})

	afterEach(() => {
		// Clean up if needed
	})

	test("should set and get provider settings", () => {
		const testSettings: ProviderSettings = {
			apiProvider: "vscode-lm",
			vsCodeLmModelSelector: {
				vendor: "microsoft",
				family: "copilot",
				version: "1.0",
				id: "copilot-chat",
			},
			includeMaxTokens: true,
			diffEnabled: false,
		}

		// Set provider settings
		server.setProviderSettings(testSettings)

		// Get provider settings
		const retrievedSettings = server.getProviderSettings()
		expect(retrievedSettings).toEqual(testSettings)
	})

	test("should check if VSCode LM is configured", () => {
		// Initially not configured
		expect(server.isVsCodeLmConfigured()).toBe(false)

		// Set VSCode LM provider
		const vsCodeLmSettings: ProviderSettings = {
			apiProvider: "vscode-lm",
			vsCodeLmModelSelector: {
				vendor: "microsoft",
				family: "copilot",
			},
		}

		server.setProviderSettings(vsCodeLmSettings)
		expect(server.isVsCodeLmConfigured()).toBe(true)

		// Set different provider
		const anthropicSettings: ProviderSettings = {
			apiProvider: "anthropic",
			apiKey: "test-key",
		}

		server.setProviderSettings(anthropicSettings)
		expect(server.isVsCodeLmConfigured()).toBe(false)
	})

	test("should get VSCode LM model selector", () => {
		const modelSelector = {
			vendor: "microsoft",
			family: "copilot",
			version: "1.0",
			id: "copilot-chat",
		}

		const settings: ProviderSettings = {
			apiProvider: "vscode-lm",
			vsCodeLmModelSelector: modelSelector,
		}

		server.setProviderSettings(settings)

		const retrievedSelector = server.getVsCodeLmModelSelector()
		expect(retrievedSelector).toEqual(modelSelector)
	})

	test("should return null for model selector when not VSCode LM", () => {
		const settings: ProviderSettings = {
			apiProvider: "anthropic",
			apiKey: "test-key",
		}

		server.setProviderSettings(settings)

		const retrievedSelector = server.getVsCodeLmModelSelector()
		expect(retrievedSelector).toBe(null)
	})

	test("should get available providers", () => {
		const providers = server.getAvailableProviders()
		expect(providers).toContain("vscode-lm")
		expect(providers).toContain("anthropic")
		expect(providers).toContain("openai")
	})

	test("should check provider availability", () => {
		expect(server.isProviderAvailable("vscode-lm")).toBe(true)
		expect(server.isProviderAvailable("anthropic")).toBe(true)
		expect(server.isProviderAvailable("nonexistent-provider")).toBe(false)
	})

	test("should throw error for invalid provider settings", () => {
		const invalidSettings = {
			apiProvider: "invalid-provider",
			someInvalidProperty: "test",
		}

		expect(() => {
			server.setProviderSettings(invalidSettings as unknown as ProviderSettings)
		}).toThrow("Invalid provider settings")
	})

	test("should handle VSCode LM settings validation", () => {
		const validVsCodeLmSettings: ProviderSettings = {
			apiProvider: "vscode-lm",
			vsCodeLmModelSelector: {
				vendor: "microsoft",
				family: "copilot",
				version: "1.0",
				id: "copilot-chat",
			},
			includeMaxTokens: true,
			diffEnabled: false,
			modelTemperature: 0.7,
			rateLimitSeconds: 60,
		}

		expect(() => {
			server.setProviderSettings(validVsCodeLmSettings)
		}).not.toThrow()

		expect(server.isVsCodeLmConfigured()).toBe(true)
		expect(server.getVsCodeLmModelSelector()).toEqual(validVsCodeLmSettings.vsCodeLmModelSelector)
	})
})
