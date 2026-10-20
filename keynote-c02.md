
# Jeremy Lu

- jeremy@twmug.com (來信記得提到你是上過課的學員，我會優先回信)

- 講義

	- https://github.com/coodoo/cccourse

- agentflow 開源網址

	- https://github.com/agfnow/aglite

	- https://github.com/agfnow/agentflow

	- 歡迎開票回報問題與建議

- AI 取暖會

	- https://www.youtube.com/@tw.aiagent

	- 不定期舉辦 AI 新知學習聚會，網站上也提供過往活動錄影課程

/* 基本概念
-------------------------------------------------- */

# agentflow 高層次概念

	- 直接用 coding agent 無腦 one shot 做 vibe coding 至少也有 80 分

		- 但恐怖的是不知剩下 20 分會爛在哪裏

		- agentflow 幫你補完不足之處

	- LLM 能力只會越來越強

		- ag 的角色是協助 LLM 盡情發揮它最大能力(思考、計畫、執行、審查、除錯)

		- 但又能在旁監督與確保它不出錯

			- 例如妥善管理 context 以減少 context rot 跟 attention drift (失智與錯亂)

			- 強迫建立 design.md 與 tracker.md 讓開發過程變的可視化(observability)

			- 留下永久開發記錄(devlog.md)供事後審查與追蹤

	- ag 本質上只是一個 toolbox

		- Spring Boot → Java / Rails → Ruby / Typescript → JS

			- coding agent, minus the footguns.

			- intelligence + discipline

		- 將原本要個別去學的技巧預先整合到一堆 skills 內

		- 並且能在背景自動發功，因此人類不用特別學也不怕忘記用

		- 最快學習方式是直接問 agent 怎麼用 agentflow

	- 俱體亮點

		- devlog 保存開發記錄

		- 一律委派 subagent 做事 → 節省 host 成本，也避免 context 污染

		- `對抗式審查`以增加除錯機率(且可在 subagent 做，也可呼叫第三方 agent)

		- 3ways 交差詰辯做計畫更縝密，成功率大增至少 80%

		- SDD 十大步驟(advisors)內建其中並自動啟用

		- 大幅減少產出文件數量，只留真正精華(design/tracker/devlog)

		- 只要學會 `/clear` + `godev` 兩指令就能確保成功！

# `許願、監工、驗收` 是 agentic coding 黃金三步驟

	# 許願

		- 心法：第五代大模型超聰明，能力早已遠超過人類，因此只要把話講清楚，通常就有不錯成果

		- 在 devlog 內清楚寫下你的願望

			- 想做的事、希望達成的目標、預期的驗收條件、任何你能想到的細節

		- agentflow 可能會多輪訪談你更多問題以釐清需求並產生最終 design.md

		- agent 規畫完後產生 design.md 內含三大亮點

			- invariants (本次開發目標)

			- acceptance criteria (ac, 驗收條件)

			- validation (驗證方式)

				→ Exactly how the agent proves completion

	# 監工

		- 仔細審查 design.md 內 invariants/ac/validation 是否符合預期，有錯就要立即與 agent 來回討論直到滿意才允許開工

		- tracker.md 提供完整施工藍圖與進度表跟施作結果

		- devlog [RUN]/[WIP] 提供即時施工進度

		- devlog Reply 提供施工結果與問題列表

	# 驗收

		- 依 design.md 在`許願`時規畫 design.md 內的 invariants, ac, validation 逐項進行驗收，一項不符就退回重做直到改好

		- 也核對 `sys-invariants.md` 確保程式的整體家規仍然成立

# 起手式範例

	# 先在 cc 移除 agentflow 並安裝 aglite

	# 建立工作 repo

		- git init repo

	# 進入 claude code 打 `godev` 初始化專案

		- claude 模型分四級，建議用 opus/low 或 sonnet/medium

			- haiku

			- sonnet/medium

			- opus/low

			- fable

		- reasoning effort 分五級

			- low / medium / high / xhigh / max

		- 看建立的檔案與目錄

		- ag.json 語系設為 zh-tw

