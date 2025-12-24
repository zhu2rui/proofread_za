// 清除指定范围内的标注
function clearAnnotationsInRange(startIndex, endIndex) {
    console.log('清除标注范围:', startIndex, '-', endIndex);
    console.log('清除前的标注:', window.currentAnnotations);
    
    // 检查window对象是否存在
    if (typeof window === 'undefined') {
        console.error('清除标注功能需要在浏览器环境中运行');
        return false;
    }
    
    // 检查是否有全局currentAnnotations
    if (!window.currentAnnotations) {
        console.error('当前没有标注可以清除');
        return false;
    }
    
    // 保存初始标注数量
    const initialCount = window.currentAnnotations.length;
    
    // 直接过滤掉与指定范围重叠的标注
    // 只保留不与指定范围重叠的标注
    const updatedAnnotations = window.currentAnnotations.filter(annotation => {
        // 检查标注是否与指定范围不重叠
        // 如果标注的结束索引 < 范围的开始索引，或者标注的开始索引 > 范围的结束索引
        // 则标注与范围不重叠
        const isNotOverlap = annotation.end_index < startIndex || annotation.start_index > endIndex;
        console.log('检查标注:', annotation, '是否与范围重叠:', !isNotOverlap);
        return isNotOverlap;
    });



    
    // 检查标注数量是否变化
    const isChanged = updatedAnnotations.length !== initialCount;
    console.log('清除后的标注:', updatedAnnotations);
    console.log('标注数量是否变化:', isChanged);
    
    // 如果标注数量没有变化，直接返回
    if (!isChanged) {
        console.log('没有重叠标注，直接返回');
        return false;
    }
    
    // 更新全局currentAnnotations
    window.currentAnnotations = updatedAnnotations;
    
    // 立即清除画布
    const canvas = document.getElementById('annotation-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            console.log('清除画布');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    // 立即更新输出文本
    if (typeof window.updateOutputText === 'function') {
        console.log('更新输出文本');
        window.updateOutputText();
    }
    
    // 重新绘制所有标注
    console.log('检查redrawAnnotations函数是否定义:', typeof window.redrawAnnotations);
    if (typeof window.redrawAnnotations === 'function') {
        console.log('调用redrawAnnotations函数重新绘制所有标注');
        window.redrawAnnotations();
    } else {
        console.log('ERROR: redrawAnnotations函数未定义，尝试手动重新绘制');
        // 手动重新绘制所有标注
        // 1. 先清除画布
        clearAnnotations();
        // 2. 再绘制所有标注
        window.currentAnnotations.forEach(annotation => {
            // 这里可以根据标注类型重新绘制，但需要更多的上下文信息
            // 所以我们建议在script.js中确保window.redrawAnnotations函数被正确定义
        });
    }
    
    return true;
}