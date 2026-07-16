window.BLOG_PRODUCTS = [
  {
    slug: 'automation-template-pack',
    name: '合规效率脚本模板包',
    nameEn: 'Compliant Automation Script Pack',
    kind: '脚本',
    kindEn: 'Scripts',
    line: '给重复文件处理、文本整理、批量命名和本地自动化留一套干净模板。',
    lineEn: 'Clean templates for local file handling, text cleanup, batch renaming, and personal automation.',
    fit: '适合经常整理资料、维护小项目、想学脚本但不想从空文件开始的人。',
    fitEn: 'For people who organize material often and want a safer starting point for scripts.',
    includes: ['PowerShell / JavaScript 基础模板', '常见任务示例', '安全边界说明', '可改配置文件'],
    includesEn: ['PowerShell / JavaScript base templates', 'Common task examples', 'Boundary notes', 'Editable config files'],
    status: '可咨询',
    statusEn: 'Available to discuss',
    price: '价格待定',
    priceEn: 'TBD',
    method: '联系购买',
    methodEn: 'Contact to purchase'
  },
  {
    slug: 'static-blog-starter',
    name: '个人博客静态站模板',
    nameEn: 'Personal Static Blog Starter',
    kind: '模板',
    kindEn: 'Templates',
    line: '纯 HTML、CSS、JavaScript，可直接放到 GitHub Pages 的个人站模板。',
    lineEn: 'A pure HTML, CSS, and JavaScript starter that can be hosted directly on GitHub Pages.',
    fit: '适合想要轻量博客、不要后端、不要复杂构建流程的人。',
    fitEn: 'For people who want a light blog without a backend or build pipeline.',
    includes: ['首页与文章页', '主题切换', '前端搜索', 'SEO 基础文件', '部署说明'],
    includesEn: ['Home and article pages', 'Theme switching', 'Frontend search', 'SEO files', 'Deployment notes'],
    status: '开发中',
    statusEn: 'In progress',
    price: '预留',
    priceEn: 'Reserved',
    method: '咨询进度',
    methodEn: 'Ask for status'
  },
  {
    slug: 'yi-reading',
    name: '周易预测',
    nameEn: 'Zhouyi Reading',
    kind: '咨询',
    kindEn: 'Consulting',
    line: '围绕具体问题做记录式解读，强调参考价值和限制，不承诺结果。',
    lineEn: 'A record-style reading around a concrete question, with limits stated clearly and no promised outcome.',
    fit: '适合想要换一个角度整理问题、但能自己做决定的人。',
    fitEn: 'For people who want another angle while still making their own decisions.',
    includes: ['问题背景整理', '起卦记录', '解释文本', '风险提醒'],
    includesEn: ['Question framing', 'Reading record', 'Interpretation text', 'Risk reminder'],
    status: '可咨询',
    statusEn: 'Available to discuss',
    price: '按次沟通',
    priceEn: 'Per request',
    method: '联系咨询',
    methodEn: 'Contact for details'
  },
  {
    slug: 'acl-collab',
    name: 'ACL 项目合作',
    nameEn: 'ACL Project Collaboration',
    kind: '咨询',
    kindEn: 'Consulting',
    line: '公开资料整理、页面呈现、脚本自动化和项目说明协作，不代写、不伪造。',
    lineEn: 'Public-material organization, presentation pages, script automation, and project documentation without ghostwriting or fabrication.',
    fit: '适合需要把已有材料梳理成清晰页面或工具流程的个人项目。',
    fitEn: 'For personal projects that need existing material organized into a clear page or workflow.',
    includes: ['材料结构梳理', '静态展示页', '脚本辅助整理', '交付边界确认'],
    includesEn: ['Material structure', 'Static presentation page', 'Script-assisted organization', 'Delivery boundary review'],
    status: '可咨询',
    statusEn: 'Available to discuss',
    price: '按范围估价',
    priceEn: 'Scoped quote',
    method: '先聊需求',
    methodEn: 'Discuss the request'
  },
  {
    slug: 'tool-tutorial-pack',
    name: '工具使用教程包',
    nameEn: 'Practical Tool Tutorial Pack',
    kind: '教程',
    kindEn: 'Tutorials',
    line: '把常用工具的安装、配置、排错和实际用法写成短教程。',
    lineEn: 'Short tutorials for installing, configuring, debugging, and actually using common tools.',
    fit: '适合不想翻长文档，只想把工具跑起来并理解关键设置的人。',
    fitEn: 'For people who want to get a tool running and understand the important settings without reading a long manual.',
    includes: ['图文步骤', '常见错误', '配置样例', '更新记录'],
    includesEn: ['Illustrated steps', 'Common errors', 'Configuration samples', 'Update notes'],
    status: '开发中',
    statusEn: 'In progress',
    price: '预留',
    priceEn: 'Reserved',
    method: '咨询目录',
    methodEn: 'Ask for the outline'
  },
  {
    slug: 'game-log-helper',
    name: '游戏记录整理脚本',
    nameEn: 'Game Session Archive Helper',
    kind: '脚本',
    kindEn: 'Scripts',
    line: '整理截图、对局记录和本地备注，不改客户端，不读内存，不影响对局。',
    lineEn: 'Organizes screenshots, match records, and local notes without modifying the client, reading memory, or affecting play.',
    fit: '适合想复盘、归档和整理素材的普通玩家或内容记录者。',
    fitEn: 'For ordinary players and creators who want to review and archive their own material.',
    includes: ['文件归档规则', '命名模板', '本地备注格式', '使用限制说明'],
    includesEn: ['Archive rules', 'Naming templates', 'Local note format', 'Use limitations'],
    status: '开发中',
    statusEn: 'In progress',
    price: '预留',
    priceEn: 'Reserved',
    method: '咨询开放时间',
    methodEn: 'Ask for availability'
  }
];

