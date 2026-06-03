# 北京少年人工智能学院 · 国际AI赛事报名网页
## 开发交付级 UI/UX 实施规范（Codex Ready）

## 一、推荐技术栈（明确告知 Codex）

```
框架层      React 18 + Vite（或 Next.js 14 App Router）
样式层      Tailwind CSS + CSS Variables（设计 token 注入）
WebGL       Three.js (r160+) + @react-three/fiber + @react-three/drei
着色器      GLSL（自定义 Shader Material）
平滑滚动     Lenis（惯性滚动核心）
滚动动画     GSAP 3 + ScrollTrigger（联动动画主引擎）
微动效       Framer Motion（组件级进入/交互动画）
国际化       i18next + react-i18next
表单         React Hook Form + Zod（校验）
字体加载     fontsource / 本地 woff2 + font-display:swap
性能监测     stats.js（开发环境）
```

> **架构原则**：GSAP ScrollTrigger 统一管理"滚动进度"，并将进度值（progress 0→1）传递给 Three.js 控制 WebGL 状态，实现滚动与3D场景的精确联动。Lenis 提供平滑滚动基底。

---

## 二、全局设计 Token（Design Tokens）

### 2.1 色彩系统（CSS Variables）

```
/* 主色 */
--color-bg-base:        #F7F9FC;   晨雾白（主背景）
--color-bg-elevated:    #FFFFFF;   纯白（浮层）
--color-primary:        #4A7DFF;   智核蓝
--color-primary-deep:   #3A63D6;   深蓝（hover）
--color-accent-cyan:    #5FE3D0;   极光青
--color-accent-orange:  #FFB17A;   暖阳橙（CTA强调）
--color-accent-purple:  #9D8DF1;   星雾紫

/* 文字 */
--color-text-primary:   #2A2E3A;   主文字（非纯黑）
--color-text-secondary: #6B7280;   次要文字
--color-text-tertiary:  #9CA3AF;   辅助/占位
--color-text-inverse:   #F7F9FC;   反白文字

/* 功能 */
--color-success:        #5FE3D0;
--color-error:          #FF6B6B;
--color-line:           rgba(42,46,58,0.08);  分割线

/* WebGL 渐变锚点（供 Shader uniform 使用）*/
--gl-gradient-a:        #4A7DFF;
--gl-gradient-b:        #5FE3D0;
--gl-gradient-c:        #9D8DF1;
```

**透明度毛玻璃规范（导航栏）**：
`background: rgba(247,249,252,0.72); backdrop-filter: blur(20px) saturate(180%);`

### 2.2 字体系统与排版比例

```
/* 字族 */
--font-serif-en:  'Migra', 'Editorial New', serif;     超大标题英文
--font-serif-cn:  'Source Han Serif SC', serif;        超大标题中文
--font-sans-en:   'Neue Haas Grotesk', 'Inter', sans-serif;
--font-sans-cn:   'PingFang SC', 'Source Han Sans SC', sans-serif;
--font-mono:      'Space Mono', monospace;             编号/数据

/* 字号比例（基于 1.25 Major Third 模数，rem，根字号16px）*/
--fs-display:  clamp(64px, 11vw, 160px);   /* 超大主标题 line-height:0.95 */
--fs-h1:       clamp(48px, 6vw, 96px);     /* line-height:1.0 */
--fs-h2:       clamp(36px, 4vw, 64px);     /* line-height:1.1 */
--fs-h3:       28px;                        /* line-height:1.2 */
--fs-body-lg:  20px;                        /* line-height:1.6 */
--fs-body:     16px;                        /* line-height:1.7 */
--fs-caption:  13px;                        /* line-height:1.5 letter-spacing:0.04em */
--fs-mono:     14px;                        /* 编号 letter-spacing:0.1em */

/* 字距 */
--ls-display: -0.03em;   大标题收紧
--ls-caption:  0.08em;   小字放宽
```

### 2.3 间距系统（8pt 网格）

```
--space-1: 4px    --space-2: 8px    --space-3: 16px
--space-4: 24px   --space-5: 40px   --space-6: 64px
--space-7: 96px   --space-8: 128px  --space-9: 200px
模块垂直间距（section padding）：上下各 --space-9 (200px)，移动端 --space-7
```

