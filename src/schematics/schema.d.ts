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
}