window.BLOG_PRODUCT_CATEGORIES = [
  { key: '脚本', en: 'Scripts', code: 'SCR', desc: '把重复操作收进本地流程，配置清楚，边界先写明。', descEn: 'Local automation for repetitive work, with clear configuration and boundaries.' },
  { key: '模板', en: 'Templates', code: 'TPL', desc: '能直接改、直接部署的静态页面与内容骨架。', descEn: 'Editable static page and content structures ready for deployment.' },
  { key: '教程', en: 'Tutorials', code: 'TUT', desc: '少绕弯路，把安装、配置、排错和交付写清楚。', descEn: 'Direct guides for setup, configuration, debugging, and delivery.' },
  { key: '咨询', en: 'Consulting', code: 'CON', desc: '先确认问题和边界，再决定是否值得继续做。', descEn: 'Clarify the problem and boundaries before deciding what to build.' },
  { key: '资源包', en: 'Resource Packs', code: 'RES', desc: '整理好的可复用文件，不把零散素材混成压缩包。', descEn: 'Curated reusable files instead of an unstructured archive.' },
  { key: '配置', en: 'Configurations', code: 'CFG', desc: '保留解释和回退方式的环境配置方案。', descEn: 'Environment configurations with explanations and rollback notes.' },
  { key: '素材', en: 'Assets', code: 'AST', desc: '为个人站、文章和工具界面准备的克制视觉素材。', descEn: 'Restrained visual assets for personal sites, articles, and tools.' },
  { key: '工作流', en: 'Workflows', code: 'FLW', desc: '从开始到交付都能看懂的个人工作流程。', descEn: 'Readable personal workflows from first step to delivery.' },
  { key: '项目合作', en: 'Projects', code: 'PRJ', desc: '适合边界明确、材料真实、可以静态落地的小项目。', descEn: 'Small projects with clear scope, real materials, and static delivery.' },
  { key: '预测', en: 'Readings', code: 'YI', desc: '记录式参考，不承诺结果，不替任何人做决定。', descEn: 'Recorded references without promises or decisions made for others.' },
  { key: '其他', en: 'Other', code: 'ETC', desc: '暂时放不进固定抽屉，但用途仍然说得清楚。', descEn: 'Useful items that do not yet belong in a fixed drawer.' }
];