### 2.4 缓动曲线库（Easing — 关键！）

```
--ease-out-expo:    cubic-bezier(0.16, 1, 0.3, 1)      /* 主入场，丝滑减速 */
--ease-in-out-quart:cubic-bezier(0.76, 0, 0.24, 1)     /* 状态切换 */
--ease-out-back:    cubic-bezier(0.34, 1.56, 0.64, 1)  /* 弹性反馈（按钮/对勾）*/
--ease-smooth:      cubic-bezier(0.65, 0.05, 0.36, 1)  /* 通用平滑 */

/* GSAP 对应写法：power4.out / power2.inOut / back.out(1.7) */
```

### 2.5 圆角与阴影

```
--radius-sm: 8px   --radius-md: 16px   --radius-lg: 24px   --radius-full: 999px
--shadow-soft:  0 8px 32px rgba(74,125,255,0.08);
--shadow-float: 0 16px 48px rgba(42,46,58,0.10);
--shadow-glow:  0 0 40px rgba(95,227,208,0.35);  /* 极光辉光 */
```

### 2.6 响应式断点

```
mobile:   < 768px      （WebGL 降级：粒子数 800，关闭连线）
tablet:   768–1199px   （粒子数 1500）
desktop:  ≥ 1200px     （粒子数 3000，全特效）
max-content-width: 1440px（内容容器），两侧 gutter 最小 5vw
```

---

## 三、WebGL 系统精确规格（Three.js 实施）

### 3.1 场景基础参数

```
Renderer:   WebGLRenderer { antialias:true, alpha:true, powerPreference:'high-performance' }
            pixelRatio: Math.min(devicePixelRatio, 2)
Camera:     PerspectiveCamera, fov:60, near:0.1, far:100, position.z:30
Scene:      透明背景（与 CSS 渐变叠加）
Lighting:   纯 Shader 自发光，无需实体光源（性能优先）
渲染循环:    requestAnimationFrame，集成 GSAP ticker 统一时钟
```

### 3.2 粒子神经网络系统（核心对象）

```
对象类型:    THREE.Points + 自定义 ShaderMaterial
粒子数量:    desktop 3000 / tablet 1500 / mobile 800
分布:        在半径 18 的球体内随机分布（初始 Banner 态）
粒子尺寸:    基础 2.0px，距相机近大远小（gl_PointSize 透视衰减）
颜色:        顶点色，沿 Y 轴在三色锚点间插值（蓝→青→紫）
连线（连接层）：
  - 仅 desktop 启用
  - 算法：遍历粒子，距离 < 4.0 的两点间画线（LineSegments）
  - 线透明度随距离衰减：opacity = 1 - (dist/4.0)
  - 性能：每帧最多计算 150 条连线，超出阈值跳过
透明度:      additive blending（叠加发光感），depthWrite:false
```

**Vertex Shader 关键 uniform**：
```
uTime          float    全局时钟（粒子漂浮噪声）
uScrollProgress float   0→1 全站滚动进度（驱动形态变换）
uMouse         vec2     归一化鼠标坐标（-1→1）
uMouseForce    float    鼠标涟漪强度（默认 1.5，影响半径 5.0）
uFormState     float    形态目标：0=球体 1=星河爆散 2=上升光柱
```

### 3.3 滚动驱动的五个形态状态（State Machine）

| 滚动进度 | 对应模块 | uFormState 目标 | 粒子行为 |
|---------|---------|----------------|---------|
| 0.00–0.15 | Banner | 0.0（核心球） | 粒子聚合成缓慢自转球体，整体绕Y轴 0.05rad/s |
| 0.15–0.35 | 赛事介绍 | 0.5（裂解） | 球体沿法线方向膨胀爆散为星河，粒子间距拉大 1.8倍 |
| 0.35–0.60 | 核心活动 | 1.0（星河流动） | 粒子在空间中分层漂浮，可被赛道悬停"激活汇聚" |
| 0.60–0.85 | 报名表单 | 2.0（上升光柱） | 粒子汇聚至中轴线 X≈0，沿Y轴上升流动，随表单步骤升高 |
| 0.85–1.00 | FAQ/页脚 | 0.0（归巢） | 粒子缓缓重新汇聚成微缩核心球，首尾呼应 |

