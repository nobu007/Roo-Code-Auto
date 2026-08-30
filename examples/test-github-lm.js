/**
 * GitHub LM テストスクリプト
 * Node.js環境で実行可能（VSCode拡張機能のコンテキストなしでのテスト）
 */

// VSCode LM API のモック（実際のテストでは本物のvscode APIを使用）
const mockVSCodeLM = {
	async selectChatModels(selector) {
		// 実際の環境では利用可能なモデルが返される
		// ここではサンプルデータを返す
		const allModels = [
			{
				vendor: "copilot",
				family: "gpt-4o",
				version: "1.0",
				id: "copilot-gpt-4o",
				maxInputTokens: 128000,
			},
			{
				vendor: "copilot",
				family: "gpt-4",
				version: "1.0",
				id: "copilot-gpt-4",
				maxInputTokens: 8192,
			},
			{
				vendor: "github",
				family: "copilot",
				version: "latest",
				id: "github-copilot-latest",
				maxInputTokens: 4096,
			},
			{
				vendor: "anthropic",
				family: "claude-3",
				version: "sonnet",
				id: "claude-3-sonnet",
				maxInputTokens: 200000,
			},
		]

		if (selector) {
			return allModels.filter((model) => {
				return (
					(!selector.vendor || model.vendor === selector.vendor) &&
					(!selector.family || model.family === selector.family)
				)
			})
		}

		return allModels
	},
}

// GitHub LM検出テスト
async function testGitHubLMDetection() {
	console.log("=== GitHub LM Detection Test ===")

	try {
		// 全モデルを取得
		const allModels = await mockVSCodeLM.selectChatModels()
		console.log(`✅ Found ${allModels.length} total models`)

		// GitHub/Copilotモデルを検索
		const copilotModels = allModels.filter(
			(model) => model.vendor === "copilot" || model.vendor === "github" || model.family.includes("copilot"),
		)

		console.log(`✅ Found ${copilotModels.length} GitHub/Copilot models:`)
		copilotModels.forEach((model) => {
			console.log(`   - ${model.vendor}/${model.family} (${model.id})`)
			console.log(`     Max tokens: ${model.maxInputTokens}`)
		})

		// 推奨設定を生成
		if (copilotModels.length > 0) {
			const recommendedModel = copilotModels[0]
			const config = {
				apiProvider: "vscode-lm",
				vsCodeLmModelSelector: {
					vendor: recommendedModel.vendor,
					family: recommendedModel.family,
				},
				modelTemperature: 0.7,
				includeMaxTokens: true,
				diffEnabled: true,
			}

			console.log("\n✅ Recommended Roo Code configuration:")
			console.log(JSON.stringify(config, null, 2))
		} else {
			console.log("❌ No GitHub/Copilot models found")
		}
	} catch (error) {
		console.error("❌ Test failed:", error)
	}
}

// 特定のセレクターテスト
async function testSpecificSelectors() {
	console.log("\n=== Specific Selector Tests ===")

	const testSelectors = [
		{ vendor: "copilot", family: "gpt-4o" },
		{ vendor: "copilot", family: "gpt-4" },
		{ vendor: "github", family: "copilot" },
		{ vendor: "copilot" }, // family指定なし
		{ family: "copilot" }, // vendor指定なし
	]

	for (const selector of testSelectors) {
		try {
			const models = await mockVSCodeLM.selectChatModels(selector)
			const selectorStr = JSON.stringify(selector)

			if (models.length > 0) {
				console.log(`✅ Selector ${selectorStr}: Found ${models.length} model(s)`)
				models.forEach((model) => {
					console.log(`   - ${model.id}`)
				})
			} else {
				console.log(`❌ Selector ${selectorStr}: No models found`)
			}
		} catch (error) {
			console.error(`❌ Selector ${JSON.stringify(selector)} failed:`, error)
		}
	}
}