const productProfiles = {
  '脚本': {
    fit: '适合希望减少本地重复操作，同时保留人工确认步骤的人。',
    fitEn: 'For people reducing repetitive local work while keeping manual review.',
    includes: ['可读源文件', '示例配置', '使用说明', '安全与回退说明'],
    includesEn: ['Readable source files', 'Example config', 'Usage notes', 'Safety and rollback notes'],
    status: '可咨询', statusEn: 'Available', price: '按内容确认', priceEn: 'Scoped', method: '咨询脚本', methodEn: 'Ask about script'
  },
  '模板': {
    fit: '适合想从可靠骨架开始，再按自己的内容和审美修改的人。',
    fitEn: 'For people who want a reliable base and will adapt it to their own content.',
    includes: ['页面骨架', '响应式样式', '修改说明', '部署检查表'],
    includesEn: ['Page structure', 'Responsive styles', 'Editing notes', 'Deploy checklist'],
    status: '可咨询', statusEn: 'Available', price: '版本待定', priceEn: 'By edition', method: '查看版本', methodEn: 'View editions'
  },
  '教程': {
    fit: '适合希望先把工具跑通，再理解关键配置和常见错误的人。',
    fitEn: 'For people who want a working setup before studying key configuration and errors.',
    includes: ['图文步骤', '配置示例', '常见错误', '复查清单'],
    includesEn: ['Illustrated steps', 'Config examples', 'Common errors', 'Review checklist'],
    status: '整理中', statusEn: 'In preparation', price: '目录预览', priceEn: 'Outline preview', method: '咨询目录', methodEn: 'Ask for outline'
  },
  '咨询': {
    fit: '适合已有具体材料和目标，需要一起梳理结构、边界或实现路径的人。',
    fitEn: 'For people with concrete material and goals who need help with scope or implementation.',
    includes: ['需求确认', '范围拆分', '风险提醒', '书面建议'],
    includesEn: ['Request review', 'Scope breakdown', 'Risk notes', 'Written advice'],
    status: '可预约', statusEn: 'By appointment', price: '按范围估价', priceEn: 'Scoped quote', method: '预约沟通', methodEn: 'Request a session'
  },
  '资源包': {
    fit: '适合需要一套统一、可修改、来源和用途都清楚的基础资源。',
    fitEn: 'For people who need a consistent, editable set with clear origin and use.',
    includes: ['源文件', '导出版本', '使用许可说明', '目录索引'],
    includesEn: ['Source files', 'Exported versions', 'License notes', 'File index'],
    status: '可咨询', statusEn: 'Available', price: '版本待定', priceEn: 'By edition', method: '查看内容', methodEn: 'Review contents'
  },
  '配置': {
    fit: '适合希望快速建立环境，同时知道每一项设置为什么存在的人。',
    fitEn: 'For people who want a quick setup and an explanation for every important choice.',
    includes: ['配置文件', '逐项说明', '导入步骤', '恢复默认方法'],
    includesEn: ['Config files', 'Setting notes', 'Import steps', 'Reset instructions'],
    status: '测试中', statusEn: 'Testing', price: '预留', priceEn: 'Reserved', method: '咨询兼容性', methodEn: 'Check compatibility'
  },
  '素材': {
    fit: '适合想统一界面质感，但不希望使用浮夸现成套件的个人项目。',
    fitEn: 'For personal projects needing a consistent visual language without flashy kits.',
    includes: ['多尺寸文件', '颜色变量', '使用示例', '授权边界'],
    includesEn: ['Multiple sizes', 'Color variables', 'Usage examples', 'License boundaries'],
    status: '可咨询', statusEn: 'Available', price: '按包确认', priceEn: 'By pack', method: '预览素材', methodEn: 'Preview assets'
  },
  '工作流': {
    fit: '适合经常重复同一类项目，希望减少遗漏和返工的人。',
    fitEn: 'For people repeating similar projects who want fewer omissions and rework.',
    includes: ['流程图', '检查清单', '文件结构', '复盘模板'],
    includesEn: ['Flow map', 'Checklist', 'File structure', 'Review template'],
    status: '可咨询', statusEn: 'Available', price: '按流程确认', priceEn: 'By workflow', method: '查看流程', methodEn: 'Review workflow'
  },
  '项目合作': {
    fit: '适合目标清楚、内容真实、能够用静态页面或轻量脚本完成的项目。',
    fitEn: 'For clear, authentic projects suitable for static pages or lightweight scripts.',
    includes: ['范围确认', '结构原型', '实现与测试', '交付说明'],
    includesEn: ['Scope review', 'Structure prototype', 'Build and testing', 'Delivery notes'],
    status: '开放沟通', statusEn: 'Open to discuss', price: '单独估价', priceEn: 'Custom quote', method: '提交需求', methodEn: 'Send request'
  },
  '预测': {
    fit: '适合需要换一个角度整理问题，同时愿意自己承担决定的人。',
    fitEn: 'For people seeking another perspective while retaining responsibility for decisions.',
    includes: ['问题整理', '过程记录', '参考解读', '限制说明'],
    includesEn: ['Question framing', 'Process record', 'Reference reading', 'Limits'],
    status: '可预约', statusEn: 'By appointment', price: '按次沟通', priceEn: 'Per request', method: '预约记录', methodEn: 'Request a reading'
  },
  '其他': {
    fit: '适合用途具体、范围不大，但暂时不属于固定商品类型的需求。',
    fitEn: 'For small, concrete needs that do not fit an established category yet.',
    includes: ['用途确认', '内容清单', '边界说明', '交付记录'],
    includesEn: ['Use review', 'Content list', 'Boundary notes', 'Delivery record'],
    status: '试开放', statusEn: 'Limited release', price: '单独确认', priceEn: 'Confirmed individually', method: '先聊用途', methodEn: 'Discuss use first'
  }
};

