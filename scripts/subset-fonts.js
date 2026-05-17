const fs = require('fs');
const path = require('path');
const Fontmin = require('fontmin');

const srcTtf = './fonts/raw/*.ttf'; // 源 TTF 文件
const woff2DestDir = './fonts/woff2';  // WOFF2 输出目录
const ttfDestDir = './fonts/ttf';     // TTF 输出目录
const txtPath = './data/merged/chars-all+symbols.txt'; // 字符白名单

// 1. 安全检查 txt 文件是否存在
if (!fs.existsSync(txtPath)) {
    console.error(`❌ 错误：找不到字符文件 ${txtPath}，请先创建它！`);
    process.exit(1);
}

// 2. 【核心修改】从 txt 文件中读取字符
// 使用 'utf-8' 编码读取，保证中文不乱码
const keepText = fs.readFileSync(txtPath, 'utf-8');

console.log(`已成功载入字符文件，共读取了 ${keepText.length} 个字符（含去重前）。`);
console.log('正在提取字集并高压转码中，请稍候...\n');

// 1. 确保输出目录存在
[woff2DestDir, ttfDestDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 2. 创建 TTF 子集字体
const fontminTtf = new Fontmin()
    .src(srcTtf)
    .use(Fontmin.glyph({
        text: keepText,
        hinting: false
    }))
    .dest(ttfDestDir);

fontminTtf.run(function (err, files) {
    if (err) {
        console.error('❌ TTF 裁剪失败:', err);
        process.exit(1);
    }
    console.log(`✅ TTF 子集字体已生成到 ${ttfDestDir}/`);

    // 3. 基于生成的 TTF 子集再转换为 WOFF2
    const ttfFiles = path.join(ttfDestDir, '*.ttf');
    const fontminWoff2 = new Fontmin()
        .src(ttfFiles)
        // 关闭 clone，避免触发 clone-stats(new fs.Stats()) 的 DEP0180 警告
        // 同时避免把原始 TTF 再复制到 woff2 输出目录
        .use(Fontmin.ttf2woff2({ clone: false }))
        .dest(woff2DestDir);

    fontminWoff2.run(function (err, files) {
        if (err) {
            console.error('❌ WOFF2 转换失败:', err);
            process.exit(1);
        }
        console.log(`✅ WOFF2 子集字体已生成到 ${woff2DestDir}/`);
        console.log('\n🎉 全部裁剪完成！');
    });
});