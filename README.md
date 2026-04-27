# zh-space-normalizer

面向中文 AI 写作场景的空格规范化工具，用于清理 AI 生成文本、报告、论文、小红书文案、公众号文案中常见的中英数字混排空格问题。

它不是粗暴删除所有空格，而是中文语境下的智能空格规范化工具：会移除中文与英文、数字、中文之间不自然的空格，同时保留英文短语内部空格，例如 `OpenAI API`、`Visual Studio Code`、`High Performance Web Server`、`C++ Primer`、`New York Times`。

## Why this tool?

普通删除空格工具或 Word 全文替换会破坏英文短语和代码，例如把 `OpenAI API` 变成 `OpenAIAPI`，把 `Visual Studio Code` 变成 `VisualStudioCode`，甚至误伤 Markdown 行内代码和代码块。

zh-space-normalizer 面向中文 AI 写作后的文本清洗：删除中文与英文、数字之间的异常空格，同时保留英文短语、数字序列、Markdown 行内代码和代码块。它解决的是“该删的空格”和“不该删的空格”之间的边界问题。

## 特性

- 工具优先布局：页面打开后默认输入为空，左右输入/输出区域是视觉中心。
- 示例不再默认填入输入框，需要用户主动点击“查看演示”。
- 去除中文与英文之间的多余空格。
- 去除中文与数字之间的多余空格。
- 去除中文与中文之间的异常空格。
- 清理中文标点附近空格。
- 清理每一行首尾空格，但不破坏英文或数字内部空格。
- 保留英文短语内部空格。
- 保留普通数字序列内部空格，例如 `1 2 3` 默认不破坏。
- 保护 Markdown 代码块和行内代码。
- 支持实时预览、一键复制、一键清空、主动触发的演示面板。
- 显示处理前后字符数、修改数量、压缩比例和处理耗时。
- 所有处理均在浏览器本地完成，不调用 API，不上传用户文本。

## 处理模式

- `conservative`：保守模式，只处理中文与英文、数字之间的空格，并清理行首尾空格。
- `standard`：标准模式，处理中文、中英、中数、标点附近空格和行首尾空格。
- `aggressive`：强力模式，进一步压缩多余空白，但仍然不会破坏英文短语内部的单个空格。

## 示例

```text
输入：这是一个 AI 工具，可以处理 GPT-5 生成的 报告。
输出：这是一个AI工具，可以处理GPT-5生成的报告。
```

```text
输入：我推荐使用 Visual Studio Code 编辑器。
输出：我推荐使用Visual Studio Code编辑器。
```

```text
输入：OpenAI API is useful.
输出：OpenAI API is useful.
```

```text
输入：我有 3 个模块 和 2 个页面。
输出：我有3个模块和2个页面。
```

```text
输入：  OpenAI API  
输出：OpenAI API
```

Markdown 代码块和行内代码会被保护：

````markdown
这是一个 AI 工具。

```cpp
int main() {
    return 0;
}
```

请运行 `npm run build` ， 然后查看 AI 结果。
````

会被处理为：

````markdown
这是一个AI工具。

```cpp
int main() {
    return 0;
}
```

请运行`npm run build`，然后查看AI结果。
````

## 本地开发

```bash
npm install
npm run dev
```

## 测试

```bash
npm test
```

## 构建

```bash
npm run build
npm run preview
```

## 核心 API

```ts
import { normalizeText, normalizeTextWithStats } from './src/core/normalizeText';

normalizeText('我推荐使用 Visual Studio Code 编辑器。');
// => 我推荐使用Visual Studio Code编辑器。

normalizeTextWithStats('我有 3 个模块。', { mode: 'standard' });
```

## 技术栈

- TypeScript
- Vite
- React
- Tailwind CSS
- Vitest
- GitHub Pages

## 部署

仓库包含 `.github/workflows/deploy.yml`。推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

Vite 的 `base` 已配置为：

```ts
base: '/zh-space-normalizer/'
```

## 隐私

本项目不包含后端、数据库、登录、埋点、遥测或 API Key。所有文本处理逻辑都在浏览器本地执行，用户输入不会被上传到任何服务器。

## License

MIT
