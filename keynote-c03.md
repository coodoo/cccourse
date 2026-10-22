
/* ai-migration skills
-------------------------------------------------- */

# `ai-migration` 功能說明

	# 分十個 stage，並在 `.migration` 內集中記錄進度狀態

		- 基本心法：先找出系統主要 workflows，每個 workflow 再 slice (切片)個個擊破改寫

		1. `migration-intake`
		2. `migration-recon`
		3. `migration-bizlogic`
		4. `migration-validate`
		5. `migration-safety-net`
		6. `migration-design`
		7. `migration-slice`
		8. `migration-execute`
		9. `migration-verify`
		10. `migration-monitor`

	# 十大 stage

		1. `migration-intake` <-- WE ARE HERE

			釐清遷移目標、必要新功能、技術限制、環境權限與成功標準，建立後續工作的共同依據。可能產出：專案章程 `charter.md`、決策紀錄 `decisions.md`，以及待補資訊清單。

		2. `migration-recon`

			先廣泛盤點模組、API、資料庫、批次作業與外部整合，建立有證據支持的系統全貌，再提出可供使用者選擇的調查流程。可能產出：資產清單 `inventory.md`、盤點涵蓋紀錄 `coverage.md`、系統地圖 `system-map.md`、證據與未知事項清單。

		3. `migration-bizlogic`

			針對已選定的業務流程，追查 Java、SQL、Oracle PL/SQL、資料異動與下游影響，找出必須保留的規則及例外行為。可能產出：業務規則目錄 `business-rules.md`，以及更新後的系統地圖、證據與待釐清事項。

			```text
			$migration-bizlogic
			Use my recorded <workflow> selection for <exercise>. Trace <dependencies> and the scenario entry,
			plus relevant Oracle source dependencies.
			Recover effects, errors, duplicate check ordering and snapshot/restore behavior for <slice>.
			Separate Java observations from inspected Oracle source and unknown real-system intent.
			Record rules, source/line evidence and relevant shared dependencies. Do not implement.
			```

		4. `migration-validate`

			將影響正確性、金額、交易或法遵的疑點整理成具體問題，請適合的專家確認；無專家時，以程式、測試、執行紀錄及歷史結果交叉查證。可能產出：專家問題清單 `expert-questions.md`，以及確認、修正與未解事項紀錄 `validation.md`。

			```text
			$migration-validate
			Validate <exercise>'s recovered <workflow> rules against code and executable legacy observations.
			No original experts or Oracle environment are available. Resolve cheaply provable facts;
			retain unknown business intent and real database behavior. Do not invent client approval.
			Separate observed behavior from whether it is the desired future business policy.
			```

		5. `migration-safety-net`

			在替換舊行為前，擷取具代表性的輸入、輸出、資料變化與副作用，建立可執行的測試基準，讓改寫造成的差異能被偵測。可能產出：既有行為測試、標準結果樣本、新舊差異比對或資料核對工具，以及 `safety-net.md` 與行為差異紀錄 `behavior-deltas.md`。

			```text
			$migration-safety-net
			Protect <exercise>'s <slice> before replacing it. Use tools/ExerciseScenario.java and
			tools/check.py to capture frozen legacy outputs and full state; never derive expectations from Target.
			Review scenario coverage, exclusions and the separate failure-detection experiment below.
			Keep existing baselines immutable; record source, scenario and baseline identities and limitations.
			```

		6. `migration-design`

			依據已確認的需求、舊系統行為與目標技術限制，規劃新舊系統共存、資料與交易處理、部署、觀測及回復方式。可能產出：技術相容性對照 `compatibility.md`，以及包含取捨、假設與風險的遷移策略 `strategy.md`。

			```text
			$migration-design
			Design the smallest Java-model transition for <exercise>'s <slice> using current validated rules.
			Use <seam> as the target seam and the selected workflow’s frozen legacy implementation as fallback.
			Preserve observed state ownership and failure ordering; no schema, framework or queue replacement.
			Explain coexistence, scoped routing, verification and rollback limits. No implementation yet.
			```

		7. `migration-slice`

			在已選定的業務流程中，挑出具有代表性、可測試且可回復的小範圍端到端改動，明訂依賴、實作步驟、驗證與停止條件。可能產出：切片計畫 `slices/<slice-id>/plan.md`，涵蓋變更範圍、行為要求及上線與回復計畫。

			```text
			$migration-slice
			Plan slice <exercise>: <slice> within the already-investigated <workflow>.
			Check that rules, validation, safety-net and design cover this boundary and shared dependencies.
			Only target/Target.java and migration records may change; legacy and tools stay frozen.
			Specify responses AND full-state invariants, scenario coverage/exclusions, execution steps,
			fault experiment, exact verification commands, fallback and stop conditions. Do not implement yet.
			```

		8. `migration-execute`

			依已準備完成且獲授權的切片計畫，以小幅修改、建置、測試與差異檢查反覆推進，將新發現回寫至遷移紀錄。可能產出：程式與設定變更、相關測試，以及切片實作紀錄 `implementation.md`，記載完成項目、驗證結果、計畫偏離與未解問題。

			```text
			$migration-execute
			I authorize local implementation of prepared slice <exercise> only, in target/Target.java.
			Implement from frozen legacy evidence; do not delegate target behavior back to legacy or read a completed solution.
			Retain a deliberately faulty local attempt: S-01 uses HALF_EVEN; E-01 omits credit/audit effects; E-02 omits restoration
			after injected failure. Run verification with a new --run fault directory and inspect the saved differences.
			Return to bizlogic/validate/safety-net if missing behavior invalidates the plan; update affected records.
			Repair the behavior, preserve the baseline and failed evidence, then verify into a new --run fixed directory.
			Implement only the selected slice; do not change unrelated behavior or business semantics.
			```

		9. `migration-verify`

			比對新舊系統行為，核對資料、副作用、整合及必要的效能與安全要求，評估是否具備上線與回復條件；重大且無法解釋的差異會阻擋就緒判定。可能產出：切片驗證報告 `verification.md` 與發布計畫 `rollout.md`，包含健康指標及回復步驟；驗證通過仍須另依授權程序執行正式環境切換。

			```text
			$migration-verify
			Independently review <exercise>'s plan, final Target, frozen baseline, failed attempt and corrected evidence.
			Compare every response/state field, inspect actual scope and rerun checks with a fresh --run reviewer.
			Run the routing rehearsal with --run route and classify differences and unproved behavior.
			Write verification.md and rollout.md for this slice; keep real Oracle/production readiness HOLD.
			```

		10. `migration-monitor`

			可貫穿各階段，獨立檢查進度停滯、範圍膨脹、證據不足、盤點遺漏與驗證欠缺，提出最小必要介入建議。可能產出：寫入 `progress.md` 的監控紀錄、綠黃紅燈判定、問題證據與改善建議，並視需要更新 `status.md`。

			```text
			$migration-monitor
			Review this lab's status, coverage, unknowns, baseline, fault/fix evidence and scoped diff.
			Look for copied solution claims, modified baselines, missed side effects and unsupported readiness.
			Report GREEN/YELLOW/RED and the smallest corrective action. Do not implement or edit shared records concurrently.
			```

	# 高層次執行順序

		`intake -> recon -> bizlogic -> validate -> safety-net -> design -> slice -> execute -> verify`

	# 單一 slice 執行順序

		`slice -> execute -> verify`

