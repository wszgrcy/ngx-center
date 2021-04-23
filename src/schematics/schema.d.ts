/**
 * 主项目初始化
 */
declare interface MainInitSchematics {
    /**
     * 链接库(lib)名称
     */
    dllName?: string;
    /**
     * 主项目的名字(为空读取默认值)
     */
    projectName?: string;
    /**
     * 使用暴露webpack配置的方式
     */
    webpackMode?: string;
    /**
     * 将webpack提升到根依赖(yarn会默认提升)
     */
    webpackPromotion?: boolean;
}
/**
 * 子项目生成
 */
declare interface SubSchematics {
    /**
     * 子项目的名字
     */
    name: string;
    /**
     * 主项目的名字
     */
    mainProjectName?: string;
    /**
     * 使用暴露webpack配置的方式
     */
    webpackMode?: string;
    /**
     * 开发端口
     */
    port: number;
}
