# zh-font-subset-pipeline

中文字体子集化流水线：维护可复用的中文字符集，并自动生成裁剪后的 `TTF` / `WOFF2` 字体产物。

---

## 功能概览

- 维护多层级中文字符集（3500 / 7000 / 全量 / 符号）
- 支持把新增文本字符并入基准字集（自动去重）
- 自动合并“字集 + 符号集”生成可用白名单
- 基于白名单从 `fonts/raw/*.ttf` 生成子集字体：
  - `fonts/ttf/*.ttf`
  - `fonts/woff2/*.woff2`
- 集成 GitHub Actions：代码变更后自动构建并上传字体产物

---

## 目录结构

```text
.
├─ data/
│  ├─ chars-common-3500.txt      # 常用 3500 字字符集
│  ├─ chars-common-7000.txt      # 常用 7000 字字符集
│  ├─ chars-all.txt              # 全量字符集（基准）
│  ├─ chars-symbols.txt          # 通用符号集
│  └─ merged/                    # 合并后输出（由脚本生成）
│
├─ fonts/
│  ├─ raw/                       # 原始字体输入（只读）
│  ├─ ttf/                       # 子集 TTF 输出
│  └─ woff2/                     # 子集 WOFF2 输出
│
├─ scripts/
│  ├─ update-charset.js          # 合并 new.txt 到 chars-all.txt（去重）
│  ├─ merge.js                   # 合并各字集与 symbols（去重）
│  └─ subset-fonts.js            # 依据白名单裁剪字体并转 woff2
│
├─ new.txt                       # 新增字符输入（可为空）
└─ .github/workflows/build-fonts.yml
```

> `data/` 是字符集权威源目录。`fonts/raw` 默认只读，不应修改。

---

## 环境要求

- Node.js 20+
- pnpm 9+

安装依赖：

```bash
pnpm install
```

---

## 本地使用

### 1)（可选）将新增字符并入基准字集

```bash
# 默认读取 ./new.txt，写回 ./data/chars-all.txt
node scripts/update-charset.js

# 指定输入文件
node scripts/update-charset.js ./path/to/new-chars.txt

# 仅预览，不写入
node scripts/update-charset.js ./new.txt --dry-run
```

### 2) 合并字集 + 符号集

```bash
node scripts/merge.js
```

生成：

- `data/merged/chars-all+symbols.txt`
- `data/merged/chars-common-3500+symbols.txt`
- `data/merged/chars-common-7000+symbols.txt`

### 3) 生成子集字体

```bash
node scripts/subset-fonts.js
```

输入：`fonts/raw/*.ttf` + `data/merged/chars-all+symbols.txt`  
输出：`fonts/ttf/` 与 `fonts/woff2/`

### 一键构建

```bash
pnpm run build
```

等价于：

1. `pnpm run merge`
2. `pnpm run subset`

---

## 去重策略

- `update-charset.js`：合并基准字集与新增字符时去重
- `merge.js`：合并字集与符号集时去重
- `subset-fonts.js`：不重复去重，直接消费 `merge.js` 的去重结果

---

## GitHub Actions 自动化

工作流文件：`.github/workflows/build-fonts.yml`

触发条件：

- `data/**`
- `fonts/raw/**`
- `scripts/**`
- `new.txt`

执行逻辑：

1. 安装依赖
2. 判断路径变更并决定是否执行 `merge.js` / `subset-fonts.js`
3. 若需要 merge，先检查 `new.txt` 是否包含 `chars-all.txt` 中不存在的新字符
4. 仅在存在新字符时执行 `update-charset.js`
5. 执行 `merge.js`（在 merge 输入变更时）
6. 执行 `subset-fonts.js`（merge 成功后，或 subset 输入变更时）
7. 上传构建产物：
   - `fonts-ttf`
   - `fonts-woff2`

### CI 处理逻辑场景表

| 变更场景 | update-charset.js | merge.js | subset-fonts.js |
|---|---:|---:|---:|
| 仅 `fonts/raw/**` | 跳过 | 跳过 | 执行 |
| 仅 `scripts/subset-fonts.js` | 跳过 | 跳过 | 执行 |
| `data/**` 任意变更 | 按需执行* | 执行 | 执行（因 merge 执行） |
| `scripts/merge.js` 变更 | 按需执行* | 执行 | 执行（因 merge 执行） |
| `scripts/update-charset.js` 变更 | 按需执行* | 执行 | 执行（因 merge 执行） |
| 仅 `new.txt` 变更，且包含新增字符 | 执行 | 执行 | 执行（因 merge 执行） |
| 仅 `new.txt` 变更，但无新增字符（空/全已包含） | 跳过 | 执行 | 执行（因 merge 执行） |

> 按需执行*：仅当 `new.txt` 存在且包含 `data/chars-all.txt` 中尚不存在的字符时执行。

---

## 常见注意事项

- `fonts/raw` 请仅放置输入字体，不要在脚本中覆盖
- 首次运行前确认 `data/chars-symbols.txt` 存在
- 若 CI 构建失败，请优先检查：
  - `fonts/raw` 是否有可用 `.ttf`
  - `data/merged/chars-all+symbols.txt` 是否由 `merge.js` 正常生成
  - 依赖是否安装完整（`pnpm install`）

---

## License

MIT