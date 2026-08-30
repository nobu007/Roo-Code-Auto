/**
 * GitHub LM (VSCode Language Model API) を使用するサンプルプログラム
 *
 * 前提条件:
 * 1. GitHub Copilot拡張機能がVSCodeにインストールされている
 * 2. GitHub Copilotにログインしている
 * 3. VSCode環境で実行する
 */

import * as vscode from "vscode"

/**
 * GitHub LM (VSCode Language Model API) のサンプル使用方法
 */
export async function githubLmSample() {
	console.log("=== GitHub LM Sample ===")

	try {
		// 1. 利用可能なLanguage Modelを取得
		const models = await vscode.lm.selectChatModels()
		console.log("Available models:", models.length)

		// GitHub Copilotモデルを探す
		const copilotModels = models.filter(
			(model) => model.vendor === "copilot" || model.family.includes("copilot") || model.vendor === "github",
		)

		console.log(
			"Copilot models found:",
			copilotModels.map((m) => ({
				vendor: m.vendor,
				family: m.family,
				version: m.version,
				id: m.id,
				maxInputTokens: m.maxInputTokens,
			})),
		)

		if (copilotModels.length === 0) {
			console.log("❌ No GitHub Copilot models found. Make sure:")
			console.log("   - GitHub Copilot extension is installed")
			console.log("   - You are signed in to GitHub Copilot")
			console.log("   - GitHub Copilot subscription is active")
			return
		}

		// 2. 最初のCopilotモデルを使用
		const model = copilotModels[0]
		console.log(`Using model: ${model.vendor}/${model.family}`)

		// 3. Chat Requestを作成
		const messages = [
			vscode.LanguageModelChatMessage.User("Hello! Can you help me write a simple TypeScript function?"),
		]

		const request = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token)

		// 4. レスポンスをストリーミングで受信
		console.log("Response from GitHub LM:")
		let response = ""
		for await (const fragment of request.text) {
			response += fragment
			process.stdout.write(fragment)
		}

		console.log("\n=== Response completed ===")
		return response
	} catch (error) {
		console.error("GitHub LM Error:", error)

		if (error instanceof vscode.LanguageModelError) {
			console.log("❌ LanguageModelError:", error.message)
			console.log("   Error cause:", error.cause)
		}
	}
}

/**
 * Roo Code設定形式でのGitHub LM設定例
 */
export const rooCodeGithubLmConfig = {
	// プロバイダーはvscode-lmを使用
	apiProvider: "vscode-lm" as const,

	// GitHub Copilotモデルを指定
	vsCodeLmModelSelector: {
		vendor: "copilot", // または "github"
		family: "gpt-4o", // 実際のファミリー名に応じて調整
		// version: "latest", // オプショナル
		// id: "copilot-gpt-4o" // 具体的なIDがあれば指定
	},

	// その他の設定
	modelTemperature: 0.7,
	includeMaxTokens: true,
	diffEnabled: true,
}

/**
 * 利用可能なモデルをリストアップする
 */
export async function listAvailableModels() {
	try {
		const models = await vscode.lm.selectChatModels()

		console.log("=== All Available VSCode LM Models ===")
		models.forEach((model, index) => {
			console.log(`${index + 1}. ${model.vendor}/${model.family}`)
			console.log(`   ID: ${model.id}`)
			console.log(`   Version: ${model.version || "N/A"}`)
			console.log(`   Max Input Tokens: ${model.maxInputTokens}`)
			console.log(`   Token Counter: Available`)
			console.log("")
		})

		return models
	} catch (error) {
		console.error("Failed to list models:", error)
		return []
	}
}

/**
 * 特定のvendor/familyでモデルを検索する
 */
export async function findModelBySelector(vendor: string, family: string) {
	try {
		const models = await vscode.lm.selectChatModels({
			vendor,
			family,
		})

		if (models.length > 0) {
			console.log(`Found ${models.length} model(s) for ${vendor}/${family}:`)
			models.forEach((model) => {
				console.log(`  - ${model.id} (${model.version || "no version"})`)
			})
			return models[0] // 最初のモデルを返す
		} else {
			console.log(`No models found for ${vendor}/${family}`)
			return null
		}
	} catch (error) {
		console.error(`Error finding model ${vendor}/${family}:`, error)
		return null
	}
}

// VSCode拡張機能のactivate関数で使用する例
export function activate(context: vscode.ExtensionContext) {
	// GitHub LM テストコマンドを登録
	const testCommand = vscode.commands.registerCommand("roo-code.testGithubLm", async () => {
		await githubLmSample()
	})

	// モデル一覧表示コマンドを登録
	const listCommand = vscode.commands.registerCommand("roo-code.listLmModels", async () => {
		await listAvailableModels()
	})

	context.subscriptions.push(testCommand, listCommand)
}