#  主要操作手法為 `coach` mode 可逐步導引下一步該做什麼

	- 指令

		$ai-migration
		Coach me: inspect the current migration state and explain the next safe stage.
		Give the exact next prompt and checkpoint. Do not execute the stage yet.

	- 然後同樣透過 progress.md 觀察 agent 的指示與下一步動作

	- 下一步動作範例

		$migration-recon

		Inventory only this supplied synthetic fixture; use source-only evidence. This is not an authoritative production-monolith inventory.
		Read .migration/charter.md, decisions.md and status.md. Preserve behavior and existing records. Spring Boot API/Vue UI are fixed; PostgreSQL and queue changes require separate proven slices.
		Enumerate deterministically, then map breadth-first with evidence and a coverage ledger. Account for Java, fictional Oracle SQL, entry points, side effects, jobs and missing surfaces. Separate Observed, Inferred, Unknown and Contradicted claims.
		Keep feature scope, acceptance ownership and runtime/data-handling questions unresolved unless explicitly answered. Parent classroom records are leads, not current approvals or parity proof.
		No implementation, installations, database execution, external messaging, production access or destructive operations. Update status.md/progress.md with evidence limits and the next checkpoint.

# skill 內建四大模式

	# Coach prompt

		```text
		$ai-migration
		Coach me: inspect the current migration state and explain the next safe stage.
		Give the exact next prompt and checkpoint. Do not execute the stage yet.
		```

	# Continue prompt

		```text
		$ai-migration
		Continue: select the earliest unmet prerequisite and execute that one stage.
		Locate, read in full and apply its migration-* SKILL.md; do not substitute a summary.
		Follow the charter's authorized scope. Stop at its checkpoint and report evidence or blockers.
		No production operations. Do not advance into another stage in this invocation.
		```

	# Status prompt

		```text
		$ai-migration
		Report migration status: current stage, current slice, missing evidence and next safe action.
		Check actual evidence against exit criteria. Do not implement or execute a migration stage.
		```

	# Review/monitor prompt

		```text
		$ai-migration
		Review migration process health using migration-monitor.
		Report GREEN/YELLOW/RED with evidence and the smallest corrective action. Do not implement.
		Return findings to the migration record owner for integration; do not edit shared records concurrently.
		```