const additionalProductSeeds = [
  ['folder-snapshot', '文件夹快照与差异脚本', 'Folder Snapshot & Diff Script', '脚本', 'Scripts', '记录目录变化并输出可读差异，适合交付前后核对文件。', 'Records directory changes and produces a readable diff for delivery checks.'],
  ['image-batch', '图片批量整理脚本', 'Image Batch Organizer', '脚本', 'Scripts', '按尺寸、日期和用途整理本地图片，并生成处理清单。', 'Sorts local images by size, date, and purpose with a processing log.'],
  ['text-cleaner', '文本清洗工具脚本', 'Text Cleanup Utility', '脚本', 'Scripts', '统一空格、换行、标点和常见乱码前的文本检查流程。', 'Normalizes spacing, line breaks, punctuation, and preflight checks for text issues.'],
  ['backup-rotation', '本地备份轮换脚本', 'Local Backup Rotation Script', '脚本', 'Scripts', '按保留周期轮换个人项目备份，默认只预览不删除。', 'Rotates personal project backups by retention period, previewing before deletion.'],
  ['csv-merge', '表格合并检查脚本', 'CSV Merge & Review Script', '脚本', 'Scripts', '合并字段一致的表格文件，并单独列出异常行。', 'Merges compatible tables and lists exceptional rows separately.'],
  ['markdown-index', 'Markdown 目录索引脚本', 'Markdown Index Builder', '脚本', 'Scripts', '扫描本地笔记并生成按目录、标签和日期整理的索引。', 'Builds an index of local notes by folder, tag, and date.'],
  ['download-sorter', '下载目录归档脚本', 'Downloads Archive Script', '脚本', 'Scripts', '把下载文件按规则移入待处理区，不自动清空原始记录。', 'Moves downloads into review folders without silently deleting source records.'],
  ['log-summary', '本地日志摘要脚本', 'Local Log Summary Script', '脚本', 'Scripts', '从普通文本日志中提取时间、错误和重复事件。', 'Extracts timestamps, errors, and repeated events from plain-text logs.'],
  ['local-watch', '项目文件变更提醒脚本', 'Project Change Watcher', '脚本', 'Scripts', '监视指定目录并写入本地变更记录，不上传任何文件。', 'Watches selected folders and writes a local change record without uploads.'],
  ['project-bootstrap', '静态项目初始化脚本', 'Static Project Bootstrap Script', '脚本', 'Scripts', '生成轻量静态项目目录、基础页面和检查清单。', 'Creates a lightweight static project structure, base pages, and checklist.'],

  ['reading-blog-theme', '中文长文阅读模板', 'Chinese Longform Reading Template', '模板', 'Templates', '为中文长文准备稳定行宽、目录、引用和代码样式。', 'A stable longform layout for Chinese text, contents, quotes, and code.'],
  ['portfolio-one-page', '个人作品单页模板', 'One-page Portfolio Template', '模板', 'Templates', '用一页说明做过什么、目前状态和联系边界。', 'A single page for work, current status, and contact boundaries.'],
  ['docs-static-kit', '静态说明文档模板', 'Static Documentation Kit', '模板', 'Templates', '适合小工具和资源包的说明、版本记录与常见问题。', 'Documentation, version notes, and FAQ structure for small tools and packs.'],
  ['product-showcase', '数字商品展示模板', 'Digital Product Showcase Template', '模板', 'Templates', '只做展示、咨询和交付说明，不包含支付密钥。', 'A display and inquiry template without payment credentials.'],
  ['personal-dashboard', '个人状态面板模板', 'Personal Status Panel Template', '模板', 'Templates', '把项目、文章和待办收进一个轻量本地面板。', 'Collects projects, writing, and tasks in a lightweight local panel.'],
  ['changelog-template', '版本更新记录模板', 'Changelog Template', '模板', 'Templates', '让更新内容、兼容变化和已知问题保持清楚。', 'Keeps releases, compatibility changes, and known issues clear.'],
  ['knowledge-index', '个人知识索引模板', 'Personal Knowledge Index', '模板', 'Templates', '按主题和时间串起本地文章、笔记与资源。', 'Connects local articles, notes, and resources by topic and time.'],
  ['launch-checklist', '静态站发布检查模板', 'Static Site Launch Checklist', '模板', 'Templates', '发布前集中检查链接、SEO、移动端和资源体积。', 'Checks links, SEO, mobile layout, and asset weight before launch.'],
  ['contact-page-kit', '克制联系页模板', 'Restrained Contact Page Kit', '模板', 'Templates', '把联系方式、合作范围和免责声明放在同一页面。', 'Places contact channels, collaboration scope, and disclaimers together.'],
  ['archive-template', '时间归档页面模板', 'Timeline Archive Template', '模板', 'Templates', '按年份、分类和标签浏览静态内容。', 'Browses static content by year, category, and tag.'],

  ['github-pages-deploy', 'GitHub Pages 部署短课', 'GitHub Pages Deployment Guide', '教程', 'Tutorials', '从仓库设置到域名、缓存和发布失败排查。', 'Covers repository settings, domains, caching, and failed deployments.'],
  ['powershell-basics', 'PowerShell 本地自动化入门', 'PowerShell Local Automation Basics', '教程', 'Tutorials', '从安全预览、路径处理到批量任务的基础用法。', 'Introduces safe previews, path handling, and batch tasks.'],
  ['git-rescue', 'Git 常见失误恢复指南', 'Git Recovery Guide', '教程', 'Tutorials', '处理误提交、冲突和分支混乱，避免使用破坏性命令。', 'Handles bad commits, conflicts, and branch confusion without destructive shortcuts.'],
  ['static-seo', '静态站 SEO 基础教程', 'Static Site SEO Basics', '教程', 'Tutorials', '整理标题、描述、站点地图、分享卡片和规范链接。', 'Explains titles, descriptions, sitemaps, social cards, and canonicals.'],
  ['frontend-search', '前端静态搜索教程', 'Frontend Static Search Guide', '教程', 'Tutorials', '用结构化数据实现标题、摘要、标签和商品搜索。', 'Builds structured search across titles, summaries, tags, and products.'],
  ['css-theme', '昼夜主题变量教程', 'Day & Night Theme Tokens', '教程', 'Tutorials', '用 CSS 变量做可维护的昼夜配色和状态过渡。', 'Uses CSS variables for maintainable day/night palettes and transitions.'],
  ['local-automation', '个人自动化边界教程', 'Personal Automation Boundaries', '教程', 'Tutorials', '区分效率脚本、危险操作和不该自动化的部分。', 'Separates useful automation from risky operations and unsuitable tasks.'],
  ['markdown-writing', 'Markdown 长文整理教程', 'Markdown Longform Workflow', '教程', 'Tutorials', '建立标题、图片、引用、代码和发布前检查习惯。', 'Establishes habits for headings, images, quotes, code, and preflight review.'],
  ['browser-debug', '浏览器页面排错教程', 'Browser Page Debugging Guide', '教程', 'Tutorials', '用开发者工具定位溢出、报错、缓存和交互问题。', 'Uses developer tools to diagnose overflow, errors, caching, and interactions.'],
  ['backup-guide', '个人项目备份教程', 'Personal Project Backup Guide', '教程', 'Tutorials', '说明版本库、离线备份和恢复演练各自负责什么。', 'Explains the roles of version control, offline backups, and restore drills.'],

  ['site-structure-review', '个人站结构审查', 'Personal Site Structure Review', '咨询', 'Consulting', '检查信息层级、入口、内容密度和移动端路径。', 'Reviews hierarchy, entry points, content density, and mobile paths.'],
  ['static-migration', '旧站静态迁移梳理', 'Legacy Site Static Migration', '咨询', 'Consulting', '评估旧链接、内容映射和无后端迁移方案。', 'Reviews old links, content mapping, and backend-free migration options.'],
  ['workflow-review', '个人工作流审查', 'Personal Workflow Review', '咨询', 'Consulting', '找出反复返工、文件失控和不必要自动化的位置。', 'Finds rework, file sprawl, and unnecessary automation.'],
  ['script-scope', '脚本需求边界梳理', 'Script Scope Review', '咨询', 'Consulting', '先判断能否合法、安全、稳定地用脚本解决。', 'Determines whether a script can solve the request lawfully and safely.'],
  ['resource-packaging', '数字资源打包建议', 'Digital Resource Packaging', '咨询', 'Consulting', '整理目录、版本、授权、交付和售后说明。', 'Organizes folders, versions, licensing, delivery, and support notes.'],
  ['content-architecture', '博客内容架构咨询', 'Blog Content Architecture', '咨询', 'Consulting', '梳理栏目、标签、归档和首页内容优先级。', 'Structures sections, tags, archives, and homepage priorities.'],
  ['frontend-polish', '前端质感审查', 'Frontend Finish Review', '咨询', 'Consulting', '检查排版、状态、响应式、动效和视觉一致性。', 'Reviews typography, states, responsiveness, motion, and consistency.'],
  ['deployment-troubleshooting', '静态部署排错咨询', 'Static Deployment Troubleshooting', '咨询', 'Consulting', '定位 Pages、缓存、路径和资源加载问题。', 'Diagnoses Pages, caching, path, and asset loading issues.'],
  ['project-boundary', '小项目交付边界确认', 'Small Project Boundary Review', '咨询', 'Consulting', '把范围、交付物、修改次数和不包含项写明。', 'Clarifies scope, deliverables, revision count, and exclusions.'],
  ['digital-shelf-planning', '数字货架规划咨询', 'Digital Shelf Planning', '咨询', 'Consulting', '判断哪些内容适合展示、咨询、出售或只留记录。', 'Decides what should be displayed, discussed, sold, or kept as a note.'],

  ['office-icon-pack', '克制办公图标资源包', 'Restrained Office Icon Pack', '资源包', 'Resource Packs', '一组适合个人工具和静态站的低噪声线性图标。', 'A low-noise line icon set for personal tools and static sites.'],
  ['article-cover-kit', '文章封面构图资源包', 'Article Cover Composition Kit', '资源包', 'Resource Packs', '提供可替换文字和配色的横竖版封面骨架。', 'Landscape and portrait cover structures with editable text and colors.'],
  ['ui-texture-pack', '深色界面纹理资源包', 'Dark Interface Texture Pack', '资源包', 'Resource Packs', '皮革、磨砂玻璃和暗木纹的轻量网页纹理。', 'Lightweight leather, smoked glass, and dark walnut web textures.'],

  ['windows-efficiency-config', 'Windows 效率配置包', 'Windows Efficiency Configuration', '配置', 'Configurations', '整理常用目录、终端别名和本地工作区设置。', 'Organizes common folders, terminal aliases, and local workspace settings.'],
  ['vscode-writing-config', 'VS Code 写作配置包', 'VS Code Writing Configuration', '配置', 'Configurations', '为 Markdown、中文标点和长文编辑准备的轻量配置。', 'A light setup for Markdown, Chinese punctuation, and longform editing.'],
  ['static-seo-config', '静态站 SEO 配置包', 'Static SEO Configuration Pack', '配置', 'Configurations', '提供 robots、sitemap、RSS 和分享信息的配置样例。', 'Samples for robots, sitemap, RSS, and sharing metadata.'],

  ['black-gold-textures', '黑金界面背景纹理', 'Black & Gold Interface Textures', '素材', 'Assets', '适合控制台、封面和产品说明的小尺寸背景纹理。', 'Compact background textures for consoles, covers, and product notes.'],
  ['chinese-type-snippets', '中文排版样式片段', 'Chinese Typography Snippets', '素材', 'Assets', '整理标题、正文、引用、代码和目录的 CSS 片段。', 'CSS snippets for headings, body text, quotes, code, and contents.'],
  ['console-status-icons', '控制台状态图标集', 'Console Status Icon Set', '素材', 'Assets', '一组清晰表达运行、暂停、提醒和边界的状态图标。', 'Status icons for running, paused, notice, and boundary states.'],

  ['article-publishing-flow', '文章发布工作流', 'Article Publishing Workflow', '工作流', 'Workflows', '从草稿、校对、图片到 RSS 更新的完整检查流程。', 'A complete flow from draft and proofing to images and RSS updates.'],
  ['material-archive-flow', '资料归档工作流', 'Material Archive Workflow', '工作流', 'Workflows', '按来源、日期、用途和保留期限整理个人资料。', 'Archives personal material by source, date, purpose, and retention.'],
  ['small-project-delivery-flow', '小项目交付工作流', 'Small Project Delivery Workflow', '工作流', 'Workflows', '把需求、版本、测试和交付记录放进同一条流程。', 'Keeps requests, versions, tests, and delivery records in one flow.'],

  ['personal-site-collab', '个人站联合改造', 'Personal Site Collaboration', '项目合作', 'Projects', '围绕真实内容重构静态个人站的结构和视觉。', 'Reworks a static personal site around authentic content and structure.'],
  ['static-tool-page-collab', '静态工具页合作', 'Static Tool Page Collaboration', '项目合作', 'Projects', '把本地小工具整理成可说明、可下载的静态页面。', 'Turns a local utility into a clear static page with download guidance.'],
  ['content-product-collab', '内容产品落地合作', 'Content Product Delivery', '项目合作', 'Projects', '整理教程或资源包的页面、说明、版本和交付边界。', 'Packages tutorials or resources with pages, versions, and delivery limits.'],

  ['yi-single-question', '周易单题记录', 'Single-question Zhouyi Record', '预测', 'Readings', '围绕一个具体问题保留过程、解释和限制说明。', 'Records process, interpretation, and limits around one concrete question.'],
  ['phase-rhythm-reading', '阶段节奏梳理', 'Phase Rhythm Reading', '预测', 'Readings', '用时间与变化视角整理当前阶段，不作结果保证。', 'Reviews a current phase through timing and change without promising outcomes.'],
  ['choice-comparison-reading', '选择对照解读', 'Choice Comparison Reading', '预测', 'Readings', '把两个选项分开记录，提供参考，不代替现实判断。', 'Records two options separately as a reference, not a substitute for judgment.'],

  ['request-list-cleanup', '需求清单整理', 'Request List Cleanup', '其他', 'Other', '把零散想法整理成能讨论、能估时的简短清单。', 'Turns scattered ideas into a concise list suitable for discussion and estimation.'],
  ['digital-file-checkup', '数字文件体检', 'Digital File Checkup', '其他', 'Other', '检查命名、重复文件、目录层级和备份缺口。', 'Checks naming, duplicate files, folder structure, and backup gaps.'],
  ['experimental-mini-tool', '试验性小工具', 'Experimental Mini Utility', '其他', 'Other', '为范围明确的小需求制作一次性轻量原型。', 'Builds a lightweight one-off prototype for a narrowly scoped need.']
];

window.BLOG_PRODUCTS.push(...additionalProductSeeds.map(([slug, name, nameEn, kind, kindEn, line, lineEn]) => {
  const profile = productProfiles[kind];
  return {
    slug,
    name,
    nameEn,
    kind,
    kindEn,
    line,
    lineEn,
    fit: profile.fit,
    fitEn: profile.fitEn,
    includes: [...profile.includes],
    includesEn: [...profile.includesEn],
    status: profile.status,
    statusEn: profile.statusEn,
    price: profile.price,
    priceEn: profile.priceEn,
    method: profile.method,
    methodEn: profile.methodEn
  };
}));