// 設定検証テスト
function testConfigValidation() {
	console.log("\n=== Configuration Validation Test ===")

	const testConfigs = [
		{
			name: "Valid Copilot Config",
			config: {
				apiProvider: "vscode-lm",
				vsCodeLmModelSelector: {
					vendor: "copilot",
					family: "gpt-4o",
				},
			},
			expectValid: true,
		},
		{
			name: "Valid GitHub Config",
			config: {
				apiProvider: "vscode-lm",
				vsCodeLmModelSelector: {
					vendor: "github",
					family: "copilot",
				},
			},
			expectValid: true,
		},
		{
			name: "Invalid Provider",
			config: {
				apiProvider: "github-llm", // 間違った設定
				vsCodeLmModelSelector: {
					vendor: "copilot",
					family: "gpt-4o",
				},
			},
			expectValid: false,
		},
		{
			name: "Missing Selector",
			config: {
				apiProvider: "vscode-lm",
				// vsCodeLmModelSelectorが欠けている
			},
			expectValid: false,
		},
	]

	testConfigs.forEach(({ name, config, expectValid }) => {
		const hasProvider = config.apiProvider === "vscode-lm"
		const hasSelector =
			config.vsCodeLmModelSelector && (config.vsCodeLmModelSelector.vendor || config.vsCodeLmModelSelector.family)
		const isValid = hasProvider && hasSelector

		const result = isValid === expectValid ? "✅" : "❌"
		console.log(
			`${result} ${name}: ${isValid ? "Valid" : "Invalid"} (Expected: ${expectValid ? "Valid" : "Invalid"})`,
		)

		if (!isValid) {
			if (!hasProvider) console.log("   - Issue: apiProvider should be 'vscode-lm'")
			if (!hasSelector) console.log("   - Issue: vsCodeLmModelSelector is missing or empty")
		}
	})
}

// 実際の使用例シミュレーション
function simulateUsage() {
	console.log("\n=== Usage Simulation ===")

	// Roo Codeでの設定例
	const rooCodeConfig = {
		apiProvider: "vscode-lm",
		vsCodeLmModelSelector: {
			vendor: "copilot",
			family: "gpt-4o",
		},
		modelTemperature: 0.7,
		includeMaxTokens: true,
		diffEnabled: true,
		enableReasoningEffort: false,
	}

	console.log("✅ Roo Code Configuration:")
	console.log(JSON.stringify(rooCodeConfig, null, 2))

	// VSCode設定での表示例
	console.log("\n✅ VSCode Settings UI Display:")
	console.log("   Provider: VS Code LM API")
	console.log("   Model: copilot/gpt-4o")
	console.log("   Temperature: 0.7")

	// APIハンドラーでの使用例
	console.log("\n✅ API Handler Usage:")
	console.log(`
const handler = new VsCodeLmHandler({
    vsCodeLmModelSelector: ${JSON.stringify(rooCodeConfig.vsCodeLmModelSelector)},
    modelTemperature: ${rooCodeConfig.modelTemperature}
});

const response = await handler.createMessage("You are a helpful assistant", [
    { role: "user", content: "Hello, GitHub Copilot!" }
]);
`)
}

// メイン実行
async function runTests() {
	console.log("GitHub LM Test Suite\n")
	console.log("Note: This is a mock test. In real environment, you need:")
	console.log("- GitHub Copilot extension installed in VSCode")
	console.log("- Valid GitHub Copilot subscription")
	console.log("- Signed in to GitHub Copilot\n")

	await testGitHubLMDetection()
	await testSpecificSelectors()
	testConfigValidation()
	simulateUsage()

	console.log("\n=== Test Summary ===")
	console.log("✅ All mock tests completed")
	console.log("🔧 To test with real GitHub LM:")
	console.log("   1. Run this in VSCode extension context")
	console.log("   2. Replace mockVSCodeLM with actual vscode.lm")
	console.log("   3. Ensure GitHub Copilot is properly configured")
}

// 実行
if (require.main === module) {
	runTests().catch(console.error)
}

module.exports = {
	testGitHubLMDetection,
	testSpecificSelectors,
	testConfigValidation,
	simulateUsage,
}
