# CHONGSHENG EXECUTIVE OS 项目日志

> 项目：重生行政座舱系统  
> 前端：https://chongsheng180000.github.io  
> 后端：Cloudflare Worker `chongsheng-backend`  
> 日志覆盖：2026-07-03 至 2026-07-26  
> 最后整理：2026-07-26

## 1. 项目定位

CHONGSHENG EXECUTIVE OS 是一套以虚构高级行政车内饰为交互语言的个人博客系统。

车是交互与视觉结构，博客是内容本体。系统目前承载：

- 日常记录、随笔、经验和个人判断；
- 静态文章、分类、标签、归档和搜索；
- 数字商品、脚本、模板、教程、资源与咨询说明；
- 独立会员资源舱和卡密验证；
- 联系表单、邮箱真实性验证和消息保存；
- GitHub Pages 静态前端；
- Cloudflare Worker、D1 和本地管理命令。

长期设计原则：

- 首页强调可玩的行政座舱体验；
- 文章页优先保证中文长文阅读；
- 商品页强调资源边界，不模拟淘宝或自动支付；
- 会员商品不写入前端静态文件，只在后端鉴权通过后返回；
- 视觉参考豪华行政车的材质、秩序与空间，不使用真实车标或照抄车企 UI；
- 不让巡航、方向盘和动效成为访问内容的门槛。

---

## 2. 当前系统快照

截至 2026-07-26，仓库包含以下主要页面：

| 页面 | 文件 | 当前职责 |
| --- | --- | --- |
| 行政座舱首页 | `index.html` | 巡航场景、方向盘、中控、仪表、近期内容和主要入口 |
| 文章归档 | `posts.html` | 分类、标签、关键词筛选和文章路线列表 |
| 文章详情 | `post.html` | 后排行政阅读舱、正文、目录和阅读控制 |
| 普通商品页 | `shop.html` | 公开数字货架和会员资源舱入口 |
| 会员资源舱 | `member.html` | 独立验证界面及鉴权后的私享商品列表 |
| 站点地图 | `map.html` | 可交互路线图、页面节点、文章与资源导航 |
| 关于 | `about.html` | 站主档案、写作内容、工具和边界说明 |
| 联系 | `contact.html` | 联系方式、合作说明和真实后端联系表单 |
| 搜索 | `search.html` | 本地搜索文章、摘要、标签和公开商品 |
| 隐私 | `privacy.html` | 数据处理和边界说明 |

当前公开内容数据：

- 示例文章：6 篇；
- 公开商品：67 项；
- 公开商品分类：11 类；
- 商品分类包括：脚本、模板、教程、咨询、资源包、配置、素材、工作流、项目合作、预测、其他。

当前基础技术：

- 前端：纯 HTML、CSS、JavaScript；
- 构建流程：无前端构建步骤；
- 前端托管：GitHub Pages；
- 后端：Cloudflare Worker + TypeScript；
- 数据库：Cloudflare D1；
- 邮件验证转发：Google Apps Script；
- 后端开发与部署：Wrangler；
- 后端测试：Node Test Runner + `tsx`；
- 会员鉴权：HMAC 卡密哈希、设备绑定、短期会话和 D1 在线校验。

---

## 3. 详细开发记录

## 2026-07-03：仓库初始化与首次 Pages 部署

相关提交：

- `f4cf2a5` `init second blog`
- `03a7a75` `trigger pages deploy`

完成内容：

- 初始化第二个个人博客仓库；
- 建立 GitHub Pages 发布基础；
- 验证仓库能够从 `main` 分支发布静态内容；
- 保留纯静态站点方向，没有引入 Node 前端运行环境和数据库依赖。

阶段结论：

- 仓库和 Pages 链路建立；
- 站点仍接近空白，尚未形成内容系统和视觉身份。

## 2026-07-04：完整静态博客底座

相关提交：

- `25528c2` `Build static personal blog`
- `cf7a555` `Refine hero cockpit design`
- `420b2e2` `Trigger Pages deploy`
- `6a55fb4` `Add static Pages workflow`
- `b6a671a` `Rebuild hero as luxury cockpit`

