🌌 Gravity Space Brawler (引力太空乱斗)

基于 FastAPI (WebSockets) + HTML5 Canvas 构建的局域网双人硬核物理对战游戏。

✨ 核心玩法

纯物理驱动：包含中心恒星万有引力、洛伦兹力星云偏转、拟真太空惯性漂移。

盲盒大招：抢夺技能包释放 360度电磁脉冲、全屏死亡射线 或 10秒天神下凡。

派对乱斗：3条命淘汰制，结合小行星障碍与高伤彗星，策略与微操并存。

🚀 快速启动

安装核心依赖 (需 Python 3.8+):

pip install "fastapi[standard]"


启动本地服务器:

uvicorn main:app --host 0.0.0.0 --port 8000


(注：需在 Windows 防火墙中放行 8000 端口)

加入游戏:

P1 (主机): 浏览器访问 http://localhost:8000 或 http://127.0.0.1:8000

P2 (好友): 连接同一校园网/Wi-Fi，浏览器访问 http://<主机局域网IP>:8000

🎮 操作说明

W / ↑ : 推进点火

A / D 或 ← / → : 旋转飞船

Space : 发射主炮

E / Shift : 释放大招 (需拾取随机掉落的技能包)