> **实现方式**：GSAP ScrollTrigger 监听全站滚动，将 progress 映射到 `uScrollProgress`，Shader 内用 `mix()` 在形态间平滑插值。状态切换补间时长由滚动距离自然驱动（非固定时长）。

### 3.4 鼠标流体交互
```
监听 mousemove → 归一化坐标传入 uMouse（带 0.08 lerp 缓动，避免抖动）
Shader 内：计算粒子到鼠标射线的距离，距离 < 5.0 时施加斥力位移
位移衰减：force = uMouseForce * (1 - dist/5.0)^2
鼠标停止 0.5s 后 uMouseForce 渐归 0
```

### 3.5 性能降级策略（必须实现）
```
1. 初始化时用 FPS 探测（前 60 帧均值）：
   < 30fps → 自动降级到 tablet 配置；< 20fps → mobile 配置
2. 检测 prefers-reduced-motion: reduce
   → 关闭粒子动画，替换为静态 CSS 径向渐变背景
3. 检测 WebGL 不支持 → fallback 到纯 CSS 流体渐变（@property + keyframes）
4. 页面不可见时（visibilitychange）暂停渲染循环
5. 移动端：禁用连线层、降低 pixelRatio 至 1.5、粒子尺寸 +1px 补偿
```

---

## 四、模块逐一开发规格

> 通用约定：每个 section 高度至少 100vh；进入视口触发动画的 ScrollTrigger 起始点统一为 `start: 'top 75%'`；所有文字揭示使用 SplitText 思路（按行/字拆分 span）。

---

### 【模块 0】Loading 开场（首次加载）

```
时长:        最长 2.5s，资源加载完即可提前结束
布局:        全屏 #F7F9FC 背景，中央
动画时间轴（GSAP timeline）:
  0.0s  粒子（混沌随机分布）淡入
  0.5s  粒子汇聚成 Logo 轮廓（lerp 到预设 Logo 坐标点阵）
  1.5s  Logo 定型 + 院名文字遮罩上滑显现
  2.0s  数字进度 0→100% 在右下角（mono 字体）
  2.5s  整体向上滑出（clip-path 揭示首页），粒子无缝过渡到 Banner 球体态
关键:        Loading 的粒子系统与正式粒子系统是同一实例，不销毁重建，保证无缝
```

---

### 【模块 1】Banner 首页

**布局坐标（desktop 1440 基准）**：
```
主标题区:   距左 8vw，距顶 28vh，宽度占 70%
  "INTERNATIONAL AI CHALLENGE 2025"
  字体 --font-serif-en, --fs-display, 三行排布, line-height:0.92
副标题区:   距右 8vw, 距底 22vh, 右对齐（错位制造非对称）
  院名 + Slogan, --font-sans-cn, --fs-body-lg
滚动指示:   底部居中, "流动光点滴落" 竖线动画（24px高，光点循环下落）
```

**动画时间轴**：
```
进入（Loading结束后自动播放）:
  t=0.0  主标题逐字揭示：每字 clip-path inset(100% 0 0 0)→inset(0)
         + filter:blur(12px)→0, stagger 0.06s, ease-out-expo, 单字 0.8s
  t=0.4  副标题行级遮罩上滑（translateY 100%→0 + 透明度）
  t=0.8  滚动指示淡入 + 循环动画启动
视差（ScrollTrigger scrub:true，0→0.15进度）:
  主标题   translateY: 0 → -120px,  opacity 1→0
  副标题   translateY: 0 → -60px
  （粒子背景由全局系统处理）
```

---

### 【模块 2】赛事介绍（01 / Vision）

**布局（非对称错位）**：
```
左侧:   超大 mono 编号 "01"，--fs-display 80% 大小，颜色 --color-line（极淡，作背景装饰）
        定位 absolute, 距左 4vw, 垂直居中, z-index 低于文字
正文块: 居右排布，宽度 52%，右对齐, 距右 10vw
        含小标题 + 三段正文
数据条: 横向排布于正文下方，三组数据
背景字: 一行超大半透明英文 "VISION" 横贯，--fs-display 1.5倍, opacity 0.04
```

