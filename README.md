🌌 Gravity Space Brawler (引力太空乱斗)一个基于纯物理驱动的局域网双人硬核太空对战游戏。  
本项目后端采用 FastAPI + WebSockets，前端使用 HTML5 Canvas + 原生 JavaScript 构建。主打“免安装、零延迟、纯粹的物理博弈”  
✨ 核心特性 (Features)  
🚀 纯物理引擎驱动：游戏抛弃了传统的街机移动模式，核心机制建立在严格的经典力学与电磁学模拟之上：万有引力 ($F = G \frac{Mm}{r^2}$)：中心恒星持续拉扯，利用引力弹弓实现不可思议的绕后射击。洛伦兹力星云 ($F = qv \times B$)：穿过特定电磁异常区时，飞船会受到与速度垂直的偏转力，导致失控螺旋。真实惯性与阻尼：完美的太空漂移手感，考验极致的微操。  
⚔️ 派对大乱斗机制：3 条命淘汰制，谁能笑到最后？  
🎁 盲盒大招系统 (Ultimate Roulette)：地图随机掉落技能包，拾取后解锁毁天灭地的终极武器：EMP_BURST：360度全方位电磁脉冲弹幕。DEATH_RAY：无视引力、瞬间贯穿全屏的红色死亡射线。GOD_MODE：10秒绝对无敌 + 1.5倍推力，化身太空推土机。  
🪐 动态交互地形：可反弹子弹的小行星带、附带致命辐射圈的等离子彗星，以及会无差别攻击的远古外星堡垒。  
📁 项目结构 (Architecture)经过模块化重构，项目保持了极高的可读性与扩展性：PlaintextSpaceWar/
├── main.py                 # FastAPI 启动入口与静态文件路由
├── server/                 # 后端核心逻辑
│   ├── config.py           # 物理常量、大招参数与全局配置
│   ├── entities.py         # 飞船、子弹、地形等实体数据类
│   ├── physics_engine.py   # 60Hz 物理演算、碰撞检测与射线判定
│   └── connection_manager.py # WebSocket 状态同步与广播
├── static/                 # 前端资源
│   ├── style.css           # 界面样式与 UI 布局
│   ├── game.js             # 网络通信与主游戏循环
│   ├── renderer.js         # Canvas 渲染逻辑（飞船、地形、死亡射线）
│   └── particles.js        # 引擎尾焰与爆炸粒子系统
├── index.html              # 游戏大厅与画布容器
└── .gitignore              # Git 忽略配置
🛠️ 快速启动 (Quick Start)1. 配置 Python 环境确保你的电脑上安装了 Python 3.8+
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate
2. 安装依赖Bashpip install "fastapi[standard]"
3. 启动服务器Bashuvicorn main:app --host 0.0.0.0 --port 8000
(注意：请确保防火墙已放行 8000 端口)🎮 游玩指南 (How to Play)加入游戏：服务器启动后，主机与同一局域网下的好友打开浏览器，访问 http://<主机局域网IP>:8000 即可自动分配 P1 和 P2。操作说明：W / ↑ : 推进器点火 (Thrust)A / D 或 ← / → : 旋转飞船 (Rotate)Space : 发射常规主炮 (Fire)E / Shift : 释放终极技能 (Ultimate - 需要拾取技能包)