/* 舊專案開發流程(brownfield vs. greenfield)
-------------------------------------------------- */

# 八大開發步驟

	每個階段皆遵循：**情境 → 示範 → 實作 → 驗收**。重點不只是產出文件，而是理解每道檢查關卡的目的。若後續發現新證據，可返回前面階段修正。

	1. 探索現有系統

		情境：要新增`折扣碼`功能，卻缺乏可靠的系統架構文件。

		示範：追蹤 HTTP 訂單請求，了解路由、計價、資料儲存、付款與報表流程。檢查程式入口、相依套件、測試、資料庫結構及近期異動。只探索與功能相關的範圍。

		實作：畫出請求與資料流，找出測試指令，列出未知問題及相關程式位置。

		驗收：其他學員能循線找到價格、實際收款、庫存及報表的資料來源。缺乏證據的推論須標記為「待確認」。

	2. 還原業務邏輯

		情境：文件不完整，看似簡單的計算可能隱藏重要規則。

		示範：交叉比對文件、原始碼與實際執行結果。區分「已觀察」、「推論」及「業務方確認」的規則。除了正常訂單，也要追蹤取消與退款流程。

		實作：建立精簡的規則清單，記錄證據、矛盾及需要業務方回答的問題。

		驗收：重要規則都有證據來源，或明確標示不確定性。Agent 不得將自己的推測當成業務方核准。

	3. 分析變更影響

		情境：小小的折扣計算，可能影響運費、付款、退款、折扣碼使用次數及報表。

		示範：追蹤直接修改點與間接受影響的模組，依風險排序，找出交易機制與資料快照如何維持一致性。

		實作：整理受影響流程、失敗情境，以及必須維持不變的既有行為。

		驗收：影響分析同時涵蓋新功能與可能被破壞的舊功能。發現新相依關係時，重新評估。

	4. 建立針對性的測試基準

		情境：既有測試全部通過，但缺少退款與取消流程的測試。

		示範：修改程式前先執行測試、保留結果，再針對高風險行為補上特性測試（Characterization Tests）。鎖定現有行為，不代表認定所有舊程式的行為都正確。

		實作：依影響分析補強重要舊流程的測試，並在尚未修改正式程式前執行。

		驗收：保留修改前的程式狀態、測試指令、結果及缺口。不要求先達到全系統完整覆蓋率。

	5. 定義規格與實作計畫 ← 許願

		情境：需求尚未明確定義折扣是否影響運費。

		示範：主 Agent 提出具體問題，說明影響並建議預設方案。由人員決策後，更新規格並繼續執行。

		實作：定義功能範圍、排除項目、驗收案例、必須維持的不變條件、交易與失敗處理，以及工作順序。既有 Agentflow/aglite 專案沿用其 design、tracker、notebook 慣例；其他專案使用 Skill 自帶的工作紀錄。

		驗收：重大決策與必要核准均已完成。沉默或建議預設值不等於授權，也不增加不必要的審批關卡。

	6. 安全實作 ← 監工

		情境：新功能橫跨計價、資料儲存與訂單生命週期。

		示範：小範圍實作、檢查 Diff、執行相關測試。維持原有架構，避免趁機大規模重構或改動無關程式。

		實作：分批完成已核准功能與失敗處理。若新發現推翻原規格，先修正規格再繼續。

		驗收：所有修改都能追溯至需求或具體阻礙。不允許無關重構、私自擴大範圍，或為通過測試而降低斷言標準。

	7. 驗證實際結果 → 驗收

		情境：新功能測試通過，但舊有付款或退款流程仍可能出錯。

		示範：執行端到端 HTTP 測試，重新讀取儲存資料，核對實際收款與退款金額。測試無效請求、狀態轉換及重複請求。檢查 Diff，並執行必要的獨立 Code Review。

		實作：逐項提供驗收條件與不變條件的驗證證據，揭露未測試範圍及剩餘風險。講師使用不提供解答程式的隱藏測試評估學員成果。

		驗收：必要驗證全部通過，失敗與風險如實呈現。測試通過不代表零回歸問題；Agent 宣告就緒也不等於人員驗收通過。

	8. 保存知識與交接

		情境：另一位工程師下週需要接手或維護這項功能。

		示範：記錄已確認規則、決策、程式位置、測試指令、驗證限制及下一步，並更新相關維護文件。

		實作：交接最終規格、驗證證據及待處理技術債。由另一位學員嘗試只靠紀錄接手工作。

		驗收：下一位工程師或 Agent 不必重讀整段對話，就能理解成果、決策及未完成事項。紀錄保持精簡，避免與既有工作流程重複。

	---

	**核心原則：先理解、再保護、後修改，最後以證據驗收並留下可接手的紀錄。**