首次完整建立：

- `index.html` 首页；
- `posts.html` 文章列表；
- `post.html` 文章详情模板；
- `shop.html` 公开商品页；
- `about.html` 关于页；
- `contact.html` 联系页；
- `search.html` 搜索页；
- `map.html` 站点地图入口；
- `privacy.html` 隐私说明；
- `data/posts.js` 文章数据；
- `data/products.js` 商品数据；
- `robots.txt`、`sitemap.xml`、`rss.xml`；
- `assets/favicon.svg`；
- 全局导航、页脚、明暗主题和本地搜索。

技术处理：

- 首页入口保持为 `index.html`；
- 所有页面能够被 GitHub Pages 直接托管；
- 数据以 JavaScript 静态结构保存；
- 页面共享 `assets/js/main.js` 的导航、主题、语言和渲染逻辑；
- SEO 使用静态 `title`、`description`、Open Graph、canonical、RSS 和 XML sitemap。

设计转向：

- Hero 从普通博客横幅转为行政座舱概念；
- 开始使用钢琴黑、暗金属、皮革、木纹和氛围灯语言；
- 保留核心文案：
  - `CHONGSHENG DAILY OS`
  - `把日子写下来，把工具磨顺手`

阶段问题：

- 初期座舱仍以网页卡片分栏为主；
- 方向盘、仪表和前挡风只有视觉雏形；
- 首页的“像车”主要依赖命名和暗色样式。

## 2026-07-05：首页座舱结构、方向盘与巡航迭代

相关提交：

- `9cc3af7` `Upgrade executive cockpit blog UI`
- `0168cf4` `Refine cockpit audit issues`
- `9dbde75` `Refine home cockpit structure`
- `3ead540` `Refine round luxury steering wheel`
- `6f45284` `Enhance luxury cruise scenery and steering feel`
- `6fc6323` `Refine cockpit ambient and steering physics`
- `e0d07b9` `Avoid duplicate Pages deploy workflow`

首页结构完成：

- 星空顶；
- 抽象前挡风夜景；
- 统一 Cockpit Shell；
- 左侧驾驶员日志屏；
- 中央宽屏中控；
- 右侧数字货架屏；
- 博客状态仪表；
- 左侧驾驶位置方向盘；
- 底部 Interaction Light Bar；
- 移动端 Mini Control Pad。

方向盘结构完成：

- 外圈皮革层；
- 内圈阴影和开孔；
- 中央毂；
- 左右辐条；
- 左右控制岛；
- 嵌入式按钮；
- 分类和氛围滚轮；
- 左右拨片；
- 微弱缝线和背光；
- 无真实车标。

方向盘功能：

- 上一项、下一项；
- 分类切换；
- Drive Mode 切换；
- 氛围主题切换；
- 搜索；
- 资源货架；
- 归档；
- 巡航模式；
- 中央返回首页；
- 长按中央毂切换极简显示。

巡航交互：

- Auto、Manual、Paused 三种状态；
- A / D 或方向键控制轻微转向；
- W / S 调节巡航视觉速度；
- Space 暂停或继续；
- M 切换模式；
- L 切换氛围主题；
- Esc 回到自动巡航或关闭搜索；
- 鼠标拖动方向盘；
- 方向盘释放后使用弹簧和阻尼逐步回正。

物理处理：

- 最大方向盘角度限制为约 `-18deg` 到 `18deg`；
- 使用角速度、回正弹簧、速度辅助和阻尼计算；
- 不实现碰撞、赛道、任务或真实车辆动力学；
- 方向盘状态与道路偏移、城市灯点、中控和仪表同步。

性能与可访问性：

- 不使用 WebGL 和重型 3D；
- 巡航主要由 CSS、SVG、渐变和少量 JavaScript 状态驱动；
- 支持 `prefers-reduced-motion`；
- 方向盘按钮使用语义化 `button`；
- 移动端隐藏完整方向盘。

## 2026-07-12：全站行政座舱系统化重构

相关提交：

- `3f39451` `Overhaul executive cockpit blog experience`

本阶段是一次全站结构重整，不只修改首页。