**动画**：
```
1. 背景大字 "VISION"（ScrollTrigger scrub）:
   水平 translateX -15% → +15%（与滚动反向，视差层次）
2. 正文行级揭示（start: top 75%）:
   每行 translateY 40px→0 + opacity 0→1, stagger 0.12s, ease-out-expo
3. 数据计数器（进入视口触发一次）:
   "40+ / 5000+ / ¥1,000,000" 从 0 用 GSAP 滚动到目标值, 时长 2s, ease-out-expo
   数字用 --font-mono, 单位文字同步淡入
4. WebGL 联动: 此区间粒子球体开始裂解（见 3.3）
```

---

### 【模块 3】核心活动（02 / Tracks）

**布局（斜向阶梯错落 — 严禁卡片平铺）**：
```
三大赛道沿对角线分布（左下→右上趋势）:
  赛道A  距左 6vw,  top 偏上区 (相对section 10%)
  赛道B  水平居中偏右, 垂直居中 (50%)
  赛道C  距右 8vw,  偏下区 (75%)
每个赛道单元:
  - 巨型序号 (A/B/C 或 mono 数字), --fs-h1
  - 赛道名（serif）+ 一句话描述（sans）
  - 一块预留的 WebGL 激活区域（悬停时粒子汇聚成对应图标）
  - 无边框、无卡片底色，纯文字 + 动态光效，靠留白与错位区分层级
连接线:  细线（--color-line）以贝塞尔曲线连接三个赛道，引导视线动线
```

**动画**：
```
1. 滚动斜向滑入（ScrollTrigger, 每个赛道独立触发 start: top 80%）:
   translateX from ±80px（A从左/C从右）+ translateY 30px + scale 0.92→1
   opacity 0→1, 时长 1.0s, ease-out-expo
2. 连接线: drawSVG 0%→100% 随滚动 scrub 绘制
3. 悬停交互（hover）:
   - 该赛道 WebGL 区域粒子 lerp 汇聚成图标点阵
     · A 算法 → 流动的二进制/代码流形态
     · B 机器人 → 旋转几何机械体
     · C 艺术 → 流体色彩漩涡
   - 赛道描述文字以"解码/打字机"效果展开（字符逐个从乱码→正确字）
   - 其余两赛道 opacity 1→0.4（聚焦当前）
   - 自定义光标变形放大至 1.8倍
4. 离开 hover: 粒子 0.8s 缓动散回星河态
```

---

### 【模块 4】报名表单（03 / Join Us）

**布局（分步沉浸式）**：
```
左侧（固定 sticky）:   垂直步骤进度光柱
  4个节点 (Step1-4), 当前节点放大+极光青发光, 已完成显示对勾
  节点间连线随进度填充（蓝色渐变）
右侧:                 当前步骤的输入区，单屏聚焦
  字段标签（sans, secondary色）+ 大号输入框（下划线式，非边框框）
  输入框 focus 时下划线从中间向两端展开（极光青）
底部:                 上一步 / 下一步 按钮（流体填充hover效果）
```

**字段定义**：
```
Step1 基本信息:  姓名*、年龄*、邮箱*、所在城市/国家*、电话
Step2 选择赛道:  三赛道单选（卡片态选择器，选中边框流光）
Step3 团队信息:  参赛类型(个人/团队单选)、团队名、成员、指导老师
Step4 确认提交:  信息汇总只读展示 + 隐私协议勾选 + 提交按钮
校验:            Zod schema, 实时校验, 错误下方红字 + 抖动 (shake) 反馈
```

