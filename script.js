// 文档标注器 - 精确版实现

document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const textContent = document.getElementById('text-content');
    const canvas = document.getElementById('annotation-canvas');
    const ctx = canvas.getContext('2d');
    const documentText = document.getElementById('document-text');
    const annotationInput = document.getElementById('annotation-input');
    const executeBtn = document.getElementById('execute-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewSection = document.querySelector('.preview-section');
    const documentLayer = document.getElementById('document-layer');
    
    // 保存当前标注配置，用于窗口大小变化时重新绘制
    let currentAnnotations = [];
    
    // 保存多选配置，用于Ctrl键多选时
    let multiSelectConfigs = [];
    
    // 保存历史记录，用于撤销/重做功能
    let history = [];
    let historyIndex = -1;
    const MAX_HISTORY = 50; // 最大历史记录数量
    
    // 光标相关
    let cursor = null;
    let currentCursorPosition = -1; // 当前光标位置
    
    // 用户提供的复杂贝塞尔曲线数据
    const userBezierData = {
        "samplePoints": [ { "x": "269.00", "y": "380.68" }, { "x": "269.00", "y": "372.08" }, { "x": "272.00", "y": "365.13" }, { "x": "276.15", "y": "358.38" }, { "x": "279.62", "y": "351.07" }, { "x": "285.40", "y": "346.68" }, { "x": "289.34", "y": "340.99" }, { "x": "295.34", "y": "336.34" }, { "x": "301.43", "y": "331.26" }, { "x": "309.26", "y": "329.42" }, { "x": "317.56", "y": "328.68" }, { "x": "326.16", "y": "328.68" }, { "x": "334.76", "y": "328.68" }, { "x": "339.00", "y": "333.62" }, { "x": "341.00", "y": "340.22" }, { "x": "338.86", "y": "346.68" }, { "x": "330.50", "y": "347.68" }, { "x": "321.90", "y": "347.68" }, { "x": "318.00", "y": "341.81" }, { "x": "317.00", "y": "334.21" }, { "x": "319.00", "y": "327.02" }, { "x": "322.02", "y": "320.68" }, { "x": "327.00", "y": "317.06" }, { "x": "333.69", "y": "312.99" }, { "x": "340.94", "y": "309.74" }, { "x": "348.10", "y": "307.68" }, { "x": "355.70", "y": "306.68" }, { "x": "363.30", "y": "305.68" }, { "x": "371.90", "y": "305.68" }, { "x": "380.50", "y": "305.68" }, { "x": "389.10", "y": "305.68" }, { "x": "393.63", "y": "309.99" }, { "x": "396.00", "y": "317.51" }, { "x": "390.57", "y": "320.68" }, { "x": "382.97", "y": "321.68" }, { "x": "374.37", "y": "321.68" }, { "x": "369.00", "y": "317.69" }, { "x": "367.00", "y": "310.51" }, { "x": "368.35", "y": "302.99" }, { "x": "372.72", "y": "297.68" }, { "x": "377.93", "y": "293.75" }, { "x": "383.45", "y": "290.45" }, { "x": "390.46", "y": "287.68" }, { "x": "398.40", "y": "285.68" }, { "x": "406.00", "y": "284.68" }, { "x": "413.60", "y": "305.68" }, { "x": "421.00", "y": "305.68" }, { "x": "428.80", "y": "281.68" }, { "x": "436.40", "y": "280.68" }, { "x": "445.00", "y": "280.68" } ], 
        "bezierCurves": [ [ { "x": "269.00", "y": "380.68" }, { "x": "269.00", "y": "375.52" }, { "x": "268.10", "y": "376.75" }, { "x": "269.00", "y": "372.08" } ], [ { "x": "269.00", "y": "372.08" }, { "x": "269.90", "y": "367.42" }, { "x": "269.86", "y": "369.24" }, { "x": "272.00", "y": "365.13" } ], [ { "x": "272.00", "y": "365.13" }, { "x": "274.14", "y": "361.02" }, { "x": "273.87", "y": "362.60" }, { "x": "276.15", "y": "358.38" } ], [ { "x": "276.15", "y": "358.38" }, { "x": "278.43", "y": "354.16" }, { "x": "276.84", "y": "354.58" }, { "x": "279.62", "y": "351.07" } ], [ { "x": "279.62", "y": "351.07" }, { "x": "282.39", "y": "347.56" }, { "x": "282.49", "y": "349.70" }, { "x": "285.40", "y": "346.68" } ], [ { "x": "285.40", "y": "346.68" }, { "x": "288.32", "y": "343.66" }, { "x": "286.36", "y": "344.10" }, { "x": "289.34", "y": "340.99" } ], [ { "x": "289.34", "y": "340.99" }, { "x": "292.32", "y": "337.89" }, { "x": "291.72", "y": "339.26" }, { "x": "295.34", "y": "336.34" } ], [ { "x": "295.34", "y": "336.34" }, { "x": "298.96", "y": "333.42" }, { "x": "297.25", "y": "333.33" }, { "x": "301.43", "y": "331.26" } ], [ { "x": "301.43", "y": "331.26" }, { "x": "305.60", "y": "329.18" }, { "x": "304.42", "y": "330.19" }, { "x": "309.26", "y": "329.42" } ], [ { "x": "309.26", "y": "329.42" }, { "x": "314.10", "y": "328.64" }, { "x": "312.49", "y": "328.90" }, { "x": "317.56", "y": "328.68" } ], [ { "x": "317.56", "y": "328.68" }, { "x": "322.63", "y": "328.46" }, { "x": "321.00", "y": "328.68" }, { "x": "326.16", "y": "328.68" } ], [ { "x": "326.16", "y": "328.68" }, { "x": "331.32", "y": "328.68" }, { "x": "330.90", "y": "327.20" }, { "x": "334.76", "y": "328.68" } ], [ { "x": "334.76", "y": "328.68" }, { "x": "338.61", "y": "330.16" }, { "x": "337.13", "y": "330.16" }, { "x": "339.00", "y": "333.62" } ], [ { "x": "339.00", "y": "333.62" }, { "x": "340.87", "y": "337.08" }, { "x": "341.04", "y": "336.30" }, { "x": "341.00", "y": "340.22" } ], [ { "x": "341.00", "y": "340.22" }, { "x": "340.96", "y": "344.14" }, { "x": "342.01", "y": "344.44" }, { "x": "338.86", "y": "346.68" } ], [ { "x": "338.86", "y": "346.68" }, { "x": "335.71", "y": "348.92" }, { "x": "335.59", "y": "347.38" }, { "x": "330.50", "y": "347.68" } ], [ { "x": "330.50", "y": "347.68" }, { "x": "325.41", "y": "347.98" }, { "x": "325.65", "y": "349.44" }, { "x": "321.90", "y": "347.68" } ], [ { "x": "321.90", "y": "347.68" }, { "x": "318.15", "y": "345.92" }, { "x": "319.47", "y": "345.85" }, { "x": "318.00", "y": "341.81" } ], [ { "x": "318.00", "y": "341.81" }, { "x": "316.53", "y": "337.77" }, { "x": "316.70", "y": "338.64" }, { "x": "317.00", "y": "334.21" } ], [ { "x": "317.00", "y": "334.21" }, { "x": "317.30", "y": "329.77" }, { "x": "317.49", "y": "331.08" }, { "x": "319.00", "y": "327.02" } ], [ { "x": "319.00", "y": "327.02" }, { "x": "320.51", "y": "322.96" }, { "x": "319.62", "y": "323.67" }, { "x": "322.02", "y": "320.68" } ], [ { "x": "322.02", "y": "320.68" }, { "x": "324.42", "y": "317.69" }, { "x": "323.50", "y": "319.37" }, { "x": "327.00", "y": "317.06" } ], [ { "x": "327.00", "y": "317.06" }, { "x": "330.50", "y": "314.75" }, { "x": "329.51", "y": "315.19" }, { "x": "333.69", "y": "312.99" } ], [ { "x": "333.69", "y": "312.99" }, { "x": "337.87", "y": "310.79" }, { "x": "336.62", "y": "311.33" }, { "x": "340.94", "y": "309.74" } ], [ { "x": "340.94", "y": "309.74" }, { "x": "345.27", "y": "308.14" }, { "x": "343.68", "y": "308.60" }, { "x": "348.10", "y": "307.68" } ], [ { "x": "348.10", "y": "307.68" }, { "x": "352.53", "y": "306.76" }, { "x": "351.14", "y": "307.28" }, { "x": "355.70", "y": "306.68" } ], [ { "x": "355.70", "y": "306.68" }, { "x": "360.26", "y": "306.08" }, { "x": "358.44", "y": "305.98" }, { "x": "363.30", "y": "305.68" } ], [ { "x": "363.30", "y": "305.68" }, { "x": "368.16", "y": "305.38" }, { "x": "366.74", "y": "305.68" }, { "x": "371.90", "y": "305.68" } ], [ { "x": "371.90", "y": "305.68" }, { "x": "377.06", "y": "305.68" }, { "x": "375.34", "y": "305.68" }, { "x": "380.50", "y": "305.68" } ], [ { "x": "380.50", "y": "305.68" }, { "x": "385.66", "y": "305.68" }, { "x": "385.16", "y": "304.39" }, { "x": "389.10", "y": "305.68" } ], [ { "x": "389.10", "y": "305.68" }, { "x": "393.04", "y": "306.97" }, { "x": "391.56", "y": "306.45" }, { "x": "393.63", "y": "309.99" } ], [ { "x": "393.63", "y": "309.99" }, { "x": "395.70", "y": "313.54" }, { "x": "396.92", "y": "314.30" }, { "x": "396.00", "y": "317.51" } ], [ { "x": "396.00", "y": "317.51" }, { "x": "395.08", "y": "320.71" }, { "x": "394.48", "y": "319.43" }, { "x": "390.57", "y": "320.68" } ], [ { "x": "390.57", "y": "320.68" }, { "x": "386.67", "y": "321.93" }, { "x": "387.83", "y": "321.38" }, { "x": "382.97", "y": "321.68" } ], [ { "x": "382.97", "y": "321.68" }, { "x": "378.11", "y": "321.98" }, { "x": "378.57", "y": "322.88" }, { "x": "374.37", "y": "321.68" } ], [ { "x": "374.37", "y": "321.68" }, { "x": "370.18", "y": "320.48" }, { "x": "371.21", "y": "321.04" }, { "x": "369.00", "y": "317.69" } ], [ { "x": "369.00", "y": "317.69" }, { "x": "366.79", "y": "314.34" }, { "x": "367.20", "y": "314.92" }, { "x": "367.00", "y": "310.51" } ], [ { "x": "367.00", "y": "310.51" }, { "x": "366.80", "y": "306.10" }, { "x": "366.63", "y": "306.84" }, { "x": "368.35", "y": "302.99" } ], [ { "x": "368.35", "y": "302.99" }, { "x": "370.06", "y": "299.14" }, { "x": "369.85", "y": "300.45" }, { "x": "372.72", "y": "297.68" } ], [ { "x": "372.72", "y": "297.68" }, { "x": "375.60", "y": "294.91" }, { "x": "374.71", "y": "295.91" }, { "x": "377.93", "y": "293.75" } ], [ { "x": "377.93", "y": "293.75" }, { "x": "381.15", "y": "291.58" }, { "x": "379.70", "y": "292.27" }, { "x": "383.45", "y": "290.45" } ], [ { "x": "383.45", "y": "290.45" }, { "x": "387.21", "y": "288.63" }, { "x": "385.97", "y": "289.11" }, { "x": "390.46", "y": "287.68" } ], [ { "x": "390.46", "y": "287.68" }, { "x": "394.94", "y": "286.25" }, { "x": "393.74", "y": "286.58" }, { "x": "398.40", "y": "285.68" } ], [ { "x": "398.40", "y": "285.68" }, { "x": "403.07", "y": "284.78" }, { "x": "401.44", "y": "285.28" }, { "x": "406.00", "y": "284.68" } ], [ { "x": "406.00", "y": "284.68" }, { "x": "410.56", "y": "284.08" }, { "x": "409.10", "y": "283.68" }, { "x": "413.60", "y": "305.68" } ], [ { "x": "413.60", "y": "305.68" }, { "x": "418.10", "y": "305.28" }, { "x": "416.44", "y": "305.68" }, { "x": "421.00", "y": "305.68" } ], [ { "x": "421.00", "y": "305.68" }, { "x": "425.56", "y": "305.68" }, { "x": "424.18", "y": "305.28" }, { "x": "428.80", "y": "281.68" } ], [ { "x": "428.80", "y": "281.68" }, { "x": "433.42", "y": "281.14" }, { "x": "431.54", "y": "280.98" }, { "x": "436.40", "y": "280.68" } ], [ { "x": "436.40", "y": "280.68" }, { "x": "441.26", "y": "280.38" }, { "x": "439.84", "y": "280.68" }, { "x": "445.00", "y": "280.68" } ] ], 
        "totalPoints": 50, 
        "totalCurves": 49 
    };
    
    // 处理贝塞尔曲线数据，转换为数值类型
    const processedBezierCurves = userBezierData.bezierCurves.map(curve => {
        return curve.map(point => ({
            x: parseFloat(point.x),
            y: parseFloat(point.y)
        }));
    });
    
    // 右键菜单相关
    const contextMenu = document.getElementById('context-menu');
    let selectedAnnotationType = 'box'; // 默认标注类型
    
    // 显示右键菜单
    function showContextMenu(x, y) {
        contextMenu.style.display = 'block';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
    }
    
    // 隐藏右键菜单
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }
    
    // 获取当前选中的标注类型
    function getCurrentAnnotationType() {
        return selectedAnnotationType;
    }
    
    // 处理右键菜单点击
    function handleMenuItemClick(event) {
        const action = event.target.dataset.action;
        if (action) {
            selectedAnnotationType = action;
            // 执行标注操作
            executeAnnotation();
            hideContextMenu();
        }
    }
    
    // 处理文本右键菜单事件
    function handleTextContextMenu(event) {
        event.preventDefault();
        // 更新JSON配置并显示右键菜单
        handleTextSelection(event);
        showContextMenu(event.clientX, event.clientY);
    }
    
    // 初始化：确保canvas大小正确
    function initCanvas() {
        if (documentLayer) {
            // 获取document-layer的实际大小，让canvas完全覆盖它
            const layerRect = documentLayer.getBoundingClientRect();
            const textContentRect = textContent.getBoundingClientRect();
            
            // 使用document-layer的宽度和高度来设置canvas大小
            const width = layerRect.width;
            const height = layerRect.height;
            
            // 设置canvas实际像素大小
            canvas.width = width;
            canvas.height = height;
            
            // 设置canvas CSS大小和位置，使其完全覆盖document-layer
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            canvas.style.position = 'absolute';
            canvas.style.top = '0px';
            canvas.style.left = '0px';
            canvas.style.zIndex = '2';
            
            console.log('Canvas initialized:', { width, height });
            
            // 重新绘制现有标注
            redrawAnnotations();
        }
    }
    
    // 将文本内容拆分为单个字符的span元素，便于添加和移除高亮样式
    function renderTextWithSpans() {
        const text = documentText.value;
        textContent.innerHTML = ''; // 清空现有内容
        
        // 将每个字符包装在span中，方便添加高亮样式
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.textContent = char;
            span.dataset.index = i.toString();
            textContent.appendChild(span);
        }
        
        // 等待DOM更新后调整canvas大小
        setTimeout(initCanvas, 0); 
    }
    
    // 更新文档内容
    function updateDocument() {
        renderTextWithSpans();
        clearAnnotations();
        currentAnnotations = [];
        
        // 更新输出文本区域的内容，保持与标注区域同步
        const outputContent = document.getElementById('output-content');
        if (outputContent) {
            outputContent.textContent = documentText.value;
        }
    }
    
    // 应用自定义选择高亮，显示所有选择的内容
    function applyCustomSelection() {
        // 移除所有现有高亮
        document.querySelectorAll('.custom-selection').forEach(span => {
            span.classList.remove('custom-selection');
        });
        
        // 应用新的高亮
        multiSelectConfigs.forEach(config => {
            const start = config.start_index;
            const end = config.end_index;
            
            // 为范围内的每个span添加高亮
            for (let i = start; i <= end; i++) {
                const span = textContent.children[i];
                if (span) {
                    span.classList.add('custom-selection');
                }
            }
        });
        console.log('应用自定义选择高亮，显示所有选择内容');
    }
    
    // 获取文本范围的精确位置（支持换行和跨多行）
    function getTextRangePosition(startIndex, endIndex) {
        const text = textContent.textContent;
        if (startIndex < 0 || endIndex >= text.length || startIndex > endIndex) {
            throw new Error(`无效的文本范围: ${startIndex} - ${endIndex}`);
        }
        
        // 获取每个字符的位置信息
        const charRects = [];
        
        // 获取document-layer和textContent的位置信息，作为参考点
        const layerRect = documentLayer.getBoundingClientRect();
        const textContentRect = textContent.getBoundingClientRect();
        
        // 遍历每个字符，获取位置信息
        for (let i = startIndex; i <= endIndex; i++) {
            const charRange = document.createRange();
            const charNode = textContent.children[i];
            
            charRange.setStart(charNode, 0);
            charRange.setEnd(charNode, charNode.textContent.length);
            
            const charRect = charRange.getBoundingClientRect();
            
            // 将高度等比例增高5%，但不向上偏移
            const height = charRect.height * 1.05;
            
            // 计算相对于document-layer的位置（与canvas定位上下文匹配）
            charRects.push({
                x: charRect.left - layerRect.left,
                y: charRect.top - layerRect.top,
                width: charRect.width,
                height: height
            });
        }
        
        // 计算整个范围的边界框
        let bounds = null;
        if (charRects.length > 0) {
            bounds = {
                x: Math.min(...charRects.map(r => r.x)),
                y: Math.min(...charRects.map(r => r.y)),
                width: Math.max(...charRects.map(r => r.x + r.width)) - Math.min(...charRects.map(r => r.x)),
                height: Math.max(...charRects.map(r => r.y + r.height)) - Math.min(...charRects.map(r => r.y))
            };
        }
        
        return {
            rects: charRects,
            // 同时返回整个范围的边界框，用于简化某些场景的处理
            bounds: bounds
        };
    }
    
    // 清除标注
    function clearAnnotations() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // 检查两个区间是否重叠
    function isRangesOverlap(range1, range2) {
        // range1: {start_index, end_index}
        // range2: {start_index, end_index}
        return !(range1.end_index < range2.start_index || range1.start_index > range2.end_index);
    }
    
    // 检查两个区间是否相邻
    function isRangesAdjacent(range1, range2) {
        // 相邻定义：range1.end_index + 1 == range2.start_index 或者 range1.start_index - 1 == range2.end_index
        return (range1.end_index + 1 === range2.start_index) || (range1.start_index - 1 === range2.end_index);
    }
    
    // 合并相邻标注