完成内容：

- 首页座舱结构重新整理；
- `executive-home.css` 大规模去除重复和无效规则；
- 新增和整理 `executive-os.css` 全局设计 token；
- 新增和整理 `executive-pages.css` 内页样式；
- 文章、商品、关于、联系、地图、搜索和隐私页面统一视觉语言；
- 扩展中英文文案；
- 调整文章和商品示例数据；
- 更新 RSS 与 sitemap；
- 降低过亮蓝光、廉价渐变和卡片堆叠感。

全局设计语言：

- 黑色皮革；
- 低反光钢琴黑；
- 深色磨砂屏幕；
- 胡桃木小面积饰条；
- 香槟金属细边；
- 低亮状态灯；
- 仪表等宽字体；
- 中文阅读字体；
- 明暗主题；
- 克制的屏幕高光和灯带扫过。

内页分工：

- 文章页：Rear Reading Lounge；
- 商品页：Armrest Resource Console；
- 归档与地图：Navigation Archive Cluster；
- 关于页：Owner Profile Display；
- 联系页：Contact Channel / Boundary System。

## 2026-07-15：控制区、字体与编辑排版修正

相关提交：

- `a357844` `Refine cockpit controls and editorial styling`

修正内容：

- 放大方向盘和仪表中的过小文字；
- 加强控制键的嵌入槽、上沿高光和按压反馈；
- 修正方向盘模式切换顺序；
- 避免鼠标滚轮停留在中控时劫持正常页面滚动；
- 处理首页内容分类字幕重叠；
- 重排“保留意见”等内容，降低廉价表格感；
- 调整中英文字体与标题字重；
- 改善长文、商品说明和状态文本的层次。

## 2026-07-16：数字货架扩展

相关提交：

- `6cadecf` `Expand and refine the digital shelf`

商品系统扩展：

- 公开商品由少量演示项扩充为 67 项；
- 分类扩展为 11 类；
- 四个原始主分类继续保留：
  - 脚本；
  - 模板；
  - 教程；
  - 咨询。
- 新增七类：
  - 资源包；
  - 配置；
  - 素材；
  - 工作流；
  - 项目合作；
  - 预测；
  - 其他。

商品展示字段：

- 名称；
- 英文名称；
- 用途定位；
- 适合对象；
- 包含内容；
- 当前状态；
- 价格占位；
- 联系购买方式；
- 合规和交付边界。

页面保持：

- 不接真实支付；
- 不写支付密钥；
- 不实现自动发货；
- 不销售作弊、破解、盗号、侵权或绕过平台规则的工具。

## 2026-07-16：Cloudflare Worker 最小后端

相关提交：

- `86c5932` `Add Cloudflare Worker backend scaffold`

建立目录：

```text
backend-worker/
├── package.json
├── wrangler.jsonc
├── tsconfig.json
└── src/
    └── index.ts
```

Worker 信息：

- 名称：`chongsheng-backend`；
- 入口：`src/index.ts`；
- TypeScript；
- Wrangler；
- 保留最小 JSON 响应头；
- 提供 `GET /` 和 `GET /health`。

基础响应头：

- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: no-store`
- `X-Content-Type-Options: nosniff`

## 2026-07-17：联系表单真实后端

相关提交：

- `5764bf1` `Add secure contact message API`
- `dbc9b69` `Connect contact form to Worker API`
- `c53b4bf` `Add verified contact form UI`
- `2597de4` `Add verified contact email flow`
- `b5d11b9` `Harden contact verification fallback`

新增接口：

- `POST /api/contact`
- `GET /api/contact/verify`

联系表单字段：

- 姓名；
- 邮箱；
- 消息。

后端校验：

- 去除首尾空格；
- 名称长度限制；
- 邮箱格式校验；
- 消息长度限制；
- 统一错误响应；
- 只允许博客正式 Origin；
- 不在日志中输出完整邮箱和消息。

防滥用：

- 基于 IP 哈希的时间窗口限制；
- 不保存明文 IP；
- `Cache-Control: no-store`；
- 前端提交期间禁止重复操作。

邮箱真实性验证：

- 用户提交后先进入待验证状态；
- Worker 生成一次性验证 Token；
- Google Apps Script 发送验证邮件；
- 用户点击链接后 Worker 更新验证状态；
- 未验证或验证失败的消息不会被当作正式有效联系；
- 对邮件发送失败保留安全降级提示。

D1 迁移：

- `0001_contact_messages.sql`
- `0002_contact_email_verification.sql`

前端体验：

- 联系页加入真实表单；
- 明确显示提交、发送验证、等待验证、验证成功和失败状态；
- 保留邮箱、QQ、微信和合作边界说明；
- 不暴露 Worker 内部错误和数据库信息。

## 2026-07-18：会员后端基础

相关提交：

- `d1c2c5d` `Add member backend foundation`

后端结构拆分：

```text
backend-worker/src/
├── auth.ts
├── cors.ts
├── crypto.ts
├── database.ts
├── env.ts
├── index.ts
├── response.ts
├── risk.ts
├── token.ts
├── types.ts
└── routes/
    ├── health.ts
    ├── logout.ts
    ├── productDetails.ts
    ├── products.ts
    ├── session.ts
    └── verifyCard.ts
```

会员 D1 表：

- `member_cards`
- `card_devices`
- `member_sessions`
- `member_products`
- `login_attempts`
- `security_events`

卡密设计：

- 标准格式：`CSVIP-26-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`；
- 使用 Node.js `crypto` 生成；
- 排除容易混淆的字符；
- 数据库只保存 HMAC-SHA256 结果；
- 不保存明文卡密；
- `MEMBER_CARD_PEPPER` 不写入代码和 Git。

设备与会话：

- 默认最多 2 台设备；
- 默认最多 2 个活跃会话；
- 会话绝对有效期 12 小时；
- 空闲有效期 2 小时；
- 新设备超过上限时拒绝；
- 已绑定设备允许重新验证；
- IP 变化只作为风险信息，不直接封禁；
- 卡密禁用、过期或吊销后，旧会话通过数据库复核立即失效。

Token：

- Web Crypto HMAC-SHA256；
- base64url；
- 包含 card、session、device reference、plan、iat、exp、idleExp、tokenVersion 和 jti；
- D1 只保存 Token 的 SHA-256；
- Token 不进入 URL；
- 每次会员请求都验证数据库会话。

基础风控：

- IP、卡密和设备分别记录失败窗口；
- 达到阈值后临时阻断；
- 失败响应加入随机延迟；
- 不向客户端泄露“卡密不存在、已过期、设备已满”等具体原因；
- 安全事件只记录必要哈希和摘要。

会员 API：

- `POST /api/member/verify-card`
- `GET /api/member/session`
- `GET /api/member/products`
- `GET /api/member/products/:slug`
- `POST /api/member/logout`

CORS：

- 只允许 `https://chongsheng180000.github.io`；
- 不使用通配符 Origin；
- 允许 `GET`、`POST`、`OPTIONS`；
- 允许 `Content-Type`、`Authorization`、`X-Device-ID`；
- 设置 `Vary: Origin` 和 `Referrer-Policy: no-referrer`。

本地安全文件：

- `.dev.vars`
- `cards.private.txt`
- `cards.import.private.sql`
- `.wrangler/`

以上文件均由 `.gitignore` 排除，不应提交到 GitHub。

## 2026-07-18：会员资源舱首次接入

相关提交：

- `7df0dad` `Integrate member lounge into shop`

首次会员前端能力：

- 普通商店中加入会员入口；
- 会员卡密验证弹窗；
- 浏览器生成并持久保存 `deviceId`；
- 卡密只保存在组件内存，提交后立即清空；
- Token 只存入当前标签页的 `sessionStorage`；
- 刷新页面时通过 `/api/member/session` 恢复会话；
- 会员商品只从 `/api/member/products` 获取；
- 前端 bundle 不保存隐藏商品列表；
- 退出后调用 `/api/member/logout` 并清空本地会员状态。

前端存储：

