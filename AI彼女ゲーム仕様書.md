# 📄 AI彼女告白ゲーム（CLI版MVP）開発仕様書

## 1. プロジェクト概要

* **タイトル（仮）**：AI彼女告白ゲーム
* **目的**：

  * CLI上でAIキャラクター（彼女）と会話し、好感度を上げて告白を成功させるゲーム。
  * 難易度ごとに異なる性格・閾値を持つ彼女キャラが存在する。
  * 好感度が一定値を超えていれば告白が成功し、エンディングが分岐する。

---

## 2. ゲームフロー

1. 難易度を選択（初級/中級/上級）
2. キャラクター設定を読み込み（名前・性格・閾値）
3. CLIチャットで会話ループ

   * ユーザー発言 → AIが応答（\[MOOD:+n]などの好感度変動付き）
   * プログラム側で好感度を数値管理
4. ユーザーが「告白」と入力すると判定処理へ

   * 好感度 >= 閾値 → 成功エンディング
   * 好感度 < 閾値 → 失敗エンディング
5. ゲーム終了

---

## 3. 難易度とキャラ設定

* **初級**

  * 名前：さくら
  * 性格：素直で優しい
  * 成功条件：好感度60以上
* **中級**

  * 名前：あや
  * 性格：ツンデレ
  * 成功条件：好感度75以上
* **上級**

  * 名前：みさき
  * 性格：クールで知的
  * 成功条件：好感度90以上

---

## 4. 好感度システム

* 初期値：0
* AI応答に `[MOOD:+n]` または `[MOOD:-n]` を必ず含めさせる
* 正規表現で抽出し、`favorability` に加算/減算する
* 告白時に `favorability >= threshold` なら成功

---

## 5. 技術要件

* **言語**：TypeScript
* **環境**：Node.js
* **依存ライブラリ**：

  * `openai`（OpenAI API呼び出し）
  * `readline-sync`（CLI入力）
* **状態管理**：メモリ上のみ（DB不要）
* **APIキー**：環境変数 `OPENAI_API_KEY` から取得

---

## 6. プロンプト仕様

```text
あなたは恋愛シミュレーションゲームのキャラクターです。
キャラ名: {キャラ名}
性格: {性格}
ルール:
- ユーザーの発言にキャラらしく応答してください。
- あなたの返答には必ず好感度変動を示す [MOOD:+n] または [MOOD:-n] を含めてください。
- 例: 「嬉しい…ありがとう！ [MOOD:+5]」
```

---

## 7. CLI実行イメージ

```
=== AI彼女告白ゲーム ===
難易度を選んでください (easy/medium/hard): medium
あなたの相手は あや (ツンデレ) です。

> あなた: 今日一緒に帰ろう？
あや: べ、別にあんたと帰りたいわけじゃ…[MOOD:+2]
(好感度: 2)

> あなた: 告白する
=== 告白判定中... ===
あや: ……ずっと待ってたんだから。付き合ってあげる！ ❤️
```

---

## 8. サンプルコード（抜粋）

```ts
import OpenAI from "openai";
import readlineSync from "readline-sync";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const characters = {
  easy: { name: "さくら", personality: "素直で優しい", threshold: 60 },
  medium: { name: "あや", personality: "ツンデレ", threshold: 75 },
  hard: { name: "みさき", personality: "クールで知的", threshold: 90 },
};

async function main() {
  console.log("=== AI彼女告白ゲーム ===");
  const choice = readlineSync.question("難易度を選んでください (easy/medium/hard): ");
  const chara = characters[choice as keyof typeof characters];
  if (!chara) return;

  console.log(`あなたの相手は ${chara.name} (${chara.personality}) です。`);
  let favorability = 0;

  while (true) {
    const input = readlineSync.question("> あなた: ");
    if (input.includes("告白")) {
      console.log("=== 告白判定中... ===");
      console.log(
        favorability >= chara.threshold
          ? `${chara.name}: 私も…ずっと好きだったよ！付き合おう！ ❤️`
          : `${chara.name}: ごめん…まだ気持ちが追いつかないの。`
      );
      break;
    }

    const prompt = `
あなたは恋愛ゲームのキャラクターです。
キャラ名: ${chara.name}
性格: ${chara.personality}
ルール:
- ユーザーの発言にキャラらしく応答してください。
- 応答には必ず [MOOD:+n] または [MOOD:-n] を含めてください。
`;

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }, { role: "user", content: input }],
    });

    const reply = res.choices[0].message?.content ?? "";
    console.log(`${chara.name}: ${reply}`);

    const moodMatch = reply.match(/\[MOOD:([+-]?\d+)\]/);
    if (moodMatch) {
      favorability += parseInt(moodMatch[1], 10);
      console.log(`(好感度: ${favorability})`);
    }
  }
}

main();
```

---

## 9. 今後の拡張予定

* 好感度バーの可視化
* イベントシナリオの追加（デート・LINE風メッセージ）
* 成功/失敗エンディングのバリエーション
