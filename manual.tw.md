# 怎麼用原版的「舊系統搬家」技能組

先講結論：這套技能（skills，也就是寫好給 AI 助手照著做的工作說明書）不是一路按到底的流水線，而是「看證據、做決定、再回頭檢查」的循環。整個專案一開始只需要做一次全面盤點；之後每換一個業務領域、每切一小塊來搬，就重做那一塊需要的盤點和保護。只要某一關沒過，就退回到「證據顯示已經不成立」的最早那一步重來。

如果你只是想教大家這些產出長什麼樣、不想安裝任何東西，就直接看[示範專案](project/README.md)和它存好的 [.migration 紀錄](project/.migration/status.md)。這個專案是假造的教學範例，真的能跑起來的舊系統是 Java 寫的。至於分析 Oracle 資料庫裡的程式、打算改用的新框架、正式環境上線這些事，都另外分開寫，不跟「實際跑出來的結果」混在一起。

## 把十一個技能全部裝好

原始套件裡有一個總指揮，叫 `ai-migration`，另外有十個負責各階段的技能。總指揮的名字寫在[原始 SKILL.md 第 2 行](../ai-migration-skill/SKILL.md#2)；但 [USAGE.md 第 9 行](../ai-migration-skill/references/USAGE.md#9)的安裝說明只裝了那十個階段，漏了總指揮。

目前官方文件說：個人用的技能放在 `~/.agents/skills`，某個程式庫專用的技能放在該程式庫的 `.agents/skills`，要用的時候打 `$技能名稱` 明確叫它。這是 Codex（OpenAI 的程式助手）的規則；別假設其他 AI 助手也用一樣的方式找技能。[官方技能文件](https://learn.chatgpt.com/docs/build-skills)。

下面是一段安裝步驟，給專案負責人在這個教學程式庫的最上層資料夾執行。這次示範並沒有真的跑過它。它的行為是：如果目的地已經有同名資料夾就拒絕動手；只把這套技能複製到總指揮原本就會去找的個人資料夾。拿去用在真正的程式庫之前，請先看過原始內容。

```sh
python3 - <<'PYINSTALL'
from pathlib import Path
import shutil
src = Path('c03-migration-v1-首次寫好 skills/ai-migration-skill')
dst = Path.home() / '.agents' / 'skills'
stages = sorted(p for p in (src / 'skills').iterdir() if p.is_dir() and (p / 'SKILL.md').is_file())
assert len(stages) == 10
assert all((p / 'SKILL.md').is_file() for p in stages)
assert not any((dst / name).exists() for name in ['ai-migration'] + [p.name for p in stages])
dst.mkdir(parents=True, exist_ok=True)
orch = dst / 'ai-migration'
orch.mkdir()
shutil.copy2(src / 'SKILL.md', orch / 'SKILL.md')
shutil.copytree(src / 'references', orch / 'references')
for stage in stages:
    shutil.copytree(stage, dst / stage.name)
print('Copied orchestrator and 10 stages; verify discovery in Codex.')
PYINSTALL
```

裝完後，在舊系統的程式庫裡打開 Codex，用 `/skills` 或打 `$` 叫出選單，確認看得到 `ai-migration` 加上十個 `migration-*` 階段。如果沒刷新，就重開 Codex。不要因為「檔案已經複製過去了」就當作它已經載入。如果少了哪一個，就去看複製過去的資料夾和設定檔，而不是叫 AI 用猜的去補說明內容。[官方說明：怎麼找到和呼叫技能](https://learn.chatgpt.com/docs/build-skills)。

十個階段各有一個設定檔，規定「只能被明確點名才會啟動」，例如 [migration-intake/agents/openai.yaml 第 2 行](../ai-migration-skill/skills/migration-intake/agents/openai.yaml#2)。所以要嘛直接點名那個階段，要嘛叫總指揮去讀那個階段的檔案照做。真正檢查有沒有裝好，要看 Codex 的技能清單；光是列出資料夾裡有檔案，不代表叫得出來。

如果只想裝在單一程式庫裡，就把同樣這十一個資料夾並排放在 `<舊系統程式庫>/.agents/skills` 底下。不過舊版總指揮的[搜尋清單（第 86 行）](../ai-migration-skill/SKILL.md#86)只列了個人資料夾的位置，所以它找不到時，你要告訴它階段檔案實際放在哪裡。這次示範是直接讀原始檔案來照做，避開「找不找得到」的問題；這證明了各階段的內容能被套用，但沒證明在介面上找得到，也沒證明全域安裝成功。

## 選擇怎麼帶動整套流程：總指揮的四種用法

你**不需要**手動一個一個叫 `$migration-*`。同一套流程有兩種帶法：一是叫 `$ai-migration` 自己挑下一階段並執行；二是你已經知道哪一步要補，就自己點名那個階段。下面逐階段的範例指令示範的是第二種；它們是一次一次分開下的，不是整串貼上去一口氣跑完、中間不停下來檢查。

要用哪種模式，是從你的用字判斷的；這套技能沒有 `--mode` 這種開關、不會記住模式，也沒有「預設就把所有階段跑完」的設定。所以要做什麼請講清楚。只打 `$ai-migration` 不代表「幫我把整個搬家做完」。見 [ai-migration/SKILL.md 第 58 行](../ai-migration-skill/SKILL.md#58)。

- **教練模式：告訴你下一步該做什麼。** AI 會看專案目前的狀況，說明現在在哪個階段、你要準備什麼、要檢查什麼，並給你下一句該下的指令。除非你叫它跑，它不會自己去做一大段工作。見 [ai-migration/SKILL.md 第 60 行](../ai-migration-skill/SKILL.md#60)。

- **繼續模式：真的去做下一個階段。** AI 會檢查證據，找出「最早一個實質上還沒滿足的前置條件」，把對應的階段說明完整讀過，然後照做。這可能會回頭做前面的階段，不一定是清單上的下一個。見 [ai-migration/SKILL.md 第 74 行](../ai-migration-skill/SKILL.md#74)和[分派規則第 204 行](../ai-migration-skill/SKILL.md#204)。

- **狀態模式：看準備好了沒。** AI 會讀 `.migration/` 資料夾和相關證據，回報現在在哪個階段、還缺什麼。如果你只想要評估，記得明講「不要動手做」。見 [ai-migration/SKILL.md 第 94 行](../ai-migration-skill/SKILL.md#94)。

- **檢查／監看模式：看整個過程健不健康。** AI 會載入 `migration-monitor`，檢查有沒有偏離目標、卡住不動、漏看的地方、沒證據撐腰的說法、該驗證卻還沒驗證的東西。這只是健康檢查，不能取代每一小塊搬完後的驗證。想要獨立的第二意見，要另開一個新對話；這個模式本身不會幫你開。見 [ai-migration/SKILL.md 第 105 行](../ai-migration-skill/SKILL.md#105)。

下面每一段都是一句單獨的指令，不是命令列參數：

**教練模式指令**

```text
$ai-migration
Coach me: inspect the current migration state and explain the next safe stage.
Give the exact next prompt and checkpoint. Do not execute the stage yet.
```

**繼續模式指令**

```text
$ai-migration
Continue: select the earliest unmet prerequisite and execute that one stage.
Locate, read in full and apply its migration-* SKILL.md; do not substitute a summary.
Follow the charter's authorized scope. Stop at its checkpoint and report evidence or blockers.
No production operations. Do not advance into another stage in this invocation.
```

**狀態模式指令**

```text
$ai-migration
Report migration status: current stage, current slice, missing evidence and next safe action.
Check actual evidence against exit criteria. Do not implement or execute a migration stage.
```

**檢查／監看模式指令**

```text
$ai-migration
Review migration process health using migration-monitor.
Report GREEN/YELLOW/RED with evidence and the smallest corrective action. Do not implement.
Return findings to the migration record owner for integration; do not edit shared records concurrently.
```

第一次開工的話：如果你需要人幫你準備資料，先用教練模式；然後用繼續模式，附上下面「立案」範例裡的目標和限制。還沒有 `.migration/` 資料夾時，總指揮通常會先選「立案」這一步。看過產出後，到了檢查點允許往前，再叫一次繼續模式。盤點完成後，先照[挑選範圍的交接方式](#什麼時候挑第一個要搬的功能)選一個候選流程，再進入「還原業務規則」。整個盤點和第一小塊就這樣一來一回地推進；中途被打斷就用狀態模式，覺得進度怪怪的就用檢查模式。

原始技能有寫「挑下一階段並執行」，但沒寫一個完整的、無人看管也能一路跑好幾個階段的循環，也沒寫什麼時候該停。所以範例裡那句「做完一個階段就停」，是把你要的界線講清楚。這也不保證一個超大的盤點階段能在一次對話裡做完：做到一半就把已看過的範圍存起來，下次接著做，直到達成該階段的完成條件。能不能往前推進，最終還是看人有沒有核准、有沒有存取權限，以及高風險的前置問題解決了沒。

如果你想自己掌控，就直接叫 `$migration-recon`、`$migration-bizlogic` 或其他階段，範圍和檢查點照樣講清楚。就算用繼續模式，總指揮也必須去讀真正的階段檔案。十個階段都設定成「要明確點名才啟動」，別指望 AI 看意思自動觸發。如果某個階段找不到或讀不到，就給它實際安裝的路徑或把安裝修好；不要叫 AI 自己編說明內容。見 [ai-migration/SKILL.md 第 92 行](../ai-migration-skill/SKILL.md#92)和 [migration-recon/agents/openai.yaml 第 2 行](../ai-migration-skill/skills/migration-recon/agents/openai.yaml#2)。

## 準備第一次開工

在有正式授權的前提下，把這些東西準備好讓 AI 拿得到：原始碼、怎麼編譯和執行的說明、資料庫結構、資料庫裡存的程式（例如 Oracle 的預存程序）匯出檔、設定檔、測試資料，還有既有的搬家相關文件。缺什麼就記下來。光有原始碼匯出檔，沒辦法證明程式執行時實際會呼叫誰、依賴哪些外部系統、交易（一次要嘛全成功、要嘛全取消的資料庫操作）怎麼運作。

如果目標已經定死是 Spring Boot（Java 後端框架）／Vue（網頁前端框架）／PostgreSQL（資料庫）／訊息佇列，這只是要記下來的限制條件，不代表可以把每個子系統都換掉。「改業務規則」和「搬過去行為不變」是兩件事，要分別驗收。如果當初懂這套系統的人都不在了，就用「沒有專家」的驗證方式，並且把搞不清楚原意的地方明白標出來。

「立案」階段的說明在 [migration-intake/SKILL.md 第 16 行](../ai-migration-skill/skills/migration-intake/SKILL.md#16)。一句精簡的開場指令長這樣：

```text
$migration-intake
Initialize .migration for this Java/Oracle monolith. Preserve current behavior.
Target constraints: Spring Boot API, Vue UI; PostgreSQL and queue changes require separate proven slices.
Use source and safe nonproduction evidence. Record unavailable environments and unknown intent.
Allow local analysis, tests and scoped code only; no production writes/cutover or destructive operations.
Do not implement yet. Save charter, status, decisions and progress.md; identify missing discovery inputs.
```

立案書（charter）要寫到讓一個全新、什麼都不知道的 AI 一看就懂：目標是什麼、哪些決定已經定了、可以做什麼、不准做什麼、怎樣算成功（要看得到的結果）。往下走之前請你親自看過。AI 說「綠燈」，並不會變出它本來沒有的權限，也不代表業務單位已經同意。

## 什麼時候挑第一個要搬的功能

**立案和大範圍盤點是針對整個專案做的。第一個候選流程要在盤點之後、深入還原業務規則（`migration-bizlogic`）之前挑。** 開始立案時，你不需要已經知道要先改寫哪個功能；但你需要有目標、限制和授權的存取權限。如果業務單位已經有優先想搬的東西，就在立案時記成候選，再用盤點去確認它依賴哪些東西、可不可行。

這裡說的「整個程式庫」，是指這次授權範圍內的所有原始碼資料夾，以及相關的資料庫、排程工作和對外串接。意思是做一份清單加一張有用的大地圖，不是在挑功能之前就把每條業務規則都還原、每行程式都讀過。盤點時可以挑幾條流程深入看，讓那張地圖更有用。

這裡有兩種不同的選擇。**候選流程**是「最值得先研究的業務操作」，例如「算訂單報價」。**執行切片**是後面才定下來的、要被保護、設計、規劃然後實作的那一小塊具體改動。選了候選流程，不代表准你改寫它，也不代表它最後的範圍就定了。

```text
Intake → broad recon                         engagement-wide
             ↓
Human chooses a candidate workflow           first scope decision
             ↓
Business logic → validation                  candidate + relevant dependencies
             ↓
Safety net → transition design               protect behavior; define a safe seam
             ↓
Slice plan                                   finalize the small implementation boundary
             ↓
Execute → verify                             implement and prove that slice
```

（上圖白話版：立案 → 大範圍盤點，針對整個專案；→ 人來挑一個候選流程，這是第一個範圍決定；→ 還原業務規則 → 驗證，針對候選流程和它相關的依賴；→ 安全網 → 過渡設計，保護既有行為、找出安全的接縫；→ 切片計畫，把要實作的小範圍定案；→ 執行 → 驗證，實作並證明這一小塊。）

原始技能本身就支持這種區分：[migration-recon/SKILL.md 第 83 行](../ai-migration-skill/skills/migration-recon/SKILL.md#83)說，地圖畫到足以看出候選範圍就可以結束盤點；[migration-bizlogic/SKILL.md 第 45 行](../ai-migration-skill/skills/migration-bizlogic/SKILL.md#45)本來就預期已經有一個目前的領域或候選範圍；之後 [migration-slice/SKILL.md 第 16 行](../ai-migration-skill/skills/migration-slice/SKILL.md#16)才去挑出並準備真正那一刀直切的小塊。

**更新後的技能會強制這個交接：** 盤點結束時會列出候選流程；總指揮或直接叫業務規則階段時，如果負責人已經明確選過就沿用，沒選過就拿具體候選來問人，然後才做跟目標相關的工作。AI 的「推薦」不等於「選了」。沒選或選得不清楚時，相關的追查和後續工作都會暫停；但整理摘要、以及原本就被授權的有限協助選擇的工作，可以繼續。盤點可以已經完成、只是還在等人選；不需要多一個階段。

盤點結束時，請 AI 根據 `system-map.md`（系統地圖）、`coverage.md`（看過哪些範圍）和 `unknowns.md`（還不知道的事）推薦幾個候選流程。每一個都要說明：對業務的價值、從哪裡進入看得到、依賴什麼、有什麼風險、有沒有可以拿來比對的舊系統結果和測試環境，以及哪些還沒搞清楚的事可能卡住搬家。挑試點時，選有用、看得到結果、範圍有限、而且能退回的；「原始碼檔案最小」本身不是好的挑選標準。

接著由人來選一個；如果證據不夠做決定，就要求做一次範圍有限的調查。把選擇和理由存進 `.migration/decisions.md`；把選中的流程、還卡住的事、下一步存進 `.migration/status.md`。如果之前已經對同一個候選授權過，那就夠了。不要因為還沒挑候選，就一直重掃整個程式庫。

例如盤點完之後，可以用這句自己寫的教練模式指令：

```text
$ai-migration
Coach only. From recon evidence, recommend a short list of first candidate workflows.
Explain value, entry points, dependencies, risks, available baseline/test environment and blocking unknowns.
Recommend one and ask me to choose. If evidence is insufficient, identify the smallest useful investigation.
Do not execute another migration stage or implement code.
```

選好之後，在下一次繼續模式的指令裡把範圍講清楚：

```text
$ai-migration
I choose <candidate workflow> for focused investigation; record this choice and reason: <reason>.
Continue with the earliest unmet prerequisite for this candidate and its relevant dependencies.
If recon is sufficient, load migration-bizlogic and trace this workflow end to end.
Stop at the selected stage checkpoint. Do not implement or authorize production operations.
```

如果你是直接點名各階段，就把同一個選定的流程交給 `$migration-bizlogic`；後面範例裡的 `<candidate workflow>` 都換成你選的那個。在這個示範裡，先選**算訂單報價**：第一塊 S-01 透過 `Bridge.quote → Target.quote` 取代 `LegacyQuote.quote`，必須保留：小數乘法、四捨五入到小數兩位（`HALF_UP`）、數量錯誤時的錯誤處理，以及那個可有可無的原因欄位。它不會改動任何訂單狀態；`quote_price` 只是拿來看的 Oracle 原始碼。會影響信用額度和稽核紀錄的「送出訂單」，是之後的 S-02。照著[講師示範和兩個學生練習](exercises.md)走：把現成的 `project/legacy/` 資料夾發給學生，示範裡面的 S-01 資料夾，然後讓學生自己搬「接受訂單且重送不會重複」（E-01）和「拒絕與失敗後復原」（E-02）。這是這個教學範例的順序，不是對每個程式庫都適用的建議。

從還原業務規則開始，焦點就放在候選流程，以及解釋和保護它的行為所需要的一切。共用的程式包、資料庫觸發器、排程工作或對外串接，可能會把你帶出它所在的模組。證據需要就擴大調查；如果範圍變得不安全，就回頭修改或縮小候選。在擷取安全網之前，先確認候選流程有哪些行為和影響要保護；到了 `migration-slice` 再把確切的進入點、檔案、不能變的規則、檢查項目和退回的限度定案。不要等到切片計畫才決定前面那些階段到底在研究哪個流程。

## 為什麼會有 `.migration/progress.md`

這個檔案是這套技能故意建立的。[migration-intake/SKILL.md 第 30 行](../ai-migration-skill/skills/migration-intake/SKILL.md#30)要求立案時把缺少的 `status.md`、`progress.md`、`decisions.md` 建起來；十個階段都有一條指示，要在結束前更新搬家狀態和進度紀錄，例如 [migration-recon/SKILL.md 第 12 行](../ai-migration-skill/skills/migration-recon/SKILL.md#12)。這些檔案是 AI 照著說明做事時自己寫的；套件裡沒有在背景自動記錄的程式或掛鉤。

這套技能把 `.migration/` 稱為「專案的長期記憶」（[migration-recon/SKILL.md 第 6 行](../ai-migration-skill/skills/migration-recon/SKILL.md#6)），但沒有另外規定進度紀錄的格式或完整用途。參考監看階段的用法和示範專案，這份手冊把進度紀錄當成「跨階段、跨切片、跨新對話的工作經過」：試過什麼、什麼讓理解改變了、為什麼停下來或退回前面的階段、證據放在哪。這能幫下一個 AI 和人類檢查者說清楚「現在這個狀態是怎麼來的」。監看階段明確會去讀它（[migration-monitor/SKILL.md 第 24 行](../ai-migration-skill/skills/migration-monitor/SKILL.md#24)），並寫一筆簡短的監看紀錄（[第 46 行](../ai-migration-skill/skills/migration-monitor/SKILL.md#46)）。

讀和維護這些紀錄時，可以照下面這樣分工：

- **`status.md`：我們現在在哪？** 目前的階段和切片、準備好了沒、卡在哪、下一個安全的動作。這是「目前摘要」，會隨進度改寫。

- **`progress.md`：我們是怎麼走到這裡的？** 依時間順序、簡短記下重要的工作、失敗、發現和回頭重做，附上證據連結。不要把每個指令輸出或整份階段報告都抄進來。

- **`decisions.md`：我們選了什麼、為什麼？** 搬家的決定、理由、限制和核准的界線；工作經過裡用連結指過去，不要整段複製。

- **各階段和各切片的紀錄：憑什麼這樣說？** 看過的範圍、規則、測試、實作和驗證，保存詳細的範圍和證據。進度紀錄裡寫一句「檢查通過了」，不能取代這些證明。

原始技能沒有規定進度紀錄的嚴格格式、時間格式，也沒規定「只能往後加、不能改前面」。上面那種簡短、照時間排的用法是操作建議；[示範專案的進度紀錄](project/.migration/progress.md)用編號條目示範。其中 S-02 的條目呈現了：一開始新舊結果對不上，退回去重做業務規則還原、驗證、安全網，然後修正並由獨立的人驗證。[目前狀態](project/.migration/status.md)則只總結結果：本機成功、正式環境暫緩（HOLD），不重複整段經過。

取名 `progress.md`，是為了跟 aglite（另一套開發流程工具）的 `*.devlog.md` 工作筆記區分開來。這份搬家進度紀錄跟 aglite/Agentflow 的筆記（例如這個教學程式庫的 `.agentflow/courses.devlog.md`）是各自獨立的。搬家技能沒有 aglite 也能跑：它管的是搬家這件事專屬的歷史；aglite 記的是負責人的要求、回覆和整體開發流程。兩個都裝，不會自動同步，也不會有哪一邊的規則自動蓋過另一邊。

兩個一起用時，詳細的搬家經過和證據放在 `.migration/`，在工作筆記裡放連結過去；工作筆記該記的負責人輸入、回覆和中斷復原資訊，照樣記在筆記裡。讓同一個人負責把各階段和監看的發現整合進紀錄。這種「互相連結」的作法是為了避免同一份完整報告抄兩遍；它是人工操作的建議，不是已經做好的自動整合，也不代表哪一份必要紀錄可以不更新。

## 第一輪：從盤點走到一個候選切片

1. **盤點：整個專案範圍。** 照 [migration-recon/SKILL.md 第 18 行](../ai-migration-skill/skills/migration-recon/SKILL.md#18)做。在深入閱讀之前，先列出所有模組、可部署的單位、Java 的進入點、Oracle 裡可執行的物件、排程工作和對外串接。每一個找到的區域都要在「看過範圍」裡有一筆，排除的要說明原因。另外抽查一些被排除和低風險的區域。進入第 2 步之前，照[挑選候選的交接方式](#什麼時候挑第一個要搬的功能)：看推薦、選一個流程、記下這個選擇。

2. **業務規則。** 對候選領域照 [migration-bizlogic/SKILL.md 第 16 行](../ai-migration-skill/skills/migration-bizlogic/SKILL.md#16)做。一路追：進入點 → Java → SQL 或資料庫程式包 → 觸發器、排程工作、資料表 → 下游影響。只列出一堆程式包名稱，卻沒有誰呼叫它、它造成什麼影響、實際例子，是不夠的。

3. **驗證。** 照 [migration-validate/SKILL.md 第 16 行](../ai-migration-skill/skills/migration-validate/SKILL.md#16)做。只問重要、而且沒辦法從證據便宜查到的問題。沒有專家時，從多個角度交叉比對行為，並保留「原意不明」的標記。不要把 AI 假扮專家的回答當成核准。

4. **安全網。** 照 [migration-safety-net/SKILL.md 第 16 行](../ai-migration-skill/skills/migration-safety-net/SKILL.md#16)做。在換上新系統之前，先把舊系統有代表性的輸出和影響錄下來。保留資料的來源和雜湊值（一種檔案指紋，用來確認內容沒被動過）。要包含失敗情況、邊界值、重試和相關狀態，然後故意放一個有錯的新版本，證明安全網真的抓得到。

5. **過渡設計。** 照 [migration-design/SKILL.md 第 16 行](../ai-migration-skill/skills/migration-design/SKILL.md#16)做。決定從哪個接縫切換、誰負責什麼、新舊怎麼並存、新系統要相容到什麼程度、出事怎麼救。比較小、可退回的改法，可以先保留 Oracle，同時驗證新的程式路徑。

6. **切片計畫。** 照 [migration-slice/SKILL.md 第 16 行](../ai-migration-skill/skills/migration-slice/SKILL.md#16)做。寫明確切的進入點、依賴、檔案、不能變的規則、測試、允許的差異、什麼情況要停、退回的限度。候選流程在盤點之後、第 2 步之前就選好了；這一步是把它定成可以開工的切片範圍。如果範圍變了，就回頭重看保護和設計。

7. **執行。** 照 [migration-execute/SKILL.md 第 18 行](../ai-migration-skill/skills/migration-execute/SKILL.md#18)做。重新確認計畫和保護措施，小步修改，編譯和測試，跟舊系統比對，檢查有沒有超出範圍。如果新發現讓範圍不成立就停下來，記下哪些地方要回頭重看。

8. **驗證。** 照 [migration-verify/SKILL.md 第 16 行](../ai-migration-skill/skills/migration-verify/SKILL.md#16)做，可以的話開一個全新的對話當獨立檢查者。比對回應和副作用（例如資料庫被寫了什麼），把每個差異分類，記下確切證據。缺少必要的環境時，對應的說法就維持「未證明」。

下面這些指令是自己寫的範例，請依實際程式庫調整。它們不是這次示範時在另一個 Codex 介面裡實際打過的指令紀錄。

```text
$migration-recon
Inventory Java, Oracle, jobs and integrations deterministically; map breadth before depth.
Save counts, source identities, coverage, system-map, evidence and unknowns. No implementation.

$migration-bizlogic
Trace <candidate workflow> across application, PL/SQL, triggers, jobs and downstream effects.
Record rules with source/line evidence, executable examples, confidence and unknown intent.

$migration-validate
Use current evidence to resolve material assumptions for <candidate workflow>.
No original experts are available. Triangulate behavior; preserve unresolved intent and contradictions.

$migration-safety-net
Capture <candidate workflow> legacy behavior and all relevant side effects in nonproduction.
Freeze baseline/provenance before replacement; test edge/error cases and a faulty target.

$migration-design
Design the smallest transition for <candidate workflow> using charter constraints.
Specify seam, coexistence, writer/data ownership, transaction effects, checks and rollback limits.

$migration-slice
Plan <slice-id> from current evidence. Name exact scope, files, invariants, scenarios, deltas and stop conditions.
Verify current safety-net coverage. Do not implement yet.

$migration-execute
Implement prepared <slice-id> only. Build/test, compare legacy behavior and side effects after each meaningful change.
Stop on unexplained material differences or invalidated dependencies; save discoveries and implementation notes.

$migration-verify
Independently inspect <slice-id> plan, code, baseline and deltas; run required comparisons and recovery checks.
Classify every material difference. Save verification and rollout limits; unavailable proof remains HOLD.
```

如果要讓總指揮帶，而不是自己點名各階段，就用[四種模式的指令](#選擇怎麼帶動整套流程總指揮的四種用法)。用繼續模式時要講清楚授權範圍和檢查點；說「繼續」不等於准許正式環境切換。

## 按領域、按切片重複做

一般的形狀是這樣：

```text
engagement: intake → broad recon → choose candidate → rules/validation
                         ↓
first slice: safety-net → transition design → slice plan → execute → verify
                         ↑                                │
                         └── new facts / failed gate ─────┘

next slice: refresh rules/validation → plan + current safety-net → execute → verify
                              ↑                                  │
                              └── revisit affected prerequisites ┘
```

（白話版：整個專案先做立案 → 大範圍盤點 → 挑候選 → 業務規則和驗證。第一個切片：安全網 → 過渡設計 → 切片計畫 → 執行 → 驗證；有新發現或某關沒過，就退回安全網重來。下一個切片：更新業務規則和驗證 → 計畫加上最新的安全網 → 執行 → 驗證；受影響的前置條件要回頭重看。）

[USAGE.md 第 32 行](../ai-migration-skill/references/USAGE.md#32)那個簡短的「切片 → 執行 → 驗證」循環，前提是前面的條件都還成立。不要拿「只算報價」的舊系統結果，去核准一個「會寫入訂單」的切片。每個新切片都要保護它自己看得到的行為和影響；共用的依賴一改，之前的證明就可能失效。

超大的程式庫，請用[大型程式庫的探索方式](#探索幾百萬行的程式庫)。每個新開的 AI 工作者只需要載入立案書、相關的看過範圍／規則／未知事項，以及目前的切片，不用每一輪都把所有全域報告重讀一遍。

在這次示範裡，S-01 的報價暴露出四捨五入對不上的問題；S-02 的寫入暴露出漏掉信用額度和稽核紀錄的影響，於是回頭重做業務規則、驗證和保護，最後修正後再驗證通過。這些是為了教學故意埋的錯，有實際比對過，但不是「AI 在不知情下能發現多少問題」的效能測量。見 [run-log.md](run-log.md)。

## 探索幾百萬行的程式庫

這套流程**不**要求 AI 一次把每行原始碼都讀過。`ai-migration` 先看搬家目前的狀態再分派工作；`migration-recon` 負責清點和畫系統地圖。用工具清點時，可以走遍整個授權的程式庫或搜尋內容；但「列出來、搜尋」跟「把每個檔案都塞進 AI 的腦袋（上下文）」是兩回事。見 [ai-migration/SKILL.md 第 157 行](../ai-migration-skill/SKILL.md#157)和 [migration-recon/SKILL.md 第 18 行](../ai-migration-skill/skills/migration-recon/SKILL.md#18)。

這套技能已經寫了下面這些控制探索成本的方法：

- **先用工具清點，再深入思考。** 能用指令或小程式列出來的，就用它們列出程式庫、模組、可部署單位、進入點、資料庫物件、排程工作和串接。這樣先確定有哪些東西要交代。見 [migration-recon/SKILL.md 第 20 行](../ai-migration-skill/skills/migration-recon/SKILL.md#20)。

- **先廣後深。** 先畫出業務流程、執行流程和子系統，再看實作細節。深入調查應該是為了解開一個重要的未知，或會影響搬家的決定；兩者都不是的，就把工作導回正軌。見 [migration-recon/SKILL.md 第 42 行](../ai-migration-skill/skills/migration-recon/SKILL.md#42)和[第 81 行](../ai-migration-skill/skills/migration-recon/SKILL.md#81)。

- **老實記錄只看了一部分。** 每個找到的區域都標上一個狀態：`uninspected`（沒看）、`sampled`（抽看過）、`mapped`（畫進地圖）、`deep-reviewed`（深入看過）、`excluded`（排除）或 `unresolved`（還沒搞懂）。出現在清單上不代表程式已經看懂了。見 [migration-recon/SKILL.md 第 40 行](../ai-migration-skill/skills/migration-recon/SKILL.md#40)。

- **把深入的工作分區，再對齊彼此的依賴。** 實戰指南建議按領域、模組或執行環境分區；互不相干的區域交給各自新開對話的 AI 工作者；最後整合跨區的部分，並稽核被排除或沒涵蓋到的區域。指南明講不要求每行都讀過。這些只是指南上的建議，不是內建的平行排程器；而且總指揮和盤點技能都沒有明確引用這份指南。所以大型程式庫的指令裡要自己把這個方針寫進去。見 [FIELD-GUIDE.md 第 164 行](../ai-migration-skill/references/FIELD-GUIDE.md#164)和[第 197 行](../ai-migration-skill/references/FIELD-GUIDE.md#197)。

- **把證據存下來，一次搬一個切片。** 有了存在程式庫裡的紀錄，新對話就能接著做相關的部分，不用重建整個系統的理解。新發現讓前置條件失效時，回頭重看受影響的部分。見 [ai-migration/SKILL.md 第 123 行](../ai-migration-skill/SKILL.md#123)、[第 312 行](../ai-migration-skill/SKILL.md#312)和 [USAGE.md 第 39 行](../ai-migration-skill/references/USAGE.md#39)。

實戰指南還建議：同樣的探索一直失敗就停下來；別產出沒人會用的超大報告；機械性的工作用便宜的模型、高風險的判斷用強的模型；只有在分區真的有用而且範圍明確時才開新的工作者。這些都是可選的省錢方法，不會自動幫你選模型，也不會強制限制工作者數量。見 [FIELD-GUIDE.md 第 413 行](../ai-migration-skill/references/FIELD-GUIDE.md#413)和[第 1105 行](../ai-migration-skill/references/FIELD-GUIDE.md#1105)。

這些探索方針都只是寫在 Markdown 裡給 AI 看的文字。套件沒有附：掃描引擎、會長期保存的程式符號索引、用雜湊值自動只掃變動部分的工具、能看懂依賴關係自動作廢舊結果的快取、強制的上下文用量上限，或自動分區排程器。AI 在執行過程中可以自己寫清點工具，但這套技能不保證會有這些優化。它也沒有附百萬行等級的效能測試，或實測省下多少用量和時間。這個小示範展示的是流程，不是企業規模的掃描效能。

大型程式庫請明確加上一段操作方針，別指望 AI 自己會照指南去做。下面這段是建議的執行設定，不代表原始技能已經會強制做「只掃變動部分」：

```text
$migration-recon
This repository has millions of lines. Apply the huge-system policy in <installed-ai-migration>/references/FIELD-GUIDE.md.
Inventory all authorized source roots, deployables, DB executable objects, jobs and integrations with tools first.
Record inventory commands, source revisions, missing inputs and coverage states.
Identify generated/vendor/build artifacts; record exclusions with reasons. Have an independent reviewer sample excluded and low-risk areas for missed cross-cutting dependencies.
Map top-level runtime boundaries before deep reading. Deep-read candidate flows and high-risk dependencies.
Partition deeper recon by domain/runtime boundary. Give each worker a bounded scope, output, coverage responsibility, evidence requirements and merge point.
Use separate workers only where the host supports them and project rules authorize delegation.
Per bounded pass, save new evidence, coverage changes, unknowns and next partition; report partial work honestly.
Reuse evidence after checking source/config/schema/environment identity. Reinspect changed surfaces and affected dependencies; refresh broader inventory when needed.
Complete recon when major discovered surfaces are accounted for and topology identifies candidate boundaries. Record high-risk unknowns for later recovery/validation.
Do not claim every line was read or all business rules recovered. No implementation, production operations or advance into another stage.
```

如果是照上面的方式裝在個人資料夾，把 `<installed-ai-migration>` 換成 `~/.agents/skills/ai-migration`；如果是裝在程式庫裡，就換成實際的資料夾。還沒做完的盤點要先接著做完再往前走；別把某一區的部分報告誤當成整個階段完成。指定一個人負責整合發現，並檢查各分區之間共用的資料庫、交易範圍和串接。光靠搜尋原始碼，沒辦法證明某個預存程序沒人用，也看不出所有執行時的行為。

## 監看與救回

在里程碑、或覺得進度怪怪的時候，獨立地照 [migration-monitor/SKILL.md 第 18 行](../ai-migration-skill/skills/migration-monitor/SKILL.md#18)做一次：

```text
$migration-monitor
Read status, coverage, unknowns, evidence, current slice and actual diffs/checks independently.
Return GREEN/YELLOW/RED with concrete signals and smallest corrective action. Do not implement.
Give findings to the record owner; avoid concurrent edits to shared migration records.
```

最後那句「交給紀錄負責人」，是為了解決原始監看技能裡的矛盾：[開頭第 12 行](../ai-migration-skill/skills/migration-monitor/SKILL.md#12)說一律要更新，[第 46 行](../ai-migration-skill/skills/migration-monitor/SKILL.md#46)卻說有條件才更新狀態。由一個人看過發現之後再整合進紀錄。另開對話能提供不同角度的檢查，但不等於證明是對的。

要接著做之前，先拿實際的原始碼版本和檢查結果，跟存下來的狀態對一下。有一份叫 `verification.md` 的報告，不代表驗證真的通過了。缺少必要的環境時，把卡住的原因和下一步存下來；可以先做其他不相干的有用工作，但不要拿 AI 模型假裝成那個缺少的系統。

如果新系統的結果對不上，先把失敗的輸入和輸出保存下來。然後判斷這是：退步（regression）、之前已核准的差異、合理的格式統一，還是說不出原因的差異。搞清楚原因之後才修。如果是資料庫觸發器改變了這個切片「由誰寫入」的範圍，就要回頭重看業務規則和設計，而不是只把預期值改一改。

## 上課時怎麼帶大家讀這些報告

先看 [project/.migration/charter.md](project/.migration/charter.md)：請學生找出哪些工作是被允許的，以及「想要的目標」和「已經證明的目標」差在哪。

接著打開 [inventory.md](project/.migration/inventory.md)（清單）、[coverage.md](project/.migration/coverage.md)（看過範圍）和 [system-map.md](project/.migration/system-map.md)（系統地圖）。讓他們挑一個進入點，一路追過 Java 和資料庫原始碼，並說明哪些部分沒被執行過、或不在這個切片範圍內。

讀 [business-rules.md](project/.migration/business-rules.md)（業務規則）、[unknowns.md](project/.migration/unknowns.md)（未知事項）和 [validation.md](project/.migration/validation.md)（驗證）。問大家：哪些說法是觀察到的、推論的、修正過的、還沒解決的。缺少業務專家這件事應該明白擺著，而不是捏造一場訪談來補。

用 [safety-net.md](project/.migration/safety-net.md) 找出實際錄製和重播的指令。先跑那個故意有錯的新版本，看存下來的不一致，再展示修正版。說明為什麼新系統回傳的值可以一模一樣，但資料庫那邊的信用額度和稽核紀錄卻不同。

比較 S-01 和 S-02 的[計畫](project/.migration/slices/S-01/plan.md)和[驗證](project/.migration/slices/S-02/verification.md)。在 [progress.md](project/.migration/progress.md) 裡指出回頭重做的那段，然後對照 [status.md](project/.migration/status.md) 裡「模型層級結果一致」和「正式環境暫緩（HOLD）」的差別。

最後看 [strategy.md](project/.migration/strategy.md)（策略）和 [S-02 rollout.md](project/.migration/slices/S-02/rollout.md)（上線計畫）。問學生：如果要面對真正的 Oracle、決定新資料庫歸誰管、處理重複送達的訊息、切換後的資料、以及正式環境的退回，還需要哪些額外證據？本機比對通過，只能支持「本機沒問題」這句話，回答不了那些還沒測過的問題。

## 各份文件各管什麼

這份手冊負責安裝和操作說明；[assessment.md](assessment.md) 負責發現的問題和建議。[project/README.md](project/README.md) 負責確切能執行的指令和執行範圍；[run-log.md](run-log.md) 負責記錄實際走過的階段順序。[project/legacy/exercises.md](project/legacy/exercises.md) 負責三份練習說明和逐步流程；[exercises.md](exercises.md) 是發給學生的入口。`exercises/check.py` 和 `exercises/ExerciseScenario.java` 是共用檢查程式的正本；發出去的三份 `project/legacy/{S-01,E-01,E-02}/tools/` 副本要保持完全一樣。原始技能改了的話，發出去的 `project/legacy/skills/` 快照要跟 `../ai-migration-skill/` 一致。每個練習資料夾負責它自己那個還沒完成的新系統和凍結的輸入資料。原始專案負責已完成的 S-01／S-02 解答。各切片的紀錄負責自己的範圍和證明。如果指令、路徑、原始技能的說明，或示範的證據範圍改了，記得把依賴它們的連結和範例一起更新。
