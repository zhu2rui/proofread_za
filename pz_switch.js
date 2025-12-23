// 换位标注功能实现

// 绘制换位标注
function drawSwitch(positions, ctx, configInfo) {
    ctx.strokeStyle = '#f39c12'; // 橙色曲线
    ctx.lineWidth = 2;
    
    // 确保有两个位置信息
    if (!positions || positions.length !== 2) {
        console.error('换位标注需要两个位置信息');
        return;
    }
    
    // 获取配置信息，包含start_index和end_index
    const configA = configInfo?.configA;
    const configC = configInfo?.configC;
    
    // 获取A和C区域
    let posA = positions[0];
    let posC = positions[1];
    
    // 按起始索引排序，确保A在前，C在后
    if (configA && configC) {
        // 如果有配置信息，按start_index排序
        if (configA.start_index > configC.start_index) {
            [posA, posC] = [positions[1], positions[0]];
        }
    } else {
        // 否则按位置排序
        if (posA.rects[0]?.x > posC.rects[0]?.x) {
            [posA, posC] = [posC, posA];
        }
    }
    
    // 检查两个区域是否相邻
    const isAdjacent = checkAdjacent(posA, posC, configInfo);
    
    if (isAdjacent) {
        // 情况1：两个区域相邻，分为A和C两个区域
        drawAdjacentSwitch(posA, posC, ctx);
    } else {
        // 情况2：两个区域不相邻，分为A、B、C三个区域
        // 使用配置信息来计算中间区域
        drawNonAdjacentSwitch(posA, posC, ctx, configInfo);
    }
}

// 检查两个区域是否相邻
function checkAdjacent(posA, posC, configInfo) {
    // 如果有配置信息，使用索引检查是否相邻
    if (configInfo && configInfo.configA && configInfo.configC) {
        const aEndIndex = configInfo.configA.end_index;
        const cStartIndex = configInfo.configC.start_index;
        
        // 相邻定义：A区域的结束索引+1等于C区域的开始索引
        return aEndIndex + 1 === cStartIndex;
    }
    
    // 如果没有配置信息，使用位置检查
    // 获取A区域的最后一个字符位置
    const lastARect = posA.rects[posA.rects.length - 1];
    // 获取C区域的第一个字符位置
    const firstCRect = posC.rects[0];
    
    if (!lastARect || !firstCRect) return false;
    
    // 检查A区域的结束位置是否与C区域的开始位置相邻
    const aEndX = lastARect.x + lastARect.width;
    const cStartX = firstCRect.x;
    const aEndY = lastARect.y + lastARect.height;
    const cStartY = firstCRect.y;
    
    // 相邻条件：水平距离小于1个像素且垂直方向重叠（同一行）
    return Math.abs(aEndX - cStartX) < 1 && Math.abs(aEndY - cStartY) < 10;
}

// 绘制相邻区域的换位标注
function drawAdjacentSwitch(posA, posC, ctx) {
    // 绘制A区域：不显示上边框
    drawRegion(posA, ctx, { top: false, right: true, bottom: true, left: true });
    
    // 绘制C区域：不显示左边框和下边框
    drawRegion(posC, ctx, { top: true, right: true, bottom: false, left: false });
}

// 绘制非相邻区域的换位标注
function drawNonAdjacentSwitch(posA, posC, ctx, configInfo) {
    // 绘制A区域：不显示上边框
    drawRegion(posA, ctx, { top: false, right: true, bottom: true, left: true });
    
    // 获取中间区域B的位置信息
    let posB = null;
    
    if (configInfo && configInfo.configA && configInfo.configC) {
        // 使用配置信息计算中间区域
        posB = calculateMiddleRegionByIndex(configInfo.configA, configInfo.configC);
    } else {
        // 否则使用位置信息计算
        posB = calculateMiddleRegion(posA, posC);
    }
    
    if (posB) {
        // 绘制B区域：不显示左和下边框
        drawRegion(posB, ctx, { top: true, right: true, bottom: false, left: false });
    }
    
    // 绘制C区域：不显示左和上边框
    drawRegion(posC, ctx, { top: false, right: true, bottom: true, left: false });
}

// 根据索引计算中间区域B的位置信息
function calculateMiddleRegionByIndex(configA, configC) {
    // 获取文本容器和document-layer
    const textContainer = document.getElementById('text-content');
    const documentLayer = document.getElementById('document-layer');
    if (!textContainer || !documentLayer) return null;
    
    // 获取所有字符span元素
    const allSpans = Array.from(textContainer.children);
    if (allSpans.length === 0) return null;
    
    // 获取A区域的结束索引和C区域的开始索引
    const aEndIndex = configA.end_index;
    const cStartIndex = configC.start_index;
    
    // 确保索引有效
    if (aEndIndex < 0 || cStartIndex >= allSpans.length || aEndIndex >= cStartIndex) {
        return null;
    }
    
    // 提取中间区域的所有span元素
    const middleSpans = allSpans.slice(aEndIndex + 1, cStartIndex);
    if (middleSpans.length === 0) return null;
    
    // 获取document-layer的位置信息，作为参考点
    const containerRect = documentLayer.getBoundingClientRect();
    
    // 计算中间区域的位置和尺寸
    // 初始化边界值为第一个span的位置
    const firstSpan = middleSpans[0];
    const firstRect = firstSpan.getBoundingClientRect();
    
    // 计算相对于document-layer的坐标
    let minX = firstRect.left - containerRect.left;
    let minY = firstRect.top - containerRect.top;
    let maxX = firstRect.right - containerRect.left;
    let maxY = firstRect.bottom - containerRect.top;
    
    const rects = [];
    
    // 添加第一个span到rects数组
    rects.push({
        x: minX,
        y: minY,
        width: firstRect.width,
        height: firstRect.height
    });
    
    // 遍历剩余的span，更新边界
    for (let i = 1; i < middleSpans.length; i++) {
        const span = middleSpans[i];
        const rect = span.getBoundingClientRect();
        
        // 计算相对于document-layer的坐标
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        const right = rect.right - containerRect.left;
        const bottom = rect.bottom - containerRect.top;
        
        // 更新边界
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
        
        // 添加到rects数组
        rects.push({
            x: x,
            y: y,
            width: rect.width,
            height: rect.height
        });
    }
    
    // 计算中间区域的位置和尺寸
    const bounds = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
    
    return {
        rects: rects,
        bounds: bounds
    };
}

