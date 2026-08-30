import { IpcServer } from "./ipc-server.js"
import { ProviderSettings } from "@roo-code/types"

/**
 * VSCode LM プロバイダーを使用するサンプル
 */
export function vsCodeLmExample() {
	const server = new IpcServer("/tmp/roo-code-ipc")

	// VSCode LM設定の例
	const vsCodeLmSettings: ProviderSettings = {
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
		enableReasoningEffort: true,
		reasoningEffort: "medium",
	}

	try {
		// 1. プロバイダー設定を設定
		server.setProviderSettings(vsCodeLmSettings)
		console.log("✅ VSCode LM settings configured successfully")

		// 2. 設定されているかチェック
		if (server.isVsCodeLmConfigured()) {
			console.log("✅ VSCode LM provider is configured")

			// 3. モデルセレクターを取得
			const modelSelector = server.getVsCodeLmModelSelector()
			console.log("📋 Model selector:", modelSelector)

			// 4. 現在の設定を取得
			const currentSettings = server.getProviderSettings()
			console.log("⚙️ Current settings:", {
				provider: currentSettings?.apiProvider,
				temperature: currentSettings?.modelTemperature,
				rateLimit: currentSettings?.rateLimitSeconds,
			})
		}

		// 5. 利用可能なプロバイダーを表示
		const availableProviders = server.getAvailableProviders()
		console.log(
			"🔧 Available providers:",
			availableProviders.filter((p) => ["vscode-lm", "anthropic", "openai", "gemini"].includes(p)),
		)

		// 6. プロバイダーの可用性チェック
		console.log("🔍 Provider checks:")
		console.log("  - VSCode LM available:", server.isProviderAvailable("vscode-lm"))
		console.log("  - Anthropic available:", server.isProviderAvailable("anthropic"))
		console.log("  - Invalid provider available:", server.isProviderAvailable("invalid-provider"))
	} catch (error) {
		console.error("❌ Error:", error)
	}
}

/**
 * 複数のプロバイダー設定を切り替えるサンプル
 */
export function providerSwitchingExample() {
	const server = new IpcServer("/tmp/roo-code-ipc")

	const providers: Array<{ name: string; settings: ProviderSettings }> = [
		{
			name: "VSCode LM",
			settings: {
				apiProvider: "vscode-lm",
				vsCodeLmModelSelector: {
					vendor: "microsoft",
					family: "copilot",
				},
				modelTemperature: 0.7,
			},
		},
		{
			name: "GitHub LM",
			settings: {
				apiProvider: "vscode-lm",
				vsCodeLmModelSelector: {
					vendor: "copilot",
					family: "gpt-4o",
				},
				apiModelId: "copilot-gpt-4o",
				modelTemperature: 0.6,
			},
		},
		{
			name: "Anthropic",
			settings: {
				apiProvider: "anthropic",
				apiKey: "test-key",
				apiModelId: "claude-3-sonnet-20240229",
				modelTemperature: 0.5,
			},
		},
		{
			name: "OpenAI",
			settings: {
				apiProvider: "openai",
				openAiApiKey: "test-key",
				openAiModelId: "gpt-4",
				modelTemperature: 0.3,
			},
		},
	]

	console.log("🔄 Testing provider switching...\n")

	providers.forEach((provider, index) => {
		try {
			console.log(`${index + 1}. Setting up ${provider.name}...`)
			server.setProviderSettings(provider.settings)

			const currentSettings = server.getProviderSettings()
			console.log(`   ✅ Provider: ${currentSettings?.apiProvider}`)
			console.log(`   🌡️ Temperature: ${currentSettings?.modelTemperature}`)

			if (server.isVsCodeLmConfigured()) {
				const modelSelector = server.getVsCodeLmModelSelector()
				console.log(`   🎯 VSCode LM Model: ${modelSelector?.vendor}/${modelSelector?.family}`)
			}

			console.log("")
		} catch (error) {
			console.error(`   ❌ Failed to configure ${provider.name}:`, error)
		}
	})
}

// 実行例（開発時のデバッグ用）
if (import.meta.url === `file://${process.argv[1]}`) {
	console.log("=== VSCode LM Example ===")
	vsCodeLmExample()

	console.log("\n=== Provider Switching Example ===")
	providerSwitchingExample()
}
