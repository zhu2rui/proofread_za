// 框选标注功能实现

// 绘制框选，每个字符分别绘制边框并应用边框规则
function drawBox(position, ctx) {
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    
    // 获取所有字符矩形
    const rects = position.rects;
    if (rects.length === 0) return;
    
    // 对每个字符绘制边框，应用边框规则
    rects.forEach((rect, index) => {
        // 保存当前状态
        ctx.save();
        
        // 开始绘制
        ctx.beginPath();
        
        // 计算边框的四个角点
        const x1 = rect.x;
        const y1 = rect.y;
        const x2 = rect.x + rect.width;
        const y2 = rect.y + rect.height;
        
        // 如果只有一个字符，显示完整边框
        if (rects.length === 1) {
            // 完整边框：上、下、左、右都显示
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1); // 上边框
            ctx.lineTo(x2, y2); // 右边框
            ctx.lineTo(x1, y2); // 下边框
            ctx.lineTo(x1, y1); // 左边框
        }
        // 第一个字符：去除右侧边框
        else if (index === 0) {
            // 上边框
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            // 下边框
            ctx.moveTo(x1, y2);
            ctx.lineTo(x2, y2);
            // 左边框
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            // 无右边框
        } 
        // 最后一个字符：去除左边框
        else if (index === rects.length - 1) {
            // 上边框
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            // 下边框
            ctx.moveTo(x1, y2);
            ctx.lineTo(x2, y2);
            // 右边框
            ctx.moveTo(x2, y1);
            ctx.lineTo(x2, y2);
            // 无左边框
        } 
        // 中间字符：去除左右边框
        else {
            // 上边框
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            // 下边框
            ctx.moveTo(x1, y2);
            ctx.lineTo(x2, y2);
            // 无左右边框
        }
        
        // 绘制边框
        ctx.stroke();
        
        // 恢复状态
        ctx.restore();
    });
    
    console.log('绘制字符边框:', position);
}

// 导出框选绘制函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { drawBox };
} else {
    window.drawBox = drawBox;
}