# 實作流程

	- 八大步驟皆已深度整合入 agentflow 既有工作流程

	- 可透過 `brownfield: [task]` 指令觸發該八大步驟

	- 詳細提示可看 `references/brownfield.md`

	# 練習題

		- 限制熱門商品被一次大量買走。
		
		- 每項商品可以設定「一筆訂單最多買幾個」。
		
		- 超過上限的訂單要被拒絕，並回傳錯誤碼 400 和訊息 Quantity exceeds per-order limit。
		
		- 沒有設定上限的商品，行為要跟現在完全一樣。

		- 例子：
		
			- 把 mug 設定成每筆最多 3 個。下單 mug ×4 會被拒絕，mug ×3 會成功；tea 沒有設定上限，照舊可以買。

			- 商品列表： 查商品列表的網址 GET /api/products 要多回傳一個欄位 maxPerOrder，沒有設定上限時回傳 null。

/* Agentflow 使用方式
-------------------------------------------------- */

# SDD (Specification Driven Development) 內建 advisors 專家群隨時提供建議

	- kiro, openspce, speckit..., agentflow v5

	# advisors

		- 需求釐清（requirements）
		- 程式碼盤點（codewalk）
		- 方案探索（explore）
		- 技術驗證（spike）
		- 規格制定（spec）
		- 安全檢查（security-scan）
		- 驗收審查（acceptance）
		- 經驗檢討（learn）
		- 最終關卡與交付（audit）
		- 舊有程式碼開發(brownfield)
		- 產品文件(product-docs)

	# agentflow 實作 SDD 的方式

		- 漸進式選用

			- 不是按固定順序執行，而是依任務`複雜度`與當前需求`動態調用`不同 advisors 出來做事

			- 不是每個 advisor 都會產出獨立文件(反正也沒人看，還浪費錢)

			- 002.devlog.md, 
			- design.md(spec, PRD)[invariants, ac, validation]
			- tracker.md

		- 彈性調整

			- 每個 advisor 就算被啟用，內部仍會依任務內容而調整執行力道(簡單事快點做，複雜事詳細做)

			- agent 也會依當前開發進度動態決定`跳過、調整順序或重新啟動`某些 advsiors

				- 也就是有些 advisors 可能被多次叫出來做事

		- 你不用管有哪些專家，只要知道在需要時它們會自動被叫出來幫你做事就行！

# 重要檔案

	- `AGENTS.md`

		- 內部自動啟用 aglite skill，因此 `/clear` 後不打 `godev` 也沒差

		- code-convention.md

	- `backlog.md`

		- 確保不遺忘開發過程中曾提過的任何待辦事項

	- `sys-invariants.md`

		- 整份程式的全域家規，避免在多輪迭代開發時違反前人立下的家規

		- 例如`密碼絕不可明文存於資料庫`

	- `ag.json`

		- 重要設定說明

# 常用指令

	- burst mode

		- new-feature/merge-feature/drop-feature

			- - 是平行開發多功能的好幫手，也是團隊合作的利器

		- append-rounds

		- handle-tasks/prepare-tasks/run-tasks + looper.js

	- grill-me

	- `advisors: final-audit`

	- `/goal`

		- 許願 → design.md → tracker.md 

		- 搭配 tracker.md 即可連續跑幾小時

	- `3ways`	

		- 請用 3ways 規畫這份報告，直到你倆達成共識。

	- `fast-lane`

		- 略過所有 subagent 委派、對抗式審查、plan/tracker 而由 host agent 自己快速做完，這是趕時間時用的招數，但僅適用於簡單小工作(例如改錯字)

	- `skip-review`

		- 略過獨立(第三方)的審查，改由 host agent 自己做 review

	- `nolog, noop, off, skip`

		- 某些對話記錄可不記入 devlog，例如快速提問時可避免污染筆記本內容

