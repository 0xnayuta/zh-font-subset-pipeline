# AGENTS

## 仓库约定（持久化）

- `data/` 是字符集的权威源目录。
  - 核心文件：
    - `data/chars-common-3500.txt`
    - `data/chars-common-7000.txt`
    - `data/chars-all.txt`
    - `data/chars-symbols.txt`
  - `data/merged/` 为脚本生成目录，可覆盖重建。

- `scripts/` 存放字符集处理与字体子集化脚本。
  - `update-charset.js`：将新增字符并入基准字集并去重。
  - `merge.js`：合并字集与符号集并去重。
  - `subset-fonts.js`：依据白名单生成子集字体。

- `fonts/raw/` 存放字体源文件，默认只读，禁止修改。
- `fonts/ttf/` 存放子集化后的 TTF 输出。
- `fonts/woff2/` 存放子集化后的 WOFF2 输出。

## 维护原则

- 去重应在字符处理流程中完成，不新增独立去重脚本。
- 字符集变更优先通过脚本生成，避免手工编辑产物目录。
- 自动化流程应以可重复构建为目标：输入固定、输出可重建。