# `.migration/` 儲存所有移轉工程之唯一真相

	- 重要文件

		- `charter.md`

			Inventory of current system status and build baseline.

		- `status.md`

			Where are we now? Current stage/slice, readiness, blockers and next safe action. A current summary can change as work advances.

		- `progress.md`

			How did we get here? A concise chronological history of meaningful work, failures, discoveries and revisits, with evidence links. It should not duplicate every command output or whole stage report.

		- `decisions.md`

			What did we choose, and why? Migration decisions, rationale, constraints and approval boundaries; link the relevant decisions from work history rather than copying them.


# skill 重點特色

	- 超大程式庫是分批逐層掃瞄建立地圖

		Tools first inventory the repository; the agent maps major surfaces breadth-first, tracks partial coverage, then explores candidate workflows and high-risk dependencies. Inventory/search may traverse all authorized files, which differs from loading all source into model context.

# 第一步指令

	$migration-intake
	
	Initialize .migration for this Java/Oracle monolith. Preserve current behavior.

	Target constraints: Spring Boot API, Vue UI; PostgreSQL and queue changes require separate proven slices.
	
	Use source and safe nonproduction evidence. Record unavailable environments and unknown intent.

	Allow local analysis, tests and scoped code only; no production writes/cutover or destructive operations.
	
	Do not implement yet. Save charter, status, decisions and progress.md; identify missing discovery inputs.

# 可啟動第二個 monitor agent 監看 `.migration` 進度

# 三個練習

	- S-01 quote calculation

		- calculate an order quote
	
	- E-01 accepted orders and duplicate handling

		- Select **order submission** as the workflow; 
		
		- after investigation, plan **accepted/idempotent submission** as this exercise's implementation slice.
	
	- E-02 rejection, recovery and retry.

		- Select **order submission** as the workflow; 
		
		- plan **rejected/failed submission and recovery** as slice

# 下一步指令

	```text
	$ai-migration
	Coach only. From recon evidence, recommend a short list of first candidate workflows.
	Explain value, entry points, dependencies, risks, available baseline/test environment and blocking unknowns.
	Recommend one and ask me to choose. If evidence is insufficient, identify the smallest useful investigation.
	Do not execute another migration stage or implement code.
	```

	```text
	$ai-migration
	I choose <candidate workflow> for focused investigation; record this choice and reason: <reason>.
	Continue with the earliest unmet prerequisite for this candidate and its relevant dependencies.
	If recon is sufficient, load migration-bizlogic and trace this workflow end to end.
	Stop at the selected stage checkpoint. Do not implement or authorize production operations.
	```

	---

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

# slice 實際執行流程

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
	