# 應用心法

	# plan mode 改用 claude 先行，codex 審查

		- 解決 over-engineer 與 scope-expansion 問題

	# 與其對 LLM 生氣，不如提供

		- actionable information
		
		- naming the mistake
		
		- the correction you need
		
		- restate the goals

	# 善用 ai 速度先做再說
		
		在多次重試過程中可將計畫想的更清楚，增加最後做成功的機會

	# 也能直接在 teminal 輸入，內容會被貼入 devlog

	# word/pdf 等 office 文件皆可讀取

	# 圖也可直接貼入

	# 既有程式庫 code convention 

		- 直接寫在 AGENTS.md
		
		- codewalk 時叫 agent 反向整理出來

# 全新系統開發範例 / 會員系統

	# 許願

		- 在 devlog 內清楚寫下願望

		`請幫我建一個會員系統，需能註冊、登入、登出並顯示個人 profile 頁面。頁面風格盡量現代、簡潔且不要看起來像 AI slop。先寫個計畫並與我討論。`

	# 監工

		- 審查 design.md 內容，關鍵在 invariants/ac/validation 內容

		- 確定 design.md 滿意後即可允許開工

		- 施工過程中監工方式

			- 觀察 tracker.md 內進度變化

			- 觀察 `.agentflow/artifacts/A-NNN/` 內產生的各式報告

			- 觀察 devlog [RUN]/[WIP] 更新記錄

				[RUN] 
					- 我現在.....

				[WIP]
					- 已完成
					- 正在做
					- 還剩工作	

			- 觀察 claude code 畫面上顯示的訊息(例如有無紅色錯誤)

			- 觀察 repo 下檔案變化(例如有出現 test 就打開來看內容)

	# 驗收

		- 施工結束後開始人工驗收過程

		- 詳讀 devlog 內 Reply 內寫的實作報告

		- 如有提出 Questions 就回答

		- 如有提出錯誤/例外狀況可追問

		- 人工跑一遍所有 tests 是否全通過

		- 人工測試一遍網站主要功能

	# SDD 步驟

		- 掃瞄既有程式建立 codemap 以利其它 agent 接手開發

			- `advisors: codewalk`

		- 生成與維護程式庫文件，確保程式碼內容與文件內容永遠一致

			- `advisors: product-docs`

		- 產品上線前最後總體檢，它涵蓋的範圍遠大於個別功能完成後做的 reivew

			- `advisors: final-audit`
		
		- 對產品做資安掃瞄

			- `advisors: security-scan`

		- 也可用連發組合技(就能離開電腦半小時再回來)

			- `advisors: codewalk, security-scan, product-docs, final-audit`

# 延伸功能(視需要採用)

	- 撰寫完整測試

	- 補充關鍵 e2e tests

/* 結語
-------------------------------------------------- */

# 駕馭 AI (Steering) 是未來人類最重要技能

	- 只會寫程式價值已不高，因為 AI 能做的更快更好，人類沒必要成為瓶頸

	- 人類獨有的價值是`品味、判斷、經驗與常識`

	- 知道哪些事值得做，哪些事應果斷說不

	- 能判斷 AI 產出物的品質優劣、也知道`正確、好的`結果該長什麼樣

	- we can do anything now, be braver, more ambitious, think bigger, go faster, revolute yourself everyday, welcome to a brand new world!

/* 附錄 - devlog.md 細節
-------------------------------------------------- */

# devlog.md 重要欄位與用法

	# Ask

		- 可批次放入一堆問題讓它一次回答

		- 也可直接在 terminal 寫問題，一樣會被貼進 Ask

	# [RUN]

		- 每次有俱體進展時即更新狀態

	# [WIP]

		- 每十分鐘更新一次當前進度(已完成、正在做、待執行)

	# Reply

		- 依問題逐項回答實作結果

	# Questions

		- 專門記錄需要人類回答的重要未決事項。

