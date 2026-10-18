# Idea Atlas：Cluster & Interpret 逻辑修订

这是原始分享包的独立修改副本。原始 ZIP 和 sources/ 未修改。

## 保留

- ideas 输入及原文、两层 theme → cluster 结构、用途优先的分组依据。
- 自动或指定聚类数量、完整覆盖、真正的多重归属及 outlier 审查。
- 地图与卡片操作、手动移动、浏览器保存、TXT/JSON 导出及原有固定演示。

## 四项修改

1. **暂定性**：解释是对输入想法的一种可能理解。禁止把提案当作已验证的观察、需求或研究结论；材料只支持话题连接时，不强行深化。
2. **来源**：每个主题和聚类的解释附原始 idea ID，界面可展开查看原文。来源只表示本次输入；不虚构访谈、参与者或外部文献。此版本不新增 External Evidence 输入流程。
3. **替代解释**：可保留有依据的不同解读，不自动选优、不自动新增聚类、不改变成员归属。无依据时保持空数组。
4. **矛盾**：共同情境下的不同立场或方案可以形成有意义的张力。不能仅因意见不同就归为 outlier；仍保留真正无关的 outlier。

## 实现

- lib/clustering.ts：提示词、输出结构、来源与目标引用校验。
- lib/ideas.ts：新增可选 interpretationNotes，兼容旧演示和已保存项目。
- app/api/cluster/route.ts：新 AI 结果必须包含所有主题和聚类的解释引用。
- app/interpretation-details.tsx、app/page.tsx、app/network-board.tsx：在 About this cluster/theme 中展示来源、替代解读和张力。
- lib/export-board.ts：TXT 和 JSON 均保留新增信息。

解释本体继续使用现有 explanation 字段。interpretationNotes 通过 targetId 关联主题或聚类，包含 sourceIdeaIds、alternatives 和 tensions。每个目标最多展示两条替代解读和两条张力，作为本版输出体量控制，不要求凑数。来源的结构有效性由程序校验；引用是否真正支持语义解释仍依赖模型和人工审阅。

手动改名或移动后，原 AI 解释及引用不会自动重算；界面和文本导出明确提示这一点。旧演示没有新增解释字段，不伪造或回填 AI 分析。

## 检查

在 idea-atlas 目录运行 `node scripts/test-interpretations.mjs`，检查新引用规则、旧分组约束、旧演示兼容、手动编辑保留及两种导出。该检查不调用 AI。真实 Gemini 效果需另用实际输入评估，不能由结构检查推断。

实际结果：19 项逻辑检查通过。本次修改涉及的应用代码及其依赖的 TypeScript 检查通过（`node node_modules/typescript/bin/tsc -p tsconfig.interpretations.json`）。

全项目 TypeScript 检查受到原始分享包缺失的 `lib/connector-contract.mjs` 和 `lib/connector-errors.mjs` 阻碍，同时报告相关隐式 any 错误。这些连接器文件未包含在原始 ZIP 中，本次未补写无关连接器逻辑。未验证真实 Gemini 调用、浏览器呈现或完整部署。
