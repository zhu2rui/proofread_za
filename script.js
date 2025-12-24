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
    // 直接使用window.currentAnnotations，确保所有函数访问的是同一个变量
    window.currentAnnotations = [];
    
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
        "bezierCurves": [ [ { "x": "269.00", "y": "380.68" }, { "x": "269.00", "y": "375.52" }, { "x": "268.10", "y": "376.75" }, { "x": "269.00", "y": "372.08" } ], [ { "x": "269.00", "y": "372.08" }, { "x": "269.90", "y": "367.42" }, { "x": "269.86", "y": "369.24" }, { "x": "272.00", "y": "365.13" } ], [ { "x": "272.00", "y": "365.13" }, { "x": "274.14", "y": "361.02" }, { "x": "273.87", "y": "362.60" }, { "x": "276.15", "y": "358.38" } ], [ { "x": "276.15", "y": "358.38" }, { "x": "278.43", "y": "354.16" }, { "x": "276.84", "y": "354.58" }, { "x": "279.62", "y": "351.07" } ], [ { "x": "279.62", "y": "351.07" }, { "x": "282.39", "y": "347.56" }, { "x": "282.49", "y": "349.70" }, { "x": "285.40", "y": "346.68" } ], [ { "x": "285.40", "y": "346.68" }, { "x": "288.32", "y": "343.66" }, { "x": "286.36", "y": "344.10" }, { "x": "289.34", "y": "340.99" } ], [ { "x": "289.34", "y": "340.99" }, { "x": "292.32", "y": "337.89" }, { "x": "291.72", "y": "339.26" }, { "x": "295.34", "y": "336.34" } ], [ { "x": "295.34", "y": "336.34" }, { "x": "298.96", "y": "333.42" }, { "x": "297.25", "y": "333.33" }, { "x": "301.43", "y": "331.26" } ], [ { "x": "301.43", "y": "331.26" }, { "x": "305.60", "y": "329.18" }, { "x": "304.42", "y": "330.19" }, { "x": "309.26", "y": "329.42" } ], [ { "x": "309.26", "y": "329.42" }, { "x": "314.10", "y": "328.64" }, { "x": "312.49", "y": "328.90" }, { "x": "317.56", "y": "328.68" } ], [ { "x": "317.56", "y": "328.68" }, { "x": "322.63", "y": "328.46" }, { "x": "321.00", "y": "328.68" }, { "x": "326.16", "y": "328.68" } ], [ { "x": "326.16", "y": "328.68" }, { "x": "331.32", "y": "328.68" }, { "x": "330.90", "y": "327.20" }, { "x": "334.76", "y": "328.68" } ], [ { "x": "334.76", "y": "328.68" }, { "x": "338.61", "y": "330.16" }, { "x": "337.13", "y": "330.16" }, { "x": "339.00", "y": "333.62" } ], [ { "x": "339.00", "y": "333.62" }, { "x": "340.87", "y": "337.08" }, { "x": "341.04", "y": "336.30" }, { "x": "341.00", "y": "340.22" } ], [ { "x": "341.00", "y": "340.22" }, { "x": "342.13", "y": "343.98" }, { "x": "340.69", "y": "343.98" }, { "x": "338.86", "y": "346.68" } ], [ { "x": "338.86", "y": "346.68" }, { "x": "336.99", "y": "348.38" }, { "x": "336.74", "y": "347.00" }, { "x": "330.50", "y": "347.68" } ], [ { "x": "330.50", "y": "347.68" }, { "x": "324.12", "y": "348.37", "x": "324.00", "y": "347.00" }, { "x": "321.90", "y": "347.68" } ], [ { "x": "321.90", "y": "347.68" }, { "x": "320.16", "y": "346.83", "x": "320.47", "y": "348.66" }, { "x": "318.00", "y": "341.81" } ], [ { "x": "318.00", "y": "341.81" }, { "x": "315.93", "y": "337.11", "x": "317.36", "y": "336.54", "x": "317.00", "y": "334.21" } ], [ { "x": "317.00", "y": "334.21" }, { "x": "317.74", "y": "330.35", "x": "316.86", "y": "331.02", "x": "319.00", "y": "327.02" } ], [ { "x": "319.00", "y": "327.02" }, { "x": "320.34", "y": "323.73", "x": "320.41", "y": "325.22", "x": "322.02", "y": "320.68" } ], [ { "x": "322.02", "y": "320.68" }, { "x": "324.41", "y": "317.72", "x": "324.10", "y": "319.00", "x": "327.00", "y": "317.06" } ], [ { "x": "327.00", "y": "317.06" }, { "x": "330.09", "y": "315.14", "x": "328.82", "y": "315.07", "x": "333.69", "y": "312.99" } ], [ { "x": "333.69", "y": "312.99" }, { "x": "337.37", "y": "310.93", "x": "336.33", "y": "311.12", "x": "340.94", "y": "309.74" } ], [ { "x": "340.94", "y": "309.74" }, { "x": "345.55", "y": "308.56", "x": "343.87", "y": "308.68", "x": "348.10", "y": "307.68" } ], [ { "x": "348.10", "y": "307.68" }, { "x": "352.32", "y": "306.68", "x": "351.50", "y": "308.00", "x": "355.70", "y": "306.68" } ], [ { "x": "355.70", "y": "306.68" }, { "x": "359.90", "y": "305.68", "x": "359.30", "y": "307.00", "x": "363.30", "y": "305.68" } ], [ { "x": "363.30", "y": "305.68" }, { "x": "367.48", "y": "304.69", "x": "367.00", "y": "306.00", "x": "371.90", "y": "305.68" } ], [ { "x": "371.90", "y": "305.68" }, { "x": "376.08", "y": "304.67", "x": "375.70", "y": "306.00", "x": "380.50", "y": "305.68" } ], [ { "x": "380.50", "y": "305.68" }, { "x": "384.68", "y": "304.69", "x": "384.30", "y": "306.00", "x": "389.10", "y": "305.68" } ], [ { "x": "389.10", "y": "305.68" }, { "x": "391.86", "y": "307.85", "x": "391.13", "y": "306.50", "x": "393.63", "y": "309.99" } ], [ { "x": "393.63", "y": "309.99" }, { "x": "395.89", "y": "313.24", "x": "394.94", "y": "313.00", "x": "396.00", "y": "317.51" } ], [ { "x": "396.00", "y": "317.51" }, { "x": "393.30", "y": "319.34", "x": "394.21", "y": "319.00", "x": "390.57", "y": "320.68" } ], [ { "x": "390.57", "y": "320.68" }, { "x": "386.95", "y": "321.39", "x": "386.90", "y": "320.00", "x": "382.97", "y": "321.68" } ], [ { "x": "382.97", "y": "321.68" }, { "x": "379.03", "y": "322.39", "x": "379.00", "y": "320.00", "x": "374.37", "y": "321.68" } ], [ { "x": "374.37", "y": "321.68" }, { "x": "372.00", "y": "320.06", "x": "372.32", "y": "321.68", "x": "369.00", "y": "317.69" } ], [ { "x": "369.00", "y": "317.69" }, { "x": "366.70", "y": "315.47", "x": "368.10", "y": "315.54", "x": "367.00", "y": "310.51" } ], [ { "x": "367.00", "y": "310.51" }, { "x": "367.81", "y": "307.01", "x": "366.83", "y": "308.16", "x": "368.35", "y": "302.99" } ], [ { "x": "368.35", "y": "302.99" }, { "x": "370.42", "y": "299.42", "x": "370.01", "y": "300.75", "x": "372.72", "y": "297.68" } ], [ { "x": "372.72", "y": "297.68" }, { "x": "375.19", "y": "295.20", "x": "374.50", "y": "296.38", "x": "377.93", "y": "293.75" } ], [ { "x": "377.93", "y": "293.75" }, { "x": "380.69", "y": "291.73", "x": "379.76", "y": "292.75", "x": "383.45", "y": "290.45" } ], [ { "x": "383.45", "y": "290.45" }, { "x": "386.91", "y": "288.67", "x": "385.71", "y": "289.50", "x": "390.46", "y": "287.68" } ], [ { "x": "390.46", "y": "287.68" }, { "x": "394.32", "y": "286.22", "x": "393.30", "y": "287.00", "x": "398.40", "y": "285.68" } ], [ { "x": "398.40", "y": "285.68" }, { "x": "402.50", "y": "284.68", "x": "401.70", "y": "286.00", "x": "406.00", "y": "284.68" } ], [ { "x": "406.00", "y": "284.68" }, { "x": "409.79", "y": "295.23", "x": "408.83", "y": "294.22", "x": "413.60", "y": "305.68" } ], [ { "x": "413.60", "y": "305.68" }, { "x": "417.83", "y": "307.11", "x": "417.30", "y": "305.00", "x": "421.00", "y": "305.68" } ], [ { "x": "421.00", "y": "305.68" }, { "x": "425.88", "y": "293.78", "x": "424.43", "y": "292.36", "x": "428.80", "y": "281.68" } ], [ { "x": "428.80", "y": "281.68" }, { "x": "432.76", "y": "281.17", "x": "432.30", "y": "282.00", "x": "436.40", "y": "280.68" } ], [ { "x": "436.40", "y": "280.68" }, { "x": "440.71", "y": "280.19", "x": "440.30", "y": "281.00", "x": "445.00", "y": "280.68" } ] ], 
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
        // 获取换位菜单项
        const switchMenuItem = contextMenu.querySelector('[data-action="switch"]');
        
        // 检查当前选择是否符合换位条件
        let canSwitch = false;
        
        if (multiSelectConfigs.length === 1) {
            // 单段内容，检查是否只有两个字符
            const config = multiSelectConfigs[0];
            const length = config.end_index - config.start_index + 1;
            if (length === 2) {
                canSwitch = true;
            }
        } else if (multiSelectConfigs.length === 2) {
            // 两段内容，检查是否在两行内
            if (isWithinTwoLines(multiSelectConfigs)) {
                canSwitch = true;
            }
        }
        
        // 更新换位菜单项的状态
        if (switchMenuItem) {
            if (canSwitch) {
                switchMenuItem.style.pointerEvents = 'auto';
                switchMenuItem.style.opacity = '1';
                switchMenuItem.style.cursor = 'pointer';
            } else {
                switchMenuItem.style.pointerEvents = 'none';
                switchMenuItem.style.opacity = '0.5';
                switchMenuItem.style.cursor = 'not-allowed';
            }
        }
        
        contextMenu.style.display = 'block';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
    }
    
    // 隐藏右键菜单
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }
    
    // 获取当前选中的标注类型
    window.getCurrentAnnotationType = function() {
        return selectedAnnotationType;
    }
    
    // 处理右键菜单点击
    function handleMenuItemClick(event) {
        const action = event.target.dataset.action;
        if (action) {
            if (action === 'clear') {
                // 清除标注操作
                // 遍历所有选中的配置
                let cleared = false;
                multiSelectConfigs.forEach(config => {
                    // 清除与选中范围重叠的标注
                    if (typeof clearAnnotationsInRange === 'function') {
                        if (clearAnnotationsInRange(config.start_index, config.end_index)) {
                            cleared = true;
                        }
                    }
                });
                
                if (cleared) {
                    // 保存到历史记录
                    saveToHistory();
                    // 重置多选配置
                    resetMultiSelect();
                }
            } else {
                // 普通标注操作
                selectedAnnotationType = action;
                // 执行标注操作
                executeAnnotation();
            }
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
        window.currentAnnotations = [];
        
        // 更新输出文本
        updateOutputText();
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
        if (startIndex < 0 || endIndex >= text.length) {
            throw new Error(`无效的文本范围: ${startIndex} - ${endIndex}`);
        }
        
        // 获取每个字符的位置信息
        const charRects = [];
        
        // 获取document-layer和textContent的位置信息，作为参考点
        const layerRect = documentLayer.getBoundingClientRect();
        const textContainerRect = textContent.getBoundingClientRect();
        
        // 遍历每个字符，获取位置信息
        // 因为每个span只包含一个字符，所以直接使用索引访问
        for (let i = startIndex; i <= endIndex; i++) {
            const charNode = textContent.children[i];
            if (!charNode) continue;
            
            const charRect = charNode.getBoundingClientRect();
            
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
        if (window.currentAnnotations.length <= 1) return;
        
        // 按start_index排序，方便合并相邻区间
        const sortedAnnotations = [...window.currentAnnotations].sort((a, b) => a.start_index - b.start_index);
        
        const mergedAnnotations = [];
        let currentMerge = sortedAnnotations[0];
        
        for (let i = 1; i < sortedAnnotations.length; i++) {
            const nextAnn = sortedAnnotations[i];
            
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
        // 直接修改全局currentAnnotations
        window.currentAnnotations = mergedAnnotations;
        console.log('合并后标注:', window.currentAnnotations);
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
    window.executeAnnotation = function() {
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
            
            // 获取当前标注类型
            const annotationType = getCurrentAnnotationType();
            
            // 验证所有配置
            configArray.forEach(config => validateAnnotationConfig(config));
            
            // 检查标注类型是否为switch，并验证条件
            if (annotationType === 'switch') {
                let isValid = false;
                
                if (configArray.length === 1) {
                    // 单段内容，检查是否只有两个字符
                    const config = configArray[0];
                    const length = config.end_index - config.start_index + 1;
                    if (length === 2) {
                        isValid = true;
                    } else {
                        throw new Error('单段内容换位需要选择两个字符');
                    }
                } else if (configArray.length === 2) {
                    // 两段内容，检查是否在两行内
                    if (isWithinTwoLines(configArray)) {
                        isValid = true;
                    } else {
                        throw new Error('换位标注最多支持两行内进行');
                    }
                } else {
                    throw new Error('换位功能需要选择一个两个字符的区域或两个区域');
                }
                
                if (!isValid) {
                    return;
                }
            }
            
            // 检查并清除与任何新标注重叠的旧标注
            // 收集所有新标注的范围
            const newRanges = configArray.map(config => ({
                start_index: config.start_index,
                end_index: config.end_index
            }));
            
            // 过滤掉与任何新标注重叠的旧标注
            const filteredAnnotations = window.currentAnnotations.filter(oldAnn => {
                // 检查旧标注是否与任何新标注重叠
                const isOverlapping = newRanges.some(newRange => {
                    return isRangesOverlap(
                        { start_index: oldAnn.start_index, end_index: oldAnn.end_index },
                        newRange
                    );
                });
                return !isOverlapping;
            });
            
            // 直接修改全局currentAnnotations
            window.currentAnnotations = filteredAnnotations;
            
            // 处理单段两个字符的情况，生成两个相邻的标注
            let fullConfigs = [];
            if (annotationType === 'switch' && configArray.length === 1) {
                const config = configArray[0];
                // 将单段两个字符拆分为两个相邻的标注
                const config1 = {
                    ...config,
                    type: annotationType,
                    end_index: config.start_index
                };
                const config2 = {
                    ...config,
                    type: annotationType,
                    start_index: config.start_index + 1
                };
                fullConfigs = [config1, config2];
            } else {
                // 普通情况，直接添加所有新标注配置
                fullConfigs = configArray.map(config => ({
                    ...config,
                    type: annotationType
                }));
            }
            
            // 直接修改全局currentAnnotations
            window.currentAnnotations.push(...fullConfigs);
            
            // 合并相邻标注
            mergeAdjacentAnnotations();
            
            console.log('添加新标注:', fullConfigs);
            console.log('当前所有标注:', window.currentAnnotations);
            
            // 重新绘制所有标注
            clearAnnotations();
            redrawAnnotations();
            
            // 重置多选配置，允许用户开始新的选择
            resetMultiSelect();
            
            // 保存到历史记录
            saveToHistory();
            
        } catch (error) {
            alert(`标注失败: ${error.message}`);
            console.error('错误:', error);
        }
    }
    
    // 检查选择的文本是否在两行内
    function isWithinTwoLines(configs) {
        // 检查所有选择的文本是否在两行内
        const textLines = documentText.value.split('\n');
        let startLine = -1;
        let endLine = -1;
        
        configs.forEach(config => {
            let currentPos = 0;
            
            for (let i = 0; i < textLines.length; i++) {
                const lineLength = textLines[i].length + 1; // 包含换行符
                
                if (currentPos + lineLength > config.start_index) {
                    // 找到起始行
                    if (startLine === -1 || i < startLine) {
                        startLine = i;
                    }
                    // 更新结束行
                    if (i > endLine) {
                        endLine = i;
                    }
                    break;
                }
                
                currentPos += lineLength;
            }
        });
        
        // 计算行数差
        const lineDiff = endLine - startLine;
        return lineDiff <= 1; // 最多两行内
    }
    
    // 保存当前状态到历史记录
    function saveToHistory() {
        // 删除当前索引之后的历史记录
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        
        // 保存当前标注状态
        const state = {
            annotations: JSON.parse(JSON.stringify(window.currentAnnotations)),
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
        console.log('保存的标注状态:', state.annotations);
    }
    
    // 撤销操作
    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            // 直接修改全局currentAnnotations
            window.currentAnnotations = JSON.parse(JSON.stringify(history[historyIndex].annotations));
            clearAnnotations();
            redrawAnnotations();
            console.log('撤销操作:', historyIndex);
            console.log('撤销后的标注:', window.currentAnnotations);
        }
    }
    
    // 重做操作
    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            // 直接修改全局currentAnnotations
            window.currentAnnotations = JSON.parse(JSON.stringify(history[historyIndex].annotations));
            clearAnnotations();
            redrawAnnotations();
            console.log('重做操作:', historyIndex);
            console.log('重做后的标注:', window.currentAnnotations);
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
    
    // 更新输出文本
    function updateOutputText() {
        let outputText = documentText.value;
        
        // 如果没有标注，直接输出原文本
        if (window.currentAnnotations.length === 0) {
            document.getElementById('output-content').textContent = outputText;
            return;
        }
        
        // 创建所有标注的副本，以便在处理过程中更新索引
        // 注意：这里需要深拷贝，避免修改原标注
        const annotations = JSON.parse(JSON.stringify(window.currentAnnotations));
        
        // 先将所有标注按start_index从大到小排序，以便从后往前处理
        // 这样前面的修改不会影响后面标注的索引
        annotations.sort((a, b) => b.start_index - a.start_index);
        
        // 处理所有删除标注
        for (let i = 0; i < annotations.length; i++) {
            const annotation = annotations[i];
            
            if (annotation.type === 'delete') {
                // 删除指定范围的文本
                outputText = outputText.substring(0, annotation.start_index) + 
                            outputText.substring(annotation.end_index + 1);
                
                // 更新前面所有标注的索引（因为它们的start_index <= 当前标注的start_index）
                // 所以需要从i-1往前更新
                for (let j = 0; j < i; j++) {
                    const prevAnnotation = annotations[j];
                    const deleteLength = annotation.end_index - annotation.start_index + 1;
                    
                    // 如果前面的标注在当前删除范围的前面，不需要调整
                    if (prevAnnotation.end_index < annotation.start_index) {
                        continue;
                    }
                    
                    // 如果前面的标注完全包含在当前删除范围内，标记为无效
                    if (prevAnnotation.start_index >= annotation.start_index && 
                        prevAnnotation.end_index <= annotation.end_index) {
                        prevAnnotation.valid = false;
                        continue;
                    }
                    
                    // 如果前面的标注部分包含在当前删除范围内，调整其索引
                    if (prevAnnotation.start_index < annotation.start_index && 
                        prevAnnotation.end_index >= annotation.start_index) {
                        // 标注起始位置在删除范围前，结束位置在删除范围内或之后
                        prevAnnotation.end_index -= deleteLength;
                    } else if (prevAnnotation.start_index >= annotation.start_index) {
                        // 标注起始位置在删除范围内或之后
                        prevAnnotation.start_index -= deleteLength;
                        prevAnnotation.end_index -= deleteLength;
                    }
                }
            }
        }
        
        // 过滤掉无效的标注
        const validAnnotations = annotations.filter(a => a.valid !== false);
        
        // 重新按start_index从大到小排序，因为之前的删除操作可能改变了索引
        validAnnotations.sort((a, b) => b.start_index - a.start_index);
        
        // 处理所有交换标注对
        // 首先收集所有switch标注
        const switchAnnotations = validAnnotations.filter(a => a.type === 'switch');
        
        // 将switch标注按每两个一组处理
        for (let i = 0; i < switchAnnotations.length; i += 2) {
            if (i + 1 >= switchAnnotations.length) break;
            
            let config1 = switchAnnotations[i];
            let config2 = switchAnnotations[i + 1];
            
            // 确保config1的start_index <= config2的start_index
            if (config1.start_index > config2.start_index) {
                [config1, config2] = [config2, config1];
            }
            
            // 检查这对交换标注是否有效
            if (config1.start_index < 0 || 
                config1.end_index >= outputText.length || 
                config2.start_index < 0 || 
                config2.end_index >= outputText.length || 
                config1.end_index > config2.start_index) {
                continue; // 跳过无效的交换标注
            }
            
            // 检查是否是两个相邻的单字符标注（单段两个字符的情况）
            if (config1.start_index === config1.end_index && 
                config2.start_index === config2.end_index && 
                config1.end_index + 1 === config2.start_index) {
                // 单段两个字符的情况，直接交换这两个字符
                const char1 = outputText.charAt(config1.start_index);
                const char2 = outputText.charAt(config2.start_index);
                
                // 构建新文本，交换这两个字符
                outputText = outputText.substring(0, config1.start_index) + 
                           char2 + char1 + 
                           outputText.substring(config2.start_index + 1);
                
                // 更新前面所有标注的索引
                const switchIndex = config1.start_index;
                for (let j = 0; j < i; j++) {
                    const prevAnnotation = validAnnotations[j];
                    
                    // 如果前面的标注在交换位置前，不需要调整
                    if (prevAnnotation.end_index < switchIndex) {
                        continue;
                    }
                    
                    // 如果前面的标注在交换位置后，不需要调整
                    if (prevAnnotation.start_index > switchIndex + 1) {
                        continue;
                    }
                    
                    // 处理跨交换位置的标注
                    // 由于是单字符交换，这里的情况比较简单
                    // 只有标注正好覆盖交换位置时需要调整
                    // 但这种情况应该不会发生，因为switch标注是成对的
                    // 所以这里可以省略复杂的调整逻辑
                }
            } else {
                // 正常的两段交换情况
                // 获取两个区域的文本
                const textA = outputText.substring(config1.start_index, config1.end_index + 1);
                const textC = outputText.substring(config2.start_index, config2.end_index + 1);
                
                // 计算交换后对其他标注索引的影响
                const lengthA = textA.length;
                const lengthC = textC.length;
                const deltaLength = lengthC - lengthA;
                
                // 构建新文本：A之前的部分 + C文本 + A和C之间的部分 + A文本 + C之后的部分
                outputText = outputText.substring(0, config1.start_index) + 
                            textC + 
                            outputText.substring(config1.end_index + 1, config2.start_index) + 
                            textA + 
                            outputText.substring(config2.end_index + 1);
                
                // 更新前面所有标注的索引
                for (let j = 0; j < i; j++) {
                    const prevAnnotation = validAnnotations[j];
                    
                    // 如果前面的标注在A区域前，不需要调整
                    if (prevAnnotation.end_index < config1.start_index) {
                        continue;
                    }
                    
                    // 如果前面的标注在C区域后，调整其索引
                    if (prevAnnotation.start_index > config2.end_index) {
                        prevAnnotation.start_index += deltaLength;
                        prevAnnotation.end_index += deltaLength;
                        continue;
                    }
                    
                    // 如果前面的标注完全包含在A区域或C区域内，不需要调整
                    if ((prevAnnotation.start_index >= config1.start_index && 
                         prevAnnotation.end_index <= config1.end_index) ||
                        (prevAnnotation.start_index >= config2.start_index && 
                         prevAnnotation.end_index <= config2.end_index)) {
                        continue;
                    }
                    
                    // 如果前面的标注部分包含在A区域或C区域内，需要调整
                    // 这种情况比较复杂，暂时简化处理
                    // 标记为无效，避免后续处理出错
                    prevAnnotation.valid = false;
                }
            }
        }
        
        // 更新输出文本
        document.getElementById('output-content').textContent = outputText;
    }
    
    // 重新绘制所有标注
    window.redrawAnnotations = function() {
        // 立即清除画布
        clearAnnotations();
        
        // 如果没有标注，更新输出文本并返回
        if (window.currentAnnotations.length === 0) {
            // 更新输出文本
            updateOutputText();
            return;
        }
        
        // 按类型分组处理标注
        const switchConfigs = window.currentAnnotations.filter(config => config.type === 'switch');
        const otherConfigs = window.currentAnnotations.filter(config => config.type !== 'switch');
        
        // 处理非switch类型标注
        otherConfigs.forEach(config => {
            try {
                const position = getTextRangePosition(config.start_index, config.end_index);
                
                // 根据类型绘制不同的标注
                switch (config.type) {
                    case 'box':
                        window.drawBox(position, ctx);
                        break;
                    case 'delete':
                        // 删除类型：先绘制框选，再绘制删除标记
                        window.drawBox(position, ctx);
                        window.drawDeleteMark(position, ctx);
                        break;
                    default:
                        window.drawBox(position, ctx);
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
                    window.drawSwitch([posA, posC], ctx, { 
                        configA: sortedConfigs[0],
                        configC: sortedConfigs[1]
                    });
                } catch (error) {
                    console.error('重新绘制换位标注失败:', error);
                }
            }
        }
        
        // 立即更新输出文本
        updateOutputText();
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
            // 因为每个span只包含一个字符，所以直接使用span索引加上span内偏移
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
        
        // 获取按键
        const key = event.key.toLowerCase();
        let isValid = false;
        
        // 只有当有选中的文本配置或者是清除快捷键时才处理
        // c键清除快捷键不受选中配置限制
        if (multiSelectConfigs.length === 0 && key !== 'c') return;
        
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
        // 检查选区是否有效
        if (multiSelectConfigs.length === 1) {
            // 单段内容，检查是否只有两个字符
            const config = multiSelectConfigs[0];
            const length = config.end_index - config.start_index + 1;
            if (length === 2) {
                isValid = true;
            } else {
                alert('单段内容换位需要选择两个字符');
                return;
            }
        } else if (multiSelectConfigs.length === 2) {
            // 两段内容，检查是否在两行内
            if (isWithinTwoLines(multiSelectConfigs)) {
                isValid = true;
            } else {
                alert('换位标注最多支持两行内进行');
                return;
            }
        } else {
            alert('换位功能需要选择一个两个字符的区域或两个区域');
            return;
        }
        
        if (isValid) {
            selectedAnnotationType = 'switch';
            executeAnnotation();
        }
    } else if (key === 'c') {
        // 清除快捷键
        console.log('=== 开始处理清除快捷键 (C) ===');
        console.log('当前multiSelectConfigs:', multiSelectConfigs);
        console.log('清除前的currentAnnotations:', window.currentAnnotations);
        
        let cleared = false;
        
        // 保存清除前的标注数量
        const initialCount = window.currentAnnotations.length;
        console.log('清除前的标注数量:', initialCount);
        
        if (multiSelectConfigs.length > 0) {
            // 有选中文字的情况：清除与选中范围重叠的标注
            // 遍历每个选中的配置，分别清除每个配置范围内的标注
            multiSelectConfigs.forEach((config, index) => {
                console.log(`\n处理第${index + 1}个配置:`, config);
                console.log(`清除范围: start_index=${config.start_index}, end_index=${config.end_index}`);
                
                // 清除与当前配置范围重叠的标注
                if (typeof clearAnnotationsInRange === 'function') {
                    console.log('调用clearAnnotationsInRange函数');
                    const result = clearAnnotationsInRange(config.start_index, config.end_index);
                    console.log('clearAnnotationsInRange返回结果:', result);
                    if (result) {
                        cleared = true;
                    }
                } else {
                    console.log('ERROR: clearAnnotationsInRange函数未定义');
                }
            });
        } else {
            // 无选中文字的情况：检查光标位置是否在标注范围内
            console.log('\n=== 无选中文字情况处理开始 ===');
            
            // 获取当前光标位置
            const selection = window.getSelection();
            console.log('当前选择对象:', selection);
            
            if (selection && selection.isCollapsed) {
                console.log('光标是折叠状态（无选中文字）');
                
                // 光标位置有效
                const cursorPosition = selection.anchorOffset;
                const anchorNode = selection.anchorNode;
                const focusNode = selection.focusNode;
                
                console.log('光标偏移量:', cursorPosition);
                console.log('锚点节点:', anchorNode, '节点类型:', anchorNode.nodeType);
                console.log('焦点节点:', focusNode, '节点类型:', focusNode.nodeType);
                console.log('锚点节点内容:', anchorNode.textContent);
                console.log('焦点节点内容:', focusNode.textContent);
                
                // 确保光标在textContent内部
                if (textContent.contains(anchorNode)) {
                    console.log('光标在textContent内部');
                    
                    // 找到光标所在的span元素或其相邻的span元素
                    let currentSpan = anchorNode;
                    let nextSpan = null;
                    
                    // 处理光标在文本节点内部的情况
                    if (currentSpan.nodeType === 3) {
                        // 文本节点
                        console.log('光标在文本节点内，父元素:', currentSpan.parentNode, '父元素标签:', currentSpan.parentNode.tagName);
                        
                        // 检查是否是span的直接文本节点
                        if (currentSpan.parentNode.tagName === 'SPAN') {
                            currentSpan = currentSpan.parentNode;
                            console.log('找到包含光标文本的span元素:', currentSpan);
                            console.log('span内容:', currentSpan.textContent);
                            console.log('span的data-index:', currentSpan.dataset.index);
                            
                            // 检查偏移量是否等于文本长度（即光标在span末尾）
                            if (cursorPosition === currentSpan.textContent.length) {
                                console.log('光标在span末尾，获取下一个span');
                                // 光标在span末尾，获取下一个span
                                nextSpan = currentSpan.nextElementSibling;
                                console.log('下一个span:', nextSpan);
                                if (nextSpan) {
                                    console.log('下一个span的data-index:', nextSpan.dataset.index);
                                }
                            }
                        } else {
                            console.log('文本节点的父元素不是span，父元素是:', currentSpan.parentNode);
                        }
                    } else {
                        // 不是文本节点，查找最近的span
                        console.log('光标不在文本节点内，查找最近的span');
                        while (currentSpan && (currentSpan.nodeType !== 1 || currentSpan.tagName !== 'SPAN')) {
                            console.log('当前节点:', currentSpan, '节点类型:', currentSpan.nodeType, '标签:', currentSpan.tagName);
                            currentSpan = currentSpan.parentNode;
                            if (!currentSpan) {
                                console.log('未找到包含光标的span');
                                break;
                            }
                        }
                        
                        if (currentSpan) {
                            console.log('找到包含光标的span:', currentSpan);
                            console.log('span的data-index:', currentSpan.dataset.index);
                        }
                    }
                    
                    // 需要检查的索引列表
                    const checkIndices = [];
                    
                    if (currentSpan) {
                        // 获取当前span的索引
                        const currentIndex = parseInt(currentSpan.dataset.index, 10);
                        checkIndices.push(currentIndex);
                        console.log('添加当前span索引到检查列表:', currentIndex);
                        
                        // 如果有下一个span，也检查下一个字符的索引
                        if (nextSpan) {
                            const nextIndex = parseInt(nextSpan.dataset.index, 10);
                            checkIndices.push(nextIndex);
                            console.log('添加下一个span索引到检查列表:', nextIndex);
                        }
                        
                        // 也检查上一个span（如果有）
                        const prevSpan = currentSpan.previousElementSibling;
                        if (prevSpan) {
                            const prevIndex = parseInt(prevSpan.dataset.index, 10);
                            checkIndices.push(prevIndex);
                            console.log('添加上一个span索引到检查列表:', prevIndex);
                        }
                    }
                    
                    // 去重检查索引
                    const uniqueCheckIndices = [...new Set(checkIndices)];
                    console.log('去重后的检查索引列表:', uniqueCheckIndices);
                    
                    // 如果没有找到currentSpan，尝试查找光标位置附近的span
                    if (uniqueCheckIndices.length === 0) {
                        console.log('未找到明确的span，尝试检查所有标注');
                        
                        // 遍历所有标注，检查是否有标注包含光标可能在的位置
                        for (let i = window.currentAnnotations.length - 1; i >= 0; i--) {
                            const annotation = window.currentAnnotations[i];
                            console.log('检查标注:', annotation);
                            checkIndices.push(annotation.start_index, annotation.end_index);
                        }
                        
                        // 去重
                        const uniqueIndices = [...new Set(checkIndices)];
                        checkIndices.length = 0;
                        checkIndices.push(...uniqueIndices);
                        console.log('从标注中提取的索引列表:', checkIndices);
                    }
                    
                    // 遍历所有需要检查的索引
                    console.log('\n=== 开始检查索引与标注的匹配 ===');
                    for (const index of uniqueCheckIndices) {
                        console.log('\n检查索引:', index);
                        
                        // 遍历所有标注，检查当前索引是否在标注范围内
                        for (let i = window.currentAnnotations.length - 1; i >= 0; i--) {
                            const annotation = window.currentAnnotations[i];
                            console.log('检查标注:', annotation);
                            console.log('标注范围:', annotation.start_index, '-', annotation.end_index);
                            
                            // 检查索引是否在标注范围内
                            const isInRange = index >= annotation.start_index && index <= annotation.end_index;
                            console.log('索引', index, '是否在标注范围内:', isInRange);
                            
                            if (isInRange) {
                                console.log('✓ 索引', index, '在标注', annotation, '范围内，准备删除');
                                
                                // 删除该标注
                                window.currentAnnotations.splice(i, 1);
                                cleared = true;
                                console.log('✓ 标注已删除，当前标注数量:', window.currentAnnotations.length);
                                
                                // 特殊处理switch类型标注，确保同时删除配对的标注
                                if (annotation.type === 'switch') {
                                    console.log('✓ 检测到switch类型标注，查找配对标注');
                                    // 遍历剩余标注，查找配对的switch标注
                                    for (let j = window.currentAnnotations.length - 1; j >= 0; j--) {
                                        const otherAnnotation = window.currentAnnotations[j];
                                        if (otherAnnotation.type === 'switch') {
                                            // switch标注是成对出现的，检查是否是配对关系
                                            const isPair = 
                                                // 同一位置的switch标注（可能是重复标注）
                                                (otherAnnotation.start_index === annotation.start_index && 
                                                 otherAnnotation.end_index === annotation.end_index) ||
                                                // 相邻字符的switch标注（start和end互换）
                                                (otherAnnotation.start_index === annotation.end_index && 
                                                 otherAnnotation.end_index === annotation.start_index);
                                            
                                            if (isPair) {
                                                console.log('✓ 找到配对标注，删除:', otherAnnotation);
                                                window.currentAnnotations.splice(j, 1);
                                                console.log('✓ 配对标注已删除，当前标注数量:', window.currentAnnotations.length);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    console.log('光标不在textContent内部，当前textContent:', textContent);
                }
            } else {
                console.log('光标不是折叠状态（有选中文字），multiSelectConfigs未捕获到选择');
            }
            
            console.log('=== 无选中文字情况处理结束 ===');
        }
        
        // 如果有标注被删除，重新绘制标注
        if (cleared) {
            console.log('有标注被删除，重新绘制标注');
            clearAnnotations();
            redrawAnnotations();
        }
        
        console.log('\n=== 清除操作完成 ===');
        console.log('清除后的currentAnnotations:', window.currentAnnotations);
        console.log('清除后的标注数量:', window.currentAnnotations.length);
        console.log('标注数量是否变化:', window.currentAnnotations.length !== initialCount);
        console.log('cleared标志:', cleared);
        
        // 如果标注数量发生变化，保存到历史记录并重置多选配置
        if (cleared || initialCount !== window.currentAnnotations.length) {
            console.log('保存到历史记录并重置多选配置');
            // 保存到历史记录
            saveToHistory();
            // 重置多选配置
            resetMultiSelect();
        } else {
            console.log('标注数量未变化，不保存历史记录');
        }
        console.log('=== 清除快捷键处理结束 ===');
    }
    }
    
    // 事件监听
    executeBtn.addEventListener('click', executeAnnotation);
    clearBtn.addEventListener('click', () => {
        clearAnnotations();
        // 直接修改全局currentAnnotations
        window.currentAnnotations = [];
        resetMultiSelect(); // 同时清除多选配置
        // 更新输出文本
        updateOutputText();
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
    console.log('  S键 - 换位标注');
    console.log('  C键 - 清除标注');
    console.log('  Ctrl+Z - 撤销操作');
    console.log('  Ctrl+Y - 重做操作');
});