| 数据 | 存储位置 | 原因 |
| --- | --- | --- |
| `deviceId` | `localStorage` | 设备标识需要跨标签页和重启保持 |
| 会员 Token | `sessionStorage` | 只在当前标签页会话内保存 |
| 卡密 | 不保存 | 仅用于一次验证请求 |
| 隐藏商品 | 内存 | 会话失效后立即清除 |

## 2026-07-22：会员本地管理命令

相关提交：

- `d604b54` `Add member administration CLI`

新增文档：

- `backend-worker/MEMBER_ADMIN.md`

新增和完善命令：

- `card:list`
- `card:disable`
- `card:enable`
- `card:revoke`
- `card:devices:list`
- `card:devices:reset`
- `card:sessions:list`
- `card:sessions:revoke`
- `card:risk:show`
- `product:list`
- `product:add`
- `product:update`
- `product:disable`

管理能力：

- 查看卡密内部 ID、状态、计划和使用次数；
- 查看设备绑定数量；
- 清除旧设备；
- 查看和吊销会话；
- 禁用泄露卡密；
- 重新启用可恢复卡密；
- 永久吊销卡密；
- 查看近期风险事件；
- 添加、更新和下架会员商品；
- 日常管理不需要打开 Cloudflare D1 可视化编辑器。

安全约束：

- 管理脚本不显示明文卡密；
- 管理脚本不创建公开管理后台；
- 命令显式区分本地和远程数据库；
- 破坏性操作要求明确目标参数；
- 测试覆盖命令解析和敏感输出边界。

## 2026-07-22：交互式站点路线图

相关提交：

- `814c190` `Rebuild interactive site route map`

站点地图从简单链接页升级为：

- 主路线节点；
- 文章路线；
- 数字资源节点；
- 页面状态和里程摘要；
- 路线筛选；
- 本地关键词检索；
- 桌面端线路图；
- 移动端纵向路线；
- 普通 HTML 链接作为无脚本降级。

设计转译：

- 首页对应 Cockpit；
- 文章对应 Reading Routes；
- 商品对应 Digital Shelf；
- 联系对应 Contact Channel；
- RSS 对应 Signal Feed；
- XML sitemap 对应 Machine Map；
- 隐私对应 Boundary System。

SEO：

- 人类可读地图使用 `map.html`；
- 搜索引擎地图继续使用 `sitemap.xml`；
- 两者互不替代。

## 2026-07-22：独立会员资源舱与语言修复

相关提交：

- `50686d2` `feat: separate and refine member lounge`

会员页面拆分：

- 从普通 `shop.html` 移除内嵌会员商品和验证弹窗；
- 新建独立 `member.html`；
- 普通商店只保留进入会员资源舱的控制键；
- 未验证时显示独立凭证控制台；
- 验证成功后隐藏入口首屏，直接进入会员商品舱；
- 会员商品仍只从后端读取。

会员商品视觉：

- 夜间采用钢琴黑、暗金、青绿和低亮紫蓝；
- 白昼采用象牙皮革、深胡桃木、香槟金和低饱和墨绿；
- 每张商品单独计算鼠标位置；
- 鼠标移动时更新商品内部光场；
- 使用极轻微透视倾角；
- 离开商品后光场回到默认位置；
- `prefers-reduced-motion` 下停用跟随动效；
- 移动端保持单列，不依赖 hover。

导航调整：

- 删除顶部重复的“经验”入口；
- 将“思想”入口替换为“地图”；
- 地图按钮指向 `map.html`；
- 保留文章页中的思想分类内容，不删除数据。

语言系统修复：

- 语言按钮切换时立即写入 `localStorage`；
- 同时使用 `?lang=zh` 或 `?lang=en` 作为当前跳转的确定性语言参数；
- 页面初始化优先读取 URL 语言，再回写本地语言；
- 跨页面继续使用持久化语言；
- 英文模式下首页、商店、会员和地图不显示中文可见正文；
- 多标签页通过 `storage` 事件同步语言变化。

白昼氛围灯：

- 不再直接复用夜间高亮颜色；
- 为七种氛围主题单独提供白昼颜色；
- 白昼灯带降低饱和度和外发光；
- 加强米白背景上的文字、按钮和仪表对比；
- 移动端白昼导航和 Mini Control Pad 使用独立浅色材质。