**动画**：
```
1. 步骤切换:
   旧步骤内容 translateX -40px + opacity→0 退出
   新步骤 translateX 40px→0 + opacity 0→1 进入, ease-in-out-quart 0.6s
   进度光柱当前节点 scale 1→1.3 + 辉光渐显
2. 输入框 focus:
   下划线 scaleX 0→1 (transform-origin:center), 极光青, 0.4s ease-out-expo
   标签上浮缩小（floating label）translateY -20px + scale 0.85
3. 校验成功反馈:
   字段右侧极光青对勾 scale 0→1, ease-out-back 弹性, 0.4s
4. WebGL 联动:
   进入报名区，粒子汇聚成上升光柱（uFormState→2.0）
   每完成一个 Step，光柱高度 +25%（uProgress 传入 Shader）
5. 提交瞬间（成功）:
   光柱爆发 → 粒子向上四散（velocity 上扬 + 渐隐）
   中央浮现 "欢迎加入 / Welcome Aboard" serif 大字 + 辉光 scale+opacity
   按钮变 loading 态（流体循环）→ 成功对勾
6. 按钮 hover: 流体从左→右填充（::before width 0→100% + 文字反色）, 0.5s
```

---

### 【模块 5】FAQ（04 / FAQ）

**布局**：
```
左侧（sticky）:  超大竖排或横排 "FAQ" 标题, serif, --fs-display
                + 小字 "还有疑问？" + 联系入口
右侧:           问答列表，非对称缩进（奇偶项左右微错位 16px）
                每项: 问题行（h3）+ 折叠的答案区
                项间分割线 --color-line
```

**动画**：
```
1. 手风琴展开:
   答案区 height auto 平滑展开（用 max-height 或 GSAP height:auto）
   内容 opacity 0→1 + translateY 10px→0, ease-in-out-quart 0.5s
   "+" 图标 rotate 0→45deg 变 "×", ease-out-back
   同一时间仅展开一项（点击新项自动收起旧项）
2. 行 hover: 左侧流光指示条 scaleY 0→1 (origin top), 极光青
3. 列表项进入: stagger 揭示 translateY 30px→0, 0.1s 间隔
4. WebGL: 粒子趋于稀疏平静（透明度降至 0.5，漂浮速度减半）
```

---

### 【模块 6】Footer 页脚

**布局**：
```
顶部:    粒子归巢区（留 40vh 空间让 WebGL 核心球重新成型）
中部:    四栏信息（错落非等宽：院校信息 40% / 快速链接 / 联系 / 社交）
合作伙伴: Logo 墙，呼吸式渐显，灰度处理 hover 时恢复彩色
底部:    备案号、版权、隐私政策（caption 字号，tertiary 色）
```

**动画**：
```
1. WebGL 粒子归巢（uFormState→0）: 重组微缩核心球, 与首页呼应
2. Logo 墙: 逐个 opacity 0→1 呼吸式渐显, stagger 0.08s
3. Logo hover: filter grayscale(1)→grayscale(0), 0.4s
```

---

## 五、全局交互系统规格

### 5.1 多语言切换（i18next）
```
位置:     导航栏右侧 "中 / EN" 胶囊切换器
数据结构: locales/zh.json + locales/en.json（所有文案 key 化）
切换动效:
  1. 全站文字 filter:blur(0→8px) + opacity 1→0, 0.3s
  2. 切换 i18n 语言 + 切换 font-family（中文宋黑↔英文衬线）
  3. 文字 blur(8→0) + opacity 0→1 重新浮现, 0.3s
  4. WebGL 不中断
注意:     中英文行高/字距需各自适配（en 行高更紧，cn 更松）
          重新揭示后需触发布局重测（避免文字溢出）
持久化:   localStorage 存储语言偏好
```

### 5.2 导航栏
```
初始:     透明背景
滚动 >80px: 渐变为毛玻璃（见 2.1 规范）+ 高度 80px→64px 收缩
内容:     左 Logo / 中 锚点导航(赛事/活动/报名/FAQ) / 右 语言切换+报名CTA
锚点点击:  Lenis 平滑滚动到对应 section, 0.8s ease
移动端:   汉堡菜单 → 全屏遮罩导航, 链接 stagger 揭示
```

### 5.3 右侧滚动进度指示
```
位置:     屏幕右侧垂直居中
形式:     4个 mono 编号(01-04) + 细线进度条
当前模块: 编号放大+主色高亮，进度条填充对应比例
点击编号: 跳转对应模块
移动端:   隐藏
```

### 5.4 自定义光标（desktop only）
```
默认:     12px 圆点（mix-blend-mode: difference）+ 24px 跟随环（lerp 0.15 延迟）
可点击元素 hover: 圆点 scale→1.8, 环消失
文字输入区 hover: 变 I-beam 形态
拖拽/特殊区: 显示提示文字（如 "拖动探索"）
prefers-reduced-motion / touch设备: 禁用，恢复系统光标
```

