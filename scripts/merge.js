const fs = require("fs");
const path = require("path");

// 1. 定义核心目录与路径
const dataDir = path.join(__dirname, "../data");
const mergedDir = path.join(dataDir, "merged");
const symbolsPath = path.join(dataDir, "chars-symbols.txt");

function mergeSymbols() {
  try {
    // 2. 安全检查：确保数据源目录及核心符号文件存在
    if (!fs.existsSync(dataDir)) {
      console.error(`❌ 错误：找不到基础数据目录 ${dataDir}，请检查路径！`);
      process.exit(1);
    }
    if (!fs.existsSync(symbolsPath)) {
      console.error(`❌ 错误：找不到核心符号文件 ${symbolsPath}，请先创建它！`);
      process.exit(1);
    }

    // 自动创建输出文件夹，防止 ENOENT 写入错误
    if (!fs.existsSync(mergedDir)) {
      fs.mkdirSync(mergedDir, { recursive: true });
    }

    // 3. 读取并解析核心通用符号库
    const symbolsText = fs.readFileSync(symbolsPath, "utf8");
    // 使用 Array.from() 精准切分，完美兼容生僻字与代理对，防止特殊符号被拆碎
    const symbolsArray = Array.from(symbolsText);

    console.log(`💡 成功载入通用符号库，包含独立字符数: ${symbolsArray.length}`);
    console.log(`🧱 开始执行字符集与符号文件的矩阵合并...`);
    console.log(`--------------------------------------------------`);

    // 4. 定义待处理的任务矩阵
    const tasks = [
      { input: "chars-all.txt", output: "chars-all+symbols.txt" },
      { input: "chars-common-3500.txt", output: "chars-common-3500+symbols.txt" },
      { input: "chars-common-7000.txt", output: "chars-common-7000+symbols.txt" }
    ];

    // 5. 遍历矩阵执行合并与去重
    tasks.forEach(({ input, output }) => {
      const inputPath = path.join(dataDir, input);
      
      // 任务内防御：防止某个基础字集文件偶然缺失导致整个流中断
      if (!fs.existsSync(inputPath)) {
        console.warn(`⚠️  警告：未找到基础字集 ${input}，已自动跳过该任务。`);
        return;
      }

      const charsText = fs.readFileSync(inputPath, "utf8");
      const charsArray = Array.from(charsText);

      // 【核心合并与去重逻辑】
      // 将原字集数组与符号数组无损拼接，再利用 Set 的天然唯一性进行全量洗牌
      const combinedSet = new Set(charsArray.concat(symbolsArray));
      const mergedText = Array.from(combinedSet).join("");

      // 将高纯净度文本安全写入目标文件
      fs.writeFileSync(path.join(mergedDir, output), mergedText, "utf8");

      // 打印详细的单项合并看板
      console.log(`✅ 成功生成: ${output}`);
      console.log(`   [原字数: ${charsArray.length}] + [符号数: ${symbolsArray.length}] -> [去重后总数: ${combinedSet.size}]`);
      console.log(`   └─ 成功剔除了 ${charsArray.length + symbolsArray.length - combinedSet.size} 个重合字符`);
    });

    // 6. 打印最终完成态报告
    console.log(`--------------------------------------------------`);
    console.log("\n🎉 矩阵合并与全局去重任务全部完成！");
    console.log(`✨ 纯净版组合字集已安全保存至: ${mergedDir}`);

  } catch (err) {
    console.error("❌ 字符矩阵合并工作流执行失败，错误信息:", err);
    process.exit(1);
  }
}

// 启动执行
mergeSymbols();