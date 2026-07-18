# Naoii 方案二 Logo 资源包

方案：Playful N Face（趣味 N 助手）

## SVG 文件

- `favicon-light.svg`：亮色模式标签页图标
- `favicon-dark.svg`：暗色模式标签页图标
- `favicon-adaptive.svg`：根据 `prefers-color-scheme` 自动切换
- `naoii-logo-light.svg`：亮色页面左上角 Logo（图标 + Naoii）
- `naoii-logo-dark.svg`：暗色页面左上角 Logo（图标 + Naoii）
- `naoii-logo-adaptive.svg`：自动适配明暗主题的横版 Logo

同时附带 4 张 PNG 预览图和 `preview.html`。

## 标签页图标用法

推荐自动适配：

```html
<link rel="icon" type="image/svg+xml" href="/assets/naoii/favicon-adaptive.svg">
```

也可以分别声明亮暗模式：

```html
<link rel="icon" type="image/svg+xml"
      href="/assets/naoii/favicon-light.svg"
      media="(prefers-color-scheme: light)">

<link rel="icon" type="image/svg+xml"
      href="/assets/naoii/favicon-dark.svg"
      media="(prefers-color-scheme: dark)">
```

## 左上角 Logo 用法

```html
<picture>
  <source srcset="/assets/naoii/naoii-logo-dark.svg"
          media="(prefers-color-scheme: dark)">
  <img src="/assets/naoii/naoii-logo-light.svg"
       alt="Naoii"
       width="260"
       height="72">
</picture>
```

或直接使用自动适配版本：

```html
<img src="/assets/naoii/naoii-logo-adaptive.svg"
     alt="Naoii"
     width="260"
     height="72">
```

## 设计说明

- SVG 均为纯矢量路径和基础图形，不依赖外部字体。
- Logo 背景透明，适用于网页导航栏。
- 亮暗模式分别优化了字标颜色与图标对比度。
- 主色：紫色；辅助色：青色；交互点缀：荧光青柠色。