function mergeAdjacentAnnotations() {
    if (currentAnnotations.length <= 1) return;
    
    // 按start_index排序，方便合并相邻区间
    currentAnnotations.sort((a, b) => a.start_index - b.start_index);
    
    const mergedAnnotations = [];
    let currentMerge = currentAnnotations[0];
    
    for (let i = 1; i < currentAnnotations.length; i++) {
        const nextAnn = currentAnnotations[i];
        
        // 只有相同类型的标注才能合并
        if (currentMerge.type === nextAnn.type) {
            // switch类型标注不合并，因为它需要两个独立的区域
            if (currentMerge.type !== 'switch' && isRangesAdjacent(currentMerge, nextAnn)) {
                // 合并两个相邻区间
                currentMerge = {
                    ...currentMerge,
                    start_index: Math.min(currentMerge.start_index, nextAnn.start_index),
                    end_index: Math.max(currentMerge.end_index, nextAnn.end_index)
                };
            } else {
                // 不相邻或switch类型，将当前合并结果加入数组，开始新的合并
                mergedAnnotations.push(currentMerge);
                currentMerge = nextAnn;
            }
        } else {
            // 不同类型，不能合并，将当前合并结果加入数组，开始新的合并
            mergedAnnotations.push(currentMerge);
            currentMerge = nextAnn;
        }
    }
    
    // 将最后一个合并结果加入数组
    mergedAnnotations.push(currentMerge);
    
    // 更新当前标注列表
    currentAnnotations = mergedAnnotations;
    console.log('合并后标注:', currentAnnotations);
}
    
    // 验证单个标注配置
    function validateAnnotationConfig(config) {
        // 检查必要字段
        if (config.start_index === undefined || config.end_index === undefined) {
            throw new Error('缺少start_index或end_index字段');
        }
        
        // 验证索引类型
        if (typeof config.start_index !== 'number' || typeof config.end_index !== 'number') {
            throw new Error('start_index和end_index必须是数字类型');
        }
        
        // 验证索引范围
        const textLength = textContent.textContent.length;
        if (config.start_index < 0 || config.end_index >= textLength) {
            throw new Error(`索引超出文本范围 (0-${textLength-1})`);
        }
        
        if (config.start_index > config.end_index) {
            throw new Error('start_index不能大于end_index');
        }
        
        return true;
    }
    
    // 保存并执行标注
    function executeAnnotation() {
        try {
            let configs;
            
            // 尝试解析JSON，提供更友好的错误提示
            try {
                configs = JSON.parse(annotationInput.value);
            } catch (jsonError) {
                let errorMsg = 'JSON格式错误';
                if (jsonError.message.includes('position')) {
                    errorMsg += `: ${jsonError.message}. 请检查JSON语法，确保使用双引号，逗号分隔。`;
                }
                throw new Error(errorMsg);
            }
            
            // 确保是数组格式
            const configArray = Array.isArray(configs) ? configs : [configs];
            
            // 如果配置数组为空，不执行标注
            if (configArray.length === 0) {
                return;
            }
            
            // 验证所有配置
            configArray.forEach(config => validateAnnotationConfig(config));
            
            // 获取当前标注类型
            const annotationType = getCurrentAnnotationType();
            
            // 检查并清除与任何新标注重叠的旧标注
            const newRanges = configArray.map(config => ({
                start_index: config.start_index,
                end_index: config.end_index
            }));
            
            // 过滤掉与任何新标注重叠的旧标注
            const filteredAnnotations = currentAnnotations.filter(oldAnn => {
                // 检查旧标注是否与任何新标注重叠
                const isOverlapping = newRanges.some(newRange => {
                    return isRangesOverlap(
                        { start_index: oldAnn.start_index, end_index: oldAnn.end_index },
                        newRange
                    );
                });
                return !isOverlapping;
            });
            
            // 更新当前标注配置
            currentAnnotations = filteredAnnotations;
            
            // 添加所有新标注配置
            const fullConfigs = configArray.map(config => ({
                ...config,
                type: annotationType
            }));
            currentAnnotations.push(...fullConfigs);
            
            // 合并相邻标注
            mergeAdjacentAnnotations();
            
            console.log('添加新标注:', fullConfigs);
            console.log('当前所有标注:', currentAnnotations);
            
            // 保存到历史记录
            saveToHistory();
            
            // 重新绘制所有标注
            clearAnnotations();
            redrawAnnotations();
            
            // 重置多选配置，允许用户开始新的选择
            resetMultiSelect();
            
        } catch (error) {
            alert(`标注失败: ${error.message}`);
            console.error('错误:', error);
        }
    }
    

    
    // 保存当前状态到历史记录
    function saveToHistory() {
        // 删除当前索引之后的历史记录
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        
        // 保存当前标注状态
        const state = {
            annotations: JSON.parse(JSON.stringify(currentAnnotations)),
            timestamp: Date.now()
        };
        
        history.push(state);
        
        // 限制历史记录数量
        if (history.length > MAX_HISTORY) {
            history.shift();
        } else {
            historyIndex++;
        }
        
        console.log('保存历史记录:', historyIndex, history.length);
    }
    
    // 撤销操作
    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            currentAnnotations = JSON.parse(JSON.stringify(history[historyIndex].annotations));
            clearAnnotations();
            redrawAnnotations();
            console.log('撤销操作:', historyIndex);
        }
    }
    
    // 重做操作
    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            currentAnnotations = JSON.parse(JSON.stringify(history[historyIndex].annotations));
            clearAnnotations();
            redrawAnnotations();
            console.log('重做操作:', historyIndex);
        }
    }
    
    // 创建并显示光标
    function createCursor() {
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.className = 'cursor';
            textContent.appendChild(cursor);
        }
    }
    
    // 更新光标位置
    function updateCursorPosition(index) {
        if (index < 0 || index > textContent.children.length) {
            hideCursor();
            return;
        }
        
        createCursor();
        currentCursorPosition = index;
        
        let rect;
        const containerRect = textContent.getBoundingClientRect();
        
        if (index === textContent.children.length) {
            // 在文本末尾
            const lastSpan = textContent.children[index - 1];
            rect = lastSpan.getBoundingClientRect();
            cursor.style.left = `${rect.right - containerRect.left}px`;
            cursor.style.top = `${rect.top - containerRect.top}px`;
        } else {
            // 在文本中间
            const span = textContent.children[index];
            rect = span.getBoundingClientRect();
            cursor.style.left = `${rect.left - containerRect.left}px`;
            cursor.style.top = `${rect.top - containerRect.top}px`;
        }
        
        cursor.style.display = 'block';
    }
    
    // 隐藏光标
    function hideCursor() {
        if (cursor) {
            cursor.style.display = 'none';
            currentCursorPosition = -1;
        }
    }
    
    // 处理文本点击事件，显示光标
    function handleTextClick(event) {
        // 只在单击时显示光标，不影响拖动选择
        if (event.detail !== 1) return;
        
        // 使用Range API找到点击位置的字符
        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (!range) return;
        
        // 获取点击位置的字符索引
        let index = 0;
        
        // 检查点击位置所在的元素
        let startNode = range.startContainer;
        let parentNode = startNode.parentNode;
        
        // 寻找正确的span元素，直到找到textContent的直接子元素
        while (parentNode && parentNode !== textContent && parentNode.parentNode !== textContent) {
            startNode = parentNode;
            parentNode = startNode.parentNode;
        }
        
        if (parentNode === textContent) {
            // 如果直接是textContent的子元素
            index = Array.from(textContent.children).indexOf(startNode);
        } else if (parentNode.parentNode === textContent) {
            // 如果是textContent的子元素的子节点
            const spanElement = parentNode;
            index = Array.from(textContent.children).indexOf(spanElement);
        } else {
            // 找不到合适的位置，隐藏光标
            hideCursor();
            return;
        }
        
        // 更新光标位置
        updateCursorPosition(index);
        
        // 不要立即清除当前选择，允许用户继续操作
        // 只有在点击其他区域时才会清除选择
    }
    
    // 重新绘制所有标注
    function redrawAnnotations() {
        if (currentAnnotations.length === 0) return;
        
        clearAnnotations();
        
        // 按类型分组处理标注
        const switchConfigs = currentAnnotations.filter(config => config.type === 'switch');
        const otherConfigs = currentAnnotations.filter(config => config.type !== 'switch');
        
        // 处理非switch类型标注
        otherConfigs.forEach(config => {
            try {
                const position = getTextRangePosition(config.start_index, config.end_index);
                
                // 根据类型绘制不同的标注
                switch (config.type) {
                    case 'box':
                        drawBox(position, ctx);
                        break;
                    case 'delete':
                        // 删除类型：先绘制框选，再绘制删除标记
                        drawBox(position, ctx);
                        drawDeleteMark(position, ctx);
                        break;
                    default:
                        drawBox(position, ctx);
                }
            } catch (error) {
                console.error('重新绘制标注失败:', error);
            }
        });
        
        // 处理switch类型标注（需要两个相邻的标注）
    // 将switch标注按每两个一组进行处理
    for (let i = 0; i < switchConfigs.length; i += 2) {
        if (i + 1 < switchConfigs.length) {
            try {
                // 获取当前组的两个标注
                const config1 = switchConfigs[i];
                const config2 = switchConfigs[i + 1];
                
                // 按start_index排序，确保A在前，C在后
                const sortedConfigs = [config1, config2].sort((a, b) => a.start_index - b.start_index);
                
                // 获取两个位置
                const posA = getTextRangePosition(sortedConfigs[0].start_index, sortedConfigs[0].end_index);
                const posC = getTextRangePosition(sortedConfigs[1].start_index, sortedConfigs[1].end_index);
                
                // 传递完整的配置信息给drawSwitch函数
                drawSwitch([posA, posC], ctx, { 
                    configA: sortedConfigs[0],
                    configC: sortedConfigs[1]
                });
            } catch (error) {
                console.error('重新绘制换位标注失败:', error);
            }
        }
    }
    }
    
    // 处理文字选中事件
    function handleTextSelection(event) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;
        
        // 确保选中的是textContent内的文字
        const anchorNode = selection.anchorNode;
        const focusNode = selection.focusNode;
        
        // 检查是否在textContent内部
        const isAnchorInTextContent = textContent.contains(anchorNode);
        const isFocusInTextContent = textContent.contains(focusNode);
        const isInTextContent = isAnchorInTextContent && isFocusInTextContent;
            
        if (isInTextContent) {
            // 获取选中的起始和结束范围
            const range = selection.getRangeAt(0);
            
            // 获取选中的文本内容
            const selectedText = range.toString();
            if (!selectedText) return;
            
            // 计算选中范围在完整文本中的索引
            let startIndex, endIndex;
            
            // 获取所有字符span元素
            const allSpans = Array.from(textContent.children);
            
            // 找到起始span元素
            let startSpan = anchorNode;
            while (startSpan && startSpan.nodeType !== 1 || (startSpan && startSpan.tagName !== 'SPAN')) {
                startSpan = startSpan.parentNode;
                // 如果已经到了document根节点，停止循环
                if (!startSpan) break;
            }
            
            // 找到结束span元素
            let endSpan = focusNode;
            while (endSpan && endSpan.nodeType !== 1 || (endSpan && endSpan.tagName !== 'SPAN')) {
                endSpan = endSpan.parentNode;
                // 如果已经到了document根节点，停止循环
                if (!endSpan) break;
            }
            
            // 如果找不到span元素，直接返回
            if (!startSpan || !endSpan) return;
            
            // 获取span元素的索引
            const startSpanIndex = Array.from(textContent.children).indexOf(startSpan);
            const endSpanIndex = Array.from(textContent.children).indexOf(endSpan);
            
            // 计算起始偏移和结束偏移
            const startOffset = startSpanIndex + range.startOffset;
            const endOffset = endSpanIndex + range.endOffset - 1;
            
            // 处理反向选择
            if (selection.anchorOffset > selection.focusOffset && startSpan === endSpan || startSpanIndex > endSpanIndex) {
                startIndex = Math.min(startOffset, endOffset);
                endIndex = Math.max(startOffset, endOffset);
            } else {
                startIndex = startOffset;
                endIndex = endOffset;
            }
            
            // 确保索引在有效范围内
            const fullTextLength = textContent.textContent.length;
            startIndex = Math.max(0, Math.min(startIndex, fullTextLength - 1));
            endIndex = Math.max(0, Math.min(endIndex, fullTextLength - 1));
            
            const newConfig = {
                start_index: startIndex,
                end_index: endIndex
            };
            
            // 检查是否按住Ctrl键
            if (event.ctrlKey || event.metaKey) {
                // Ctrl键多选模式
                // 检查是否已存在相同配置
                const isDuplicate = multiSelectConfigs.some(config => 
                    config.start_index === startIndex && config.end_index === endIndex
                );
                
                if (!isDuplicate) {
                    multiSelectConfigs.push(newConfig);
                    console.log('添加多选配置:', newConfig);
                }
            } else {
                // 普通选择模式，替换现有配置
                multiSelectConfigs = [newConfig];
                console.log('替换选择配置:', newConfig);
            }
            
            // 更新JSON输入框
            annotationInput.value = JSON.stringify(multiSelectConfigs, null, 2);
            console.log('当前多选配置:', multiSelectConfigs);
            
            // 应用自定义高亮
            applyCustomSelection();
            
            // 清除浏览器默认选中状态，只显示自定义高亮
            selection.removeAllRanges();
        }
    }
    
    // 重置多选配置
    function resetMultiSelect() {
        multiSelectConfigs = [];
        // 更新JSON输入框
        annotationInput.value = JSON.stringify(multiSelectConfigs, null, 2);
        // 移除所有自定义高亮
        document.querySelectorAll('.custom-selection').forEach(span => {
            span.classList.remove('custom-selection');
        });
    }
    
    // 点击其他区域时清除高亮
    function handleClickOutside(event) {
        // 检查点击的是否是textContent内部
        const isClickInTextContent = textContent.contains(event.target);
        // 检查点击的是否是标注相关按钮
        const isClickInButtons = 
            event.target === executeBtn || 
            event.target === clearBtn;
        // 检查点击的是否是JSON输入框
        const isClickInInput = event.target === annotationInput;
        // 检查点击的是否是右键菜单
        const isClickInContextMenu = event.target === contextMenu || contextMenu.contains(event.target);
        
        // 如果点击的是外部区域，清除高亮
        if (!isClickInTextContent && !isClickInButtons && !isClickInInput && !isClickInContextMenu) {
            resetMultiSelect();
        }
    }
    
    // 处理键盘快捷键
    function handleKeyDown(event) {
        // 检查是否是撤销/重做快捷键
        if (event.ctrlKey || event.metaKey) {
            const key = event.key.toLowerCase();
            if (key === 'z') {
                event.preventDefault();
                undo();
                return;
            } else if (key === 'y') {
                event.preventDefault();
                redo();
                return;
            }
        }
        
        // 只有当有选中的文本配置时才处理标注快捷键
        if (multiSelectConfigs.length === 0) return;
        
        // 获取按键
        const key = event.key.toLowerCase();
        
        // 根据按键执行不同的标注类型
    if (key === 'k') {
        // 框选快捷键
        selectedAnnotationType = 'box';
        executeAnnotation();
    } else if (key === 'd') {
        // 删除快捷键
        selectedAnnotationType = 'delete';
        executeAnnotation();
    } else if (key === 's') {
        // 换位快捷键
        // 检查选区数量是否为2
        if (multiSelectConfigs.length !== 2) {
            alert('换位功能需要选择两个区域');
            return;
        }
        selectedAnnotationType = 'switch';
        executeAnnotation();
    }
    }
    
    // 事件监听
    executeBtn.addEventListener('click', executeAnnotation);
    clearBtn.addEventListener('click', () => {
        clearAnnotations();
        currentAnnotations = [];
        resetMultiSelect(); // 同时清除多选配置
        // 保存到历史记录
        saveToHistory();
    });
    documentText.addEventListener('input', () => {
        updateDocument();
        resetMultiSelect(); // 文档内容变化时重置多选配置
        // 保存到历史记录
        saveToHistory();
    });
    
    // 添加文字选中监听
    textContent.addEventListener('mouseup', handleTextSelection);
    textContent.addEventListener('keyup', handleTextSelection); // 键盘选中后
    
    // 添加文本点击事件监听，显示光标
    textContent.addEventListener('click', handleTextClick);
    
    // 添加文本右键菜单事件监听（可选，用户仍可通过右键菜单选择）
    textContent.addEventListener('contextmenu', handleTextContextMenu);
    
    // 添加右键菜单点击事件监听
    contextMenu.addEventListener('click', handleMenuItemClick);
    
    // 添加键盘快捷键监听
    document.addEventListener('keydown', handleKeyDown);
    
    // 点击页面其他地方隐藏右键菜单
    document.addEventListener('click', (event) => {
        // 隐藏右键菜单
        if (event.target !== contextMenu && !contextMenu.contains(event.target)) {
            hideContextMenu();
        }
        // 检查点击的是否是外部区域，清除高亮
        const isClickInTextContent = textContent.contains(event.target);
        const isClickInButtons = event.target === executeBtn || event.target === clearBtn;
        const isClickInInput = event.target === annotationInput;
        const isClickInContextMenu = event.target === contextMenu || contextMenu.contains(event.target);
        
        if (!isClickInTextContent && !isClickInButtons && !isClickInInput && !isClickInContextMenu) {
            resetMultiSelect();
        }
    });
    
    // 窗口大小变化时重新初始化canvas并重新绘制标注
    window.addEventListener('resize', () => {
        setTimeout(() => {
            initCanvas();
            // 重新绘制所有标注
            redrawAnnotations();
        }, 100); // 延迟执行，确保DOM已更新
    });
    
    // 初始化
    renderTextWithSpans(); // 初始化时以span元素渲染文档内容
    initCanvas();
    resetMultiSelect(); // 初始化时重置多选配置
    saveToHistory(); // 保存初始状态到历史记录
    console.log('文档标注器已就绪');
    console.log('支持文字选中自动生成JSON配置');
    console.log('使用方法：在文档中选中文字，JSON配置会自动更新');
    console.log('支持Ctrl键多选：按住Ctrl键同时选择多个文本片段');
    console.log('快捷键支持：');
    console.log('  K键 - 框选标注');
    console.log('  D键 - 删除标注');
    console.log('  Ctrl+Z - 撤销操作');
    console.log('  Ctrl+Y - 重做操作');
    console.log('标注类型通过右键菜单选择，JSON中无需包含type字段');
    console.log('删除类型使用预定义的多阶贝塞尔曲线');
    console.log('多阶贝塞尔曲线：两段三次贝塞尔，形成两个顺时针封闭环');
    console.log('点击文字可显示闪烁光标');
    console.log('支持光标闪烁效果');
    console.log('支持无限撤销/重做（最大50步）');
});