// 计算中间区域B的位置信息
function calculateMiddleRegion(posA, posC, configInfo) {
    // 忽略configInfo参数，保持兼容性
    // 获取A区域的最后一个字符和C区域的第一个字符的索引
    const textContainer = document.getElementById('text-content');
    const documentLayer = document.getElementById('document-layer');
    if (!textContainer || !documentLayer) return null;
    
    // 获取所有字符span元素
    const allSpans = Array.from(textContainer.children);
    if (allSpans.length === 0) return null;
    
    // 获取A区域最后一个字符和C区域第一个字符的位置
    const lastARect = posA.rects[posA.rects.length - 1];
    const firstCRect = posC.rects[0];
    
    if (!lastARect || !firstCRect) return null;
    
    // 获取document-layer的位置信息，作为参考点
    const containerRect = documentLayer.getBoundingClientRect();
    
    // 遍历所有span，找到A区域最后一个字符和C区域第一个字符的索引
    let lastAIndex = -1;
    let firstCIndex = -1;
    
    allSpans.forEach((span, index) => {
        // 获取span的位置
        const spanRect = span.getBoundingClientRect();
        const spanX = spanRect.left - containerRect.left;
        const spanY = spanRect.top - containerRect.top;
        
        // 检查是否是A区域的最后一个字符
        if (Math.abs(spanX - lastARect.x) < 1 && Math.abs(spanY - lastARect.y) < 1) {
            lastAIndex = index;
        }
        
        // 检查是否是C区域的第一个字符
        if (Math.abs(spanX - firstCRect.x) < 1 && Math.abs(spanY - firstCRect.y) < 1) {
            firstCIndex = index;
        }
    });
    
    // 如果找不到索引或者顺序不对，返回null
    if (lastAIndex === -1 || firstCIndex === -1 || lastAIndex >= firstCIndex) {
        return null;
    }
    
    // 提取中间区域的所有span元素
    const middleSpans = allSpans.slice(lastAIndex + 1, firstCIndex);
    if (middleSpans.length === 0) return null;
    
    // 初始化边界值为第一个span的位置
    const firstSpan = middleSpans[0];
    const firstRect = firstSpan.getBoundingClientRect();
    
    // 计算相对于document-layer的坐标
    let minX = firstRect.left - containerRect.left;
    let minY = firstRect.top - containerRect.top;
    let maxX = firstRect.right - containerRect.left;
    let maxY = firstRect.bottom - containerRect.top;
    
    const rects = [];
    
    // 添加第一个span到rects数组
    rects.push({
        x: minX,
        y: minY,
        width: firstRect.width,
        height: firstRect.height
    });
    
    // 遍历剩余的span，更新边界
    for (let i = 1; i < middleSpans.length; i++) {
        const span = middleSpans[i];
        const rect = span.getBoundingClientRect();
        
        // 计算相对于document-layer的坐标
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        const right = rect.right - containerRect.left;
        const bottom = rect.bottom - containerRect.top;
        
        // 更新边界
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
        
        // 添加到rects数组
        rects.push({
            x: x,
            y: y,
            width: rect.width,
            height: rect.height
        });
    }
    
    // 计算中间区域的位置和尺寸
    const bounds = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
    
    return {
        rects: rects,
        bounds: bounds
    };
}

// 绘制单个区域，根据指定的边框显示规则
function drawRegion(position, ctx, borders) {
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
        
        // 根据字符在区域中的位置，应用不同的边框规则
        // 第一个字不显示右边框，最后一个字不显示左边框，中间字不显示左右边框
        const isFirstChar = index === 0;
        const isLastChar = index === rects.length - 1;
        const isMiddleChar = !isFirstChar && !isLastChar;
        
        // 上边框
        if (borders.top) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1); // 上边框
        }
        
        // 右边框：根据字符位置绘制
        if (borders.right) {
            // 只有最后一个字符绘制右边框，第一个和中间字符不绘制
            if (isLastChar) {
                ctx.moveTo(x2, y1);
                ctx.lineTo(x2, y2); // 右边框
            }
        }
        
        // 下边框
        if (borders.bottom) {
            ctx.moveTo(x1, y2);
            ctx.lineTo(x2, y2); // 下边框
        }
        
        // 左边框：根据字符位置绘制
        if (borders.left) {
            // 只有第一个字符绘制左边框，最后一个和中间字符不绘制
            if (isFirstChar) {
                ctx.moveTo(x1, y1);
                ctx.lineTo(x1, y2); // 左边框
            }
        }
        
        // 绘制边框
        ctx.stroke();
        
        // 恢复状态
        ctx.restore();
    });
}

// 导出换位绘制函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { drawSwitch };
} else {
    window.drawSwitch = drawSwitch;
}