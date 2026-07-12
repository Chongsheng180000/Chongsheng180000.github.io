window.BLOG_POSTS = [
  {
    slug: 'restart-the-blog',
    title: '把博客重新搭起来的那天',
    titleEn: 'The Day I Rebuilt the Blog',
    category: '日常',
    categoryEn: 'Daily',
    date: '2026-07-04',
    readTime: '4 分钟',
    readTimeEn: '4 min',
    tags: ['博客', '记录', '静态站'],
    tagsEn: ['Blog', 'Notes', 'Static Site'],
    summary: '从一行占位文字开始，把站点改成能长期写下去的样子。页面只是外壳，真正难的是别让它空着。',
    summaryEn: 'Starting from one placeholder line, I rebuilt the site into something that can hold useful notes for years.',
    content: [
      {
        heading: '从一行字开始',
        paragraphs: [
          '最开始这里只有一句欢迎语。好处是没有历史包袱，坏处是也没有任何可依赖的秩序。',
          '我先把首页、文章、商品、关于和联系页拆开。结构不复杂，但每个入口都要知道自己负责什么。'
        ]
      },
      {
        heading: '为什么还是静态站',
        paragraphs: [
          '静态站够轻，GitHub Pages 能直接托管。写文章、改样式、加商品，都不需要服务器和数据库。',
          '这种限制反而让站点更稳：没有后台登录，没有支付密钥，也没有一堆迟早要维护的服务。'
        ]
      },
      {
        heading: '下一步',
        paragraphs: [
          '先把真实内容填进去。首页可以漂亮，但不能只漂亮；文章列表要慢慢长出来，商品页也要把边界写清楚。'
        ]
      }
    ],
    contentEn: [
      {
        heading: 'Starting with one line',
        paragraphs: [
          'At first, the site held a single welcome sentence. There was no history to fight, but there was no structure to rely on either.',
          'I separated the home, articles, shelf, about, and contact pages first. The structure is simple; each entrance still needs a clear job.'
        ]
      },
      {
        heading: 'Why it remains static',
        paragraphs: [
          'A static site stays light and GitHub Pages can host it directly. Writing, styling, and adding resources need no server or database.',
          'That limitation keeps the site stable: no admin login, no payment secret in the browser, and fewer services waiting to be maintained.'
        ]
      },
      {
        heading: 'What comes next',
        paragraphs: [
          'Put real material in first. The home page can be beautiful, but it cannot be only beautiful; the archive needs to grow and every shelf item needs clear boundaries.'
        ]
      }
    ]
  },
  {
    slug: 'one-button-afternoon',
    title: '一下午只修了一个按钮',
    titleEn: 'An Afternoon Spent on One Button',
    category: '随笔',
    categoryEn: 'Essay',
    date: '2026-07-03',
    readTime: '3 分钟',
    readTimeEn: '3 min',
    tags: ['界面', '耐心', '细节'],
    tagsEn: ['Interface', 'Patience', 'Detail'],
    summary: '按钮状态、焦点、触屏尺寸、暗色主题，任何一个小地方没收住，都会让页面显得很粗糙。',
    summaryEn: 'Button states, focus, touch size, and dark mode decide whether an interface feels finished or rough.',
    content: [
      {
        heading: '小东西最容易糊弄',
        paragraphs: [
          '一个按钮看起来简单，真要放到手机、桌面、暗色主题和键盘焦点里，就没那么简单。',
          '很多粗糙感不是来自大布局，而是来自这些小东西没人收尾。'
        ]
      },
      {
        heading: '界面要有脾气，但不能乱发脾气',
        paragraphs: [
          '我喜欢有一点锋利的界面。颜色可以撞一下，动效可以有一点手感，但不能让人读不下去。',
          '最后留下来的通常不是最花的方案，而是看第二遍还愿意继续用的方案。'
        ]
      }
    ],
    contentEn: [
      {
        heading: 'Small controls are easy to fake',
        paragraphs: [
          'A button looks simple until it has to work on phones, desktops, dark themes, and keyboard focus.',
          'A lot of roughness does not come from the large layout. It comes from small controls nobody finished.'
        ]
      },
      {
        heading: 'An interface can have character without noise',
        paragraphs: [
          'I like an interface with a little edge. Color can collide and motion can have weight, but neither should make reading harder.',
          'The version worth keeping is usually not the loudest one. It is the one that still feels right on the second visit.'
        ]
      }
    ]
  },
  {
    slug: 'script-boundaries',
    title: '我对脚本这件事的边界',
    titleEn: 'My Boundaries Around Scripts',
    category: '思想',
    categoryEn: 'Thought',
    date: '2026-07-02',
    readTime: '5 分钟',
    readTimeEn: '5 min',
    tags: ['脚本', '合规', '判断'],
    tagsEn: ['Scripts', 'Compliance', 'Judgment'],
    summary: '脚本可以帮人少做重复劳动，但不能拿来偷东西、破坏规则或者把风险丢给别人。',
    summaryEn: 'Scripts can remove repetitive work, but they cannot be used to steal, break rules, or pass risk to somebody else.',
    content: [
      {
        heading: '脚本不是问题，目的才是',
        paragraphs: [
          '同样是自动化，整理文件、生成配置、批量改名和绕过规则完全不是一回事。',
          '我更愿意把脚本放在学习、效率和个人自动化里。边界越早写清楚，后面越少扯皮。'
        ]
      },
      {
        heading: '不碰的部分',
        paragraphs: [
          '不做盗号、不做破解、不做外挂、不做刷量，不做需要偷取 Cookie 或绕过平台限制的东西。',
          '如果一个需求必须靠隐藏风险才能卖出去，那它不适合放在这个站点。'
        ]
      }
    ],
    contentEn: [
      {
        heading: 'The purpose matters more than the file',
        paragraphs: [
          'Organizing files, generating configs, and batch renaming are not the same as bypassing a platform rule.',
          'I keep scripts inside learning, efficiency, and personal automation. Writing the boundary early prevents arguments later.'
        ]
      },
      {
        heading: 'What I will not touch',
        paragraphs: [
          'No account theft, cracking, cheating, fake traffic, cookie theft, or tools designed to bypass platform restrictions.',
          'If a request can only be sold by hiding its risk, it does not belong on this site.'
        ]
      }
    ]
  },
  {
    slug: 'tool-list-for-myself',
    title: '给常用工具留一张清单',
    titleEn: 'A Short List for the Tools I Actually Use',
    category: '经验',
    categoryEn: 'Notes',
    date: '2026-06-30',
    readTime: '6 分钟',
    readTimeEn: '6 min',
    tags: ['效率', '工具', '清单'],
    tagsEn: ['Workflow', 'Tools', 'List'],
    summary: '工具越多越容易乱。真正有用的清单不是收藏夹，而是能解释什么时候用、什么时候不用。',
    summaryEn: 'A useful tool list is not a bookmark dump. It explains when a tool helps and when it should be left alone.',
    content: [
      {
        heading: '清单要能删',
        paragraphs: [
          '我以前很喜欢攒工具，后来发现收藏夹越长，真正打开的越少。',
          '现在更倾向于把工具分成三类：每天用、偶尔救急、看完就删。'
        ]
      },
      {
        heading: '留下使用场景',
        paragraphs: [
          '只写工具名没什么用。最好顺手记一句：它解决什么问题，在哪种情况下不用它。',
          '这比评分、排名和推荐语都可靠。'
        ]
      },
      {
        heading: '示例代码块',
        paragraphs: [
          '文章模板已经预留代码样式，后面写脚本教程时可以直接放命令。'
        ],
        code: 'Get-ChildItem -Recurse -File | Where-Object { $_.Name -like "*.md" }'
      }
    ],
    contentEn: [
      {
        heading: 'A list must allow deletion',
        paragraphs: [
          'I used to collect tools. The longer the bookmark list became, the fewer tools I actually opened.',
          'Now I sort them into three groups: daily use, occasional rescue, and remove after reading.'
        ]
      },
      {
        heading: 'Keep the use case',
        paragraphs: [
          'A tool name alone says very little. Add one sentence about the problem it solves and the situations where it should not be used.',
          'That is more reliable than a rating, a ranking, or a recommendation line.'
        ]
      },
      {
        heading: 'Code block example',
        paragraphs: [
          'The article template already includes code styling, so future script notes can place commands directly in the reading screen.'
        ],
        code: 'Get-ChildItem -Recurse -File | Where-Object { $_.Name -like "*.md" }'
      }
    ]
  },
  {
    slug: 'yi-page-at-night',
    title: '夜里写周易页面时想到的',
    titleEn: 'Notes From Building a Zhouyi Page at Night',
    category: '随笔',
    categoryEn: 'Essay',
    date: '2026-06-26',
    readTime: '4 分钟',
    readTimeEn: '4 min',
    tags: ['周易', '预测', '分寸'],
    tagsEn: ['Zhouyi', 'Reading', 'Limits'],
    summary: '预测类内容容易被说得太满。页面上要写方法，也要写限制，别把不确定包装成确定。',
    summaryEn: 'Prediction-related content is easy to overstate. The method and its limits should appear before any atmosphere.',
    content: [
      {
        heading: '先写限制',
        paragraphs: [
          '周易预测如果放到商品页，最该先写的不是神秘感，而是限制。它可以给人一个角度，不能替人承担决定。',
          '话说得太满，最后伤的是信任。'
        ]
      },
      {
        heading: '保留一点安静',
        paragraphs: [
          '我想把这类页面写得安静一点：问题、背景、起卦方式、解释和提醒，够了。',
          '不需要吓人，也不需要讨好。'
        ]
      }
    ],
    contentEn: [
      {
        heading: 'Write the limits first',
        paragraphs: [
          'If a Zhouyi reading appears on the shelf, its limits matter more than mystery. It can offer an angle; it cannot carry a decision for someone.',
          'Claims that sound too certain eventually damage trust.'
        ]
      },
      {
        heading: 'Keep the page quiet',
        paragraphs: [
          'The page only needs the question, background, method, interpretation, and reminder.',
          'It does not need to frighten or flatter anyone.'
        ]
      }
    ]
  },
  {
    slug: 'shop-without-auto-payment',
    title: '商品页先不急着接支付',
    titleEn: 'Why the Shelf Does Not Need Auto Payment Yet',
    category: '商品说明',
    categoryEn: 'Shelf Note',
    date: '2026-06-21',
    readTime: '5 分钟',
    readTimeEn: '5 min',
    tags: ['商品', '支付', '交付'],
    tagsEn: ['Shelf', 'Payment', 'Delivery'],
    summary: '静态站能展示商品，但不适合直接塞支付密钥。先把说明、咨询、交付和售后规则写明白。',
    summaryEn: 'A static site can show resources, but it should not contain payment secrets. Explain consultation, delivery, and support first.',
    content: [
      {
        heading: '静态站的好处和边界',
        paragraphs: [
          'GitHub Pages 很适合展示商品、写说明、放联系方式。但它不是后端系统，不该把真实支付密钥写进前端。',
          '前期用咨询购买更慢，但更稳，也更容易确认需求是否合规。'
        ]
      },
      {
        heading: '交付前先问清楚',
        paragraphs: [
          '买脚本和模板之前，最好说清楚系统、用途、希望达到的效果，以及不能碰的边界。',
          '这样售后少很多误会，也不会把不该接的需求接下来。'
        ]
      }
    ],
    contentEn: [
      {
        heading: 'What a static site does well',
        paragraphs: [
          'GitHub Pages is good for product descriptions and contact routes. It is not a backend and should never hold real payment credentials.',
          'Consultation is slower than automatic checkout, but it is safer and makes the intended use easier to verify.'
        ]
      },
      {
        heading: 'Ask before delivery',
        paragraphs: [
          'Before buying a script or template, describe the system, the use case, the expected result, and the boundaries that cannot be crossed.',
          'That prevents support disputes and rejects unsuitable work before it starts.'
        ]
      }
    ]
  }
];
