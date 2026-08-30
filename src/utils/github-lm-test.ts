/**
 * 実際のGitHub LM APIを叩くテストプログラム
 * Roo CodeのVsCodeLmHandlerを使用
 */

import * as vscode from "vscode"
import { VsCodeLmHandler } from "../api/providers/vscode-lm"
import type { ApiHandlerOptions } from "../shared/api"

/**
 * GitHub LM (Copilot) の実際のテスト
 */
export async function testActualGitHubLM() {
	console.log("=== Actual GitHub LM Test ===")

	try {
		// 1. 利用可能なモデルを確認
		console.log("1. Checking available models...")
		const allModels = await vscode.lm.selectChatModels()
		console.log(`Found ${allModels.length} total models`)

		// GitHub/Copilotモデルを検索
		const githubModels = allModels.filter(
			(model) =>
				model.vendor === "copilot" ||
				model.vendor === "github" ||
				model.family.toLowerCase().includes("copilot"),
		)

		console.log(`Found ${githubModels.length} GitHub/Copilot models:`)
		githubModels.forEach((model, index) => {
			console.log(`  ${index + 1}. ${model.vendor}/${model.family}`)
			console.log(`     ID: ${model.id}`)
			console.log(`     Version: ${model.version || "N/A"}`)
			console.log(`     Max Input Tokens: ${model.maxInputTokens}`)
		})

		if (githubModels.length === 0) {
			console.log("❌ No GitHub/Copilot models found!")
			console.log("Make sure:")
			console.log("  - GitHub Copilot extension is installed")
			console.log("  - You are signed in to GitHub Copilot")
			console.log("  - GitHub Copilot subscription is active")
			return false
		}

		// 2. 最初のGitHubモデルでテスト
		const testModel = githubModels[0]
		console.log(`\n2. Testing with model: ${testModel.vendor}/${testModel.family}`)

		// VsCodeLmHandlerの設定
		const options: ApiHandlerOptions = {
			vsCodeLmModelSelector: {
				vendor: testModel.vendor,
				family: testModel.family,
				version: testModel.version,
				id: testModel.id,
			},
			modelTemperature: 0.7,
			includeMaxTokens: true,
		}

		// VsCodeLmHandlerを作成
		const handler = new VsCodeLmHandler(options)

		// 3. 簡単なテストメッセージを送信
		console.log("3. Sending test message...")
		const systemPrompt = "You are a helpful coding assistant."
		const messages = [
			{
				role: "user" as const,
				content: "Hello! Can you write a simple TypeScript function that adds two numbers?",
			},
		]

		console.log("Sending request to GitHub LM...")
		const response = await handler.createMessage(systemPrompt, messages)

		// 4. レスポンスをストリーミングで受信
		console.log("4. Receiving response...")
		let fullResponse = ""
		let chunkCount = 0

		for await (const chunk of response) {
			if (chunk.type === "text") {
				fullResponse += chunk.text
				chunkCount++
				process.stdout.write(chunk.text)
			}
		}

		console.log(`\n\n✅ Test completed successfully!`)
		console.log(`   Received ${chunkCount} chunks`)
		console.log(`   Total response length: ${fullResponse.length} characters`)

		return true
	} catch (error) {
		console.error("❌ Test failed:", error)

		if (error instanceof Error) {
			console.error("Error message:", error.message)
			console.error("Stack trace:", error.stack)
		}

		return false
	}
}

/**
 * 複数のGitHubモデルをテスト
 */
export async function testMultipleGitHubModels() {
	console.log("\n=== Testing Multiple GitHub Models ===")

	try {
		const allModels = await vscode.lm.selectChatModels()
		const githubModels = allModels.filter(
			(model) =>
				model.vendor === "copilot" ||
				model.vendor === "github" ||
				model.family.toLowerCase().includes("copilot"),
		)

		for (const [index, model] of githubModels.entries()) {
			console.log(`\nTesting model ${index + 1}/${githubModels.length}: ${model.vendor}/${model.family}`)

			try {
				const options: ApiHandlerOptions = {
					vsCodeLmModelSelector: {
						vendor: model.vendor,
						family: model.family,
						version: model.version,
						id: model.id,
					},
					modelTemperature: 0.5,
				}

				const handler = new VsCodeLmHandler(options)
				const response = await handler.createMessage("You are a helpful assistant.", [
					{ role: "user", content: "Say hello!" },
				])

				let responseText = ""
				for await (const chunk of response) {
					if (chunk.type === "text") {
						responseText += chunk.text
					}
				}

				console.log(`✅ Model ${model.vendor}/${model.family}: Success (${responseText.length} chars)`)
				console.log(`   Response preview: "${responseText.substring(0, 50)}..."`)
			} catch (error) {
				console.log(`❌ Model ${model.vendor}/${model.family}: Failed - ${error}`)
			}
		}
	} catch (error) {
		console.error("❌ Multiple model test failed:", error)
	}
}

/**
 * Roo Code設定形式でのテスト
 */
export async function testWithRooCodeConfig() {
	console.log("\n=== Testing with Roo Code Configuration ===")

	// Roo Code設定例
	const rooCodeConfigs = [
		{
			name: "Copilot GPT-4o",
			config: {
				apiProvider: "vscode-lm" as const,
				vsCodeLmModelSelector: {
					vendor: "copilot",
					family: "gpt-4o",
				},
				modelTemperature: 0.7,
				includeMaxTokens: true,
			},
		},
		{
			name: "Copilot GPT-4",
			config: {
				apiProvider: "vscode-lm" as const,
				vsCodeLmModelSelector: {
					vendor: "copilot",
					family: "gpt-4",
				},
				modelTemperature: 0.5,
				includeMaxTokens: true,
			},
		},
		{
			name: "GitHub Copilot",
			config: {
				apiProvider: "vscode-lm" as const,
				vsCodeLmModelSelector: {
					vendor: "github",
					family: "copilot",
				},
				modelTemperature: 0.8,
				includeMaxTokens: true,
			},
		},
	]

	for (const { name, config } of rooCodeConfigs) {
		console.log(`\nTesting configuration: ${name}`)
		console.log(`Config: ${JSON.stringify(config.vsCodeLmModelSelector, null, 2)}`)

		try {
			// 指定されたモデルが利用可能かチェック
			const availableModels = await vscode.lm.selectChatModels(config.vsCodeLmModelSelector)

			if (availableModels.length === 0) {
				console.log(`❌ No models found for ${name}`)
				continue
			}

			console.log(`✅ Found ${availableModels.length} model(s) for ${name}`)

			// 最初のモデルでテスト
			const handler = new VsCodeLmHandler(config)
			const response = await handler.createMessage("You are a helpful coding assistant.", [
				{ role: "user", content: "Write a simple hello world in TypeScript" },
			])

			let responseLength = 0
			for await (const chunk of response) {
				if (chunk.type === "text") {
					responseLength += chunk.text.length
				}
			}

			console.log(`✅ ${name}: Successfully received ${responseLength} characters`)
		} catch (error) {
			console.log(`❌ ${name}: Failed - ${error}`)
		}
	}
}