---

## 4. 当前首页系统说明

## 4.1 Drive Mode

首页中控支持：

| 模式 | 主要内容 | 对应状态重点 |
| --- | --- | --- |
| Read | 最新文章、日常和阅读入口 | Record、Thought |
| Build | 工具、脚本、项目和部署内容 | Build |
| Shelf | Scripts、Templates、Tutorials、Consulting | Shelf、Boundary |
| Archive | 年份、归档、搜索和路线 | Mileage、Signal |
| Night | 夜景、星空和低干扰入口 | Cruise、Ambient |

模式切换会同步：

- 中控内容；
- 仪表 Mode；
- 方向盘 Mode 键；
- Interaction Light Bar；
- 状态高亮；
- 推荐氛围主题。

## 4.2 氛围主题

现有七种主题：

1. Obsidian Gold / 黑曜金；
2. Phantom Starlight / 星光白；
3. Executive Amber / 行政暖金；
4. Midnight Blue / 夜巡深蓝；
5. Violet Lounge / 紫蓝后排；
6. Classic Walnut / 经典胡桃；
7. Silent Black / 静默黑。

氛围主题影响：

- 灯带；
- 仪表刻度；
- 中控边缘；
- 方向盘按钮背光；
- 前挡风色调；
- 控件 hover；
- 星空亮度。

氛围主题只改变边缘光和控制高光，不大面积污染正文颜色。

## 4.3 星空顶

模式：

- On；
- Dim；
- Map；
- Off。

星图模式中的部分星点对应：

- 最新文章；
- 日常；
- 工具；
- 数字货架；
- 思想与判断。

移动端降低星点数量和亮度，避免影响性能与文字阅读。

## 4.4 仪表盘

仪表显示博客状态而不是车辆假数据：

- Record；
- Build；
- Shelf；
- Thought；
- Mileage；
- Signal；
- Mode；
- Cruise。

明确不显示：

- 假车速；
- RPM；
- 油量；
- 发动机温度；
- 竞速排名。

---

## 5. 当前后端系统说明

## 5.1 Worker

目录：`backend-worker/`

Worker 名称：`chongsheng-backend`

D1 绑定：

- `DB`：会员系统数据库；
- `CONTACT_DB`：联系表单数据库。

生产密钥变量：

- `MEMBER_CARD_PEPPER`
- `MEMBER_SESSION_SECRET`
- `DEVICE_HASH_PEPPER`
- `IP_HASH_PEPPER`
- 可选 `TURNSTILE_SECRET`

联系邮件流程还使用单独的邮件转发配置。所有真实值必须保存在 Cloudflare Runtime Secrets 或本地忽略文件中。

## 5.2 数据库迁移

| 文件 | 用途 |
| --- | --- |
| `0001_contact_messages.sql` | 联系消息和基础限流 |
| `0002_contact_email_verification.sql` | 邮箱验证 Token、验证状态和邮件流程 |
| `0003_member_private_store.sql` | 卡密、设备、会话、会员商品、失败记录和安全事件 |

## 5.3 后端命令

```bash
npm run dev
npm run typecheck
npm test
npm run deploy
npm run db:migrate:local
npm run db:migrate:remote
npm run cards:generate
npm run cards:import:local
npm run cards:import:remote
npm run member:admin -- <command>
```

注意：

- 远程迁移、卡密生成和卡密导入不是普通开发检查命令；
- 执行前必须确认本地 `MEMBER_CARD_PEPPER` 与 Cloudflare Runtime Secret 完全一致；
- 不要重新生成 Pepper 覆盖现有值；
- Pepper 丢失后，原卡密无法再验证；
- `cards.private.txt` 需要离线安全保存；
- 不要把私密文件加入 Git。

---

## 6. 安全边界

当前系统明确执行以下边界：

