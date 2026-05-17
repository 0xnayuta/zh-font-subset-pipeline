const fs = require('fs');

const args = process.argv.slice(2);

// 参数解析
let dryRun = false;
let newTextPath = './new.txt';
let outputPath = './data/chars-all.txt';

for (const arg of args) {
    if (arg === '--dry-run') {
        dryRun = true;
    } else if (!newTextPath || newTextPath === './new.txt') {
        // 第一个路径参数作为新字符文件
        newTextPath = arg;
    } else if (!outputPath || outputPath === './data/chars-all.txt') {
        // 第二个路径参数作为输出文件
        outputPath = arg;
    }
}

const baseCharsetPath = './data/chars-all.txt';

try {
    // 1. 安全检查：确保数据源存在
    if (!fs.existsSync(baseCharsetPath)) {
        console.error(`❌ 错误：找不到基准字集 ${baseCharsetPath}`);
        process.exit(1);
    }
    if (!fs.existsSync(newTextPath)) {
        console.error(`❌ 错误：找不到新字符文件 ${newTextPath}`);
        process.exit(1);
    }

    // 2. 读取原字集和新文本
    const baseText = fs.readFileSync(baseCharsetPath, 'utf-8');
    const newText = fs.readFileSync(newTextPath, 'utf-8');

    // 3. 合并并利用 Set 自动去重
    const baseArray = Array.from(baseText);
    const newArray = Array.from(newText);
    const combinedArray = baseArray.concat(newArray);
    const uniqueSet = new Set(combinedArray);
    const uniqueArray = Array.from(uniqueSet);

    // 4. 统计信息
    const baseCount = baseArray.length;
    const newCount = newArray.length;
    const totalCount = combinedArray.length;
    const finalCount = uniqueSet.size;
    const duplicateCount = totalCount - finalCount;
    const netNewCount = finalCount - baseCount;

    console.log(`📊 字集更新预览`);
    console.log(`----------------------------------------`);
    console.log(`基准字集: ${baseCharsetPath}`);
    console.log(`新字符源: ${newTextPath}`);
    console.log(`输出文件: ${dryRun ? '(dry-run 不写入)' : outputPath}`);
    console.log(`----------------------------------------`);
    console.log(`基准字符数: ${baseCount}`);
    console.log(`新字符数:   ${newCount}`);
    console.log(`合并总数:  ${totalCount}`);
    console.log(`去重后总数: ${finalCount}`);
    console.log(`新增字符:  ${netNewCount >= 0 ? '+' : ''}${netNewCount}`);
    console.log(`剔除重复:  ${duplicateCount}`);

    // 5. Dry-run 模式
    if (dryRun) {
        console.log(`\n🔍 Dry-run 模式，仅预览不写入`);
        return;
    }

    // 6. 写回字集文件
    fs.writeFileSync(outputPath, uniqueArray.join(''), 'utf-8');

    console.log(`\n🎉 字集更新成功！`);
    console.log(`✨ 已保存至: ${outputPath}`);

} catch (err) {
    console.error('合并字集时出错:', err);
    process.exit(1);
}