### 5.5 全局通用微动效清单
```
链接 hover:    下划线 scaleX 0→1 from left, 0.3s ease-out-expo
图片揭示:      clip-path inset(0 100% 0 0)→inset(0) 擦除, 进入视口触发, 1.0s
按钮 hover:    流体填充（见模块4-6）
滚动揭示通用:  translateY 40px→0 + opacity, start: top 75%, stagger 0.1s
页面切换:      （单页应用无需，锚点平滑滚动即可）
```

---

## 六、可访问性与边界处理（务必实现）

```
1. prefers-reduced-motion:reduce → 全站关闭大动画，WebGL 转静态渐变，
   保留功能性过渡（如手风琴展开）但缩短至 0.2s
2. 键盘导航: 所有交互元素 focus 可见（极光青 outline），Tab 顺序合理
3. 表单: aria-label 完整, 错误用 aria-live 播报, 不仅靠颜色区分
4. 语义化: 正确 heading 层级 h1→h2→h3，section/nav/footer 标签
5. WebGL canvas: aria-hidden="true"（纯装饰，不干扰读屏）
6. 颜色对比: 正文文字 #2A2E3A on #F7F9FC ≈ 12:1（达 AAA）
   注意暖阳橙/极光青上的文字需校验对比度 ≥4.5:1
7. 图片 alt、首屏 LCP 元素优先加载
```

---

## 七、性能预算与加载策略

```
首屏指标:   LCP < 2.5s, FID < 100ms, CLS < 0.1
WebGL:      着色器/Three.js 代码分包，异步加载（先出内容后叠特效）
字体:       woff2 + font-display:swap, 子集化中文（仅常用字+标题字）
图片:       WebP/AVIF, 懒加载, 响应式 srcset
代码分割:   按模块动态 import，FAQ/Footer 可延迟加载
动画节流:   ScrollTrigger 统一 ticker, 避免多 RAF 循环
帧率目标:   稳定 60fps（desktop）, ≥30fps（mobile，否则降级）
```

---

## 八、交付物与目录结构建议

```
/src
  /components   (Nav, Footer, LangSwitch, Cursor, ScrollIndicator)
  /sections     (Banner, Vision, Tracks, Registration, FAQ)
  /webgl        (Scene, ParticleSystem, shaders/*.glsl, useScrollProgress)
  /animations   (gsap timelines, scrollTriggers 配置)
  /locales      (zh.json, en.json)
  /styles       (tokens.css 设计变量, globals.css)
  /hooks        (useLenis, useMouse, usePerformanceTier)
  /lib          (form schema, i18n config)
/public/fonts   (woff2 子集)
/public/assets  (logos, images)
```

**给 Codex 的开发顺序建议**：
```
① 搭建 token 系统 + 字体 + 布局骨架（无动画）
② 接入 Lenis 平滑滚动 + i18next 双语
③ 逐模块实现静态布局（确认非对称排版还原度）
④ 接入 GSAP ScrollTrigger 实现滚动揭示动画
⑤ 构建 Three.js 粒子系统（先球体态）
⑥ 接入滚动进度驱动的五状态形态变换
⑦ 表单逻辑 + 校验 + 提交动效
⑧ 自定义光标、微交互、Loading 开场
⑨ 性能降级 + 可访问性 + 多端适配测试
```

---

## 💎 设计意图核心备忘（给开发者的灵魂提示）

> 1. **留白是主角**：任何模块都不要把元素填满，70%以上的呼吸空间是高级感的来源。
> 2. **非对称是刻意的**：错位、悬挂、偏移都是设计决策，请勿"对齐修正"。
> 3. **动画服务于情绪**：粒子从球体→裂解→光柱→归巢，是一条"少年奔赴智能未来再回归"的情感线，不是随机特效。
> 4. **性能即体验**：宁可降级也不卡顿，30fps 是底线。
> 5. **缓动曲线决定品质**：所有动画务必使用规定的 ease 曲线，线性动画会瞬间廉价化。