- 前端不包含真实卡密；
- 前端不包含会员 Secret；
- 前端不包含静态隐藏商品列表；
- Token 不存入 `localStorage`；
- 卡密不存入浏览器存储；
- 明文 IP 不写入 D1；
- 明文 deviceId 不写入 D1；
- 完整 Token 不写入 D1；
- 后端不在日志中打印完整邮箱、消息、卡密、Token 或设备标识；
- 会员错误响应不泄露卡密是否存在；
- 会员商品接口必须通过 Token、设备、Session 和卡状态验证；
- 退出会员区后，无论网络请求是否成功，前端都会清除本地会员状态；
- 普通商品页不实现真实自动支付和自动交付；
- 联系表单只接受正式博客 Origin；
- 会员 CORS 不使用 `*`；
- 页面没有真实车标、真实车企图片或官方车机素材。

---

## 7. 已执行的验证

前端检查：

- 主要页面桌面宽度检查；
- 主要页面 390px 手机宽度检查；
- 无横向溢出；
- 每页保留一个主要 `h1`；
- 无浏览器脚本异常；
- 导航链接可访问；
- 商店到独立会员页跳转正确；
- 普通商品页不再包含会员商品 DOM；
- 语言切换后跨页面保持；
- 英文模式可见文本无中文残留；
- 七组白昼氛围变量可分别切换；
- 会员商品光场在当前商品内独立跟随鼠标；
- `prefers-reduced-motion` 保留降级逻辑。

后端检查：

- TypeScript `typecheck`；
- Worker 单元测试；
- HMAC 与 Token 测试；
- CORS 和 OPTIONS 测试；
- 无 Token 和错误 Token 拒绝；
- 联系接口输入校验；
- 会员卡密统一失败响应；
- 会话和设备校验；
- 管理命令解析测试；
- 私密文件 Git 忽略检查。

部署检查：

- GitHub Pages 能直接提供静态页面；
- `member.html` 已在线可访问；
- 线上 `main.js` 包含地图导航和语言修复；
- 普通商店线上版本指向独立会员页；
- Worker 保留 `/health`。

---

## 8. 当前限制与后续工作

以下内容目前仍属于明确限制，不应在未实现时对外宣称已完成：

- 公开文章仍以 6 篇示例数据为主，需要持续加入真实内容；
- 会员商品目前由 D1 管理，但真实私有文件交付尚未接入 R2；
- 商品按钮以咨询、获取说明和边界确认为主，不是支付系统；
- 没有公开管理后台，会员日常管理使用本地 CLI；
- 没有账号密码注册系统；
- 没有会员自助找回卡密；
- 没有自动退款和自动售后系统；
- Turnstile 仍为可选能力；
- Google Apps Script 邮件发送受 Google 配额和授权状态影响；
- 首页巡航是轻量视觉模拟，不是完整驾驶游戏或真实车辆物理引擎；
- 星空内容图只映射少量重点入口；
- 中英文商品数据需要新增内容时同时维护；
- RSS 仍需在新增正式文章时同步更新；
- `sitemap.xml` 需要在新增可索引页面时同步维护；
- `member.html` 使用 `noindex,follow`，避免私享入口被当作公开商品列表索引。

推荐后续顺序：

1. 增加真实文章和真实发布日期；
2. 为会员商品建立版本和授权说明；
3. 接入 R2 私有文件与短期下载授权；
4. 补充自动化端到端测试；
5. 对首页 CSS 做下一轮体积和重复规则清理；
6. 建立正式发布版本号；
7. 每次上线同步更新本日志。

---

## 9. 日志维护规则

后续每次更新至少记录：

- 日期；
- Git commit；
- 修改页面或接口；
- 用户可见变化；
- 数据库是否迁移；
- 是否影响旧链接；
- 是否涉及 Secret；
- 执行了哪些测试；
- 当前仍未完成什么。

建议格式：

```markdown
## YYYY-MM-DD：更新名称

相关提交：

- `commit` `message`

完成内容：

- ...

兼容性：

- ...

验证：

- ...

未完成：

- ...
```

本日志不记录：

- 明文卡密；
- Token；
- Secret；
- 私有下载地址；
- 明文 IP；
- 未脱敏邮箱消息；
- 可用于绕过会员验证的内部信息。