/* 附錄 - .agentflow 下目錄與檔案設定說明
-------------------------------------------------- */

# Repo root 下相關檔案

	# ag.json 內設定介紹

		{
		  "schema-version": "aglite-5",
		  "switches": {
		    "ag-dir": ".agentflow",
		    "auto-commit": "on",
		    "auto-push": "on",
		    "gate-design": "off",
		    "gate-tracker": "off",
		    "inline-reply": "off",
		    "review-order": "external-first",
		    "skip-asker": "on",
		    "skip-plan": "off",
		    "skip-run": "on",
		    "skip-wip": "off",
		    "use-lang": "en-us",
		    "notebook-name": "workshop.devlog.md"
		  },
		  "pipeline-roles": {
		    "requirements": "better",
		    "codewalk": "better",
		    "explore": "better",
		    "spike": "better",
		    "spec": "better",
		    "implementation": "basic",
		    "security-scan": "best",
		    "//": "review 也是用 acceptance 設定",
		    "acceptance": "better",
		    "learn": "basic",
		    "threeways": "better"
		  },
		  "model-family": {
		    "openai": {
		      "best": "gpt-6-astra/medium",
		      "better": "gpt-6.1-sol/high",
		      "basic": "gpt-6.1-sol/low",
		      "cheap": "gpt-6-luna/high"
		    },
		    "claude": {
		      "best": "claude-opus-5-5/high",
		      "better": "claude-opus-5-5/medium",
		      "basic": "claude-sonnet-5-5/medium",
		      "cheap": "claude-haiku-5-5/medium"
		    }
		  },
		  "external-workers": [
		    {
		      "id": "codex-default",
		      "command": [
		        "codex",
		        "exec"
		      ],
		      "priority": 3,
		      "model-family": "openai"
		    },
		    {
		      "id": "claude-default",
		      "command": [
		        "claude",
		        "-p"
		      ],
		      "priority": 3,
		      "model-family": "claude"
		    }
		  ]
		}

	# AGENTS.md

		- 用戶專案可能原本已有一份 repo-scope 專屬提示，因此盡量不改它的內容

		- 但如果沒有就代為建立一份，方便之後放入相關提示

	# `.wts/ft-<name>`

		- feature branch/worktree 集中置於此目錄下面方便管理

# `.agentflow/` 下相關檔案

	# `<name>.devlog.md` 與 `<name>.devlog.archive.md`

		- 最重要的工作記錄本與歷史歸檔(超出 750 行時即自動歸檔)

		- 可隨時更名以避免所有專案都用 `devlog.md` 會很難分辨

		- `.<notebook-basename>.owner` 是筆記本鎖定檔，防止兩個 coding agent 同時編輯同份檔案造成彼此覆寫

	# backlog.md

		- 追蹤專案長期開發過程中可能不斷累積的待辦事項

		- 想成是以前程式註解裏的巨量 `// TODO` 就行，差別是這次 agent 會負責不斷提醒你何時該去補完這些歷史債

		- 因此不需擔心有重要事項在過程中被遺忘，它們會持續被記錄與追蹤

	# sys-invariants.md

		- 程式整體需維持不變的真理(durable guarantees)

		- 每次做完新任務時都會審查一遍以確保沒違反之前的規則

		- agent 會自動更新與維護此份文件以確保整體程式品質一致性

		- 例子：資料庫內容使用 flag 標示刪除而非真的移除資料

	# `artifacts/` 目錄

 		- `.agentflow/artifacts/A-NNN/`

 		- 每一輪(例如 A-123) 內生成的相關檔案與報告皆歸檔於此，方便查詢

 		- 不是每一輪都需要建立

	# `features/` 目錄

		- 當一個 feature branch/worktree 做完並 merge 後，它遺留的文件與專屬 <feature>.devlog.md 歸檔於此，供永久追蹤
