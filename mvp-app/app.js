const labelNames = {
  template_expression: "模板化表达",
  vague_argument: "空泛论述",
  lack_evidence: "缺少证据",
  lack_author_view: "缺少作者观点",
  mechanical_structure: "结构机械",
  overly_smooth_logic: "逻辑过于平滑",
  citation_needed: "需补真实引用",
  need_real_material: "需补真实材料",
  residual_instruction: "残留写作指令",
  repeated_expression: "冗余重复表达",
  template_stack: "模板结构堆砌",
  meta_revision_trace: "改写指令痕迹",
  style_inconsistency: "语调风格不均",
  placeholder_trace: "占位符残留",
  suspicious_metric: "可疑数据表达",
  problem_gap_significance: "问题空白意义模板",
  abstract_template_flow: "摘要模板推进",
  six_part_template: "六段式模板链条",
  jargon_stacking: "术语堆叠",
  over_precise_abstract: "摘要细节过载",
  performative_quant: "标准化量化口吻",
  incomplete_metric: "数值缺失",
  checklist_summary: "清单式摘要",
  bridge_conclusion: "承上启下收尾",
  over_neat_transition: "转折过于工整",
  verbose_mechanism: "机制说明冗长",
  over_explained_example: "举例解释过度",
  both_sides_conclusion: "两头说结论",
  expression: "表达优化",
  content: "内容补充",
  structure: "结构调整",
  compliance: "合规提醒"
};

const riskNames = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
  need_user_input: "需人工补充"
};

const rules = [
  {
    id: "R001",
    pattern: /随着.{0,18}(发展|进步|推进)/g,
    label: "template_expression",
    severity: "medium",
    strategyType: "content",
    reason: "使用常见宏观开头，容易显得模板化，且没有直接进入具体研究对象。",
    suggestion: "将宏观背景替换为论文中的具体对象、场景或研究问题。",
    steps: ["写出具体研究对象。", "说明该对象与本段论点的关系。", "删减泛化背景句。"]
  },
  {
    id: "R002",
    pattern: /(具有重要意义|具有重要价值|意义重大|有着十分重要的意义)/g,
    label: "vague_argument",
    severity: "medium",
    strategyType: "content",
    reason: "只判断重要性，但没有说明重要在哪里、对谁重要、通过什么路径产生影响。",
    suggestion: "补充影响对象、作用机制或可观察后果。",
    steps: ["指出影响对象。", "补充原因或路径。", "避免只停留在价值判断。"]
  },
  {
    id: "R003",
    pattern: /(机遇与挑战|挑战与机遇|不断完善|持续推进|有效措施|相关问题)/g,
    label: "vague_argument",
    severity: "medium",
    strategyType: "expression",
    reason: "这些表达信息密度较低，容易形成空泛总结。",
    suggestion: "替换为具体问题、具体措施或具体矛盾。",
    steps: ["把抽象词换成可描述的现象。", "补充限制条件。", "说明本段真正要讨论的矛盾。"]
  },
  {
    id: "R004",
    pattern: /(首先|其次|再次|最后|综上所述|总而言之)/g,
    label: "mechanical_structure",
    severity: "low",
    strategyType: "structure",
    reason: "连续使用顺序连接词会让段落结构显得机械。",
    suggestion: "改用因果、对比、递进或问题分析关系组织段落。",
    steps: ["判断句子之间的真实逻辑。", "减少固定排序词。", "用因果或对比关系改写连接。"]
  },
  {
    id: "R005",
    pattern: /(研究表明|有研究指出|相关研究显示|已有研究认为)/g,
    label: "citation_needed",
    severity: "high",
    strategyType: "compliance",
    reason: "出现研究依据提示，但没有可核验的文献信息时，容易形成引用不规范风险。",
    suggestion: "补充真实文献来源，或改成不依赖外部研究的谨慎表达。",
    steps: ["查找并补充真实文献。", "确认作者、年份、出处准确。", "没有依据时不要保留强断言。"],
    needUserInput: true
  },
  {
    id: "R006",
    pattern: /(问卷结果显示|访谈结果显示|实验结果表明|数据表明|案例显示)/g,
    label: "need_real_material",
    severity: "high",
    strategyType: "compliance",
    reason: "涉及数据、访谈、实验或案例，必须由用户提供真实材料，系统不能自动补造。",
    suggestion: "补充真实数据来源、样本信息、访谈对象或案例出处。",
    steps: ["确认材料真实存在。", "补充样本、时间、来源。", "没有材料时降低论断强度。"],
    needUserInput: true
  },
  {
    id: "R007",
    pattern: /(在一定程度上|从某种意义上|较为|相对|一定的|相关的)/g,
    label: "vague_argument",
    severity: "low",
    strategyType: "expression",
    reason: "限定词过多但没有给出边界，会削弱论证清晰度。",
    suggestion: "说明具体程度、条件或判断边界。",
    steps: ["删掉不必要的模糊限定。", "用具体条件替换笼统表达。", "保留必要但有解释的限制。"]
  },
  {
    id: "R008",
    pattern: /（[^）]*(此处|直接删除|不保留|需补充|若补充|方可改写|删除|改写)[^）]*）/g,
    label: "residual_instruction",
    severity: "high",
    strategyType: "compliance",
    reason: "括号内保留了修改指令或草稿提示，像是生成或编辑过程中未清理的痕迹。",
    suggestion: "删除所有写作指令，只保留可进入论文正文的内容；需要补材料的位置改为正式论述或先留给作者人工处理。",
    steps: ["删除括号内的操作性提示。", "检查是否还残留“此处”“需补充”“若补充”等草稿语。", "缺少数据时不要让系统代写事实。"],
    needUserInput: true
  },
  {
    id: "R009",
    pattern: /(测试显示|分析结果表明|结果显示|研究表明|数据显示).{0,18}(测试显示|分析结果表明|结果显示|研究表明|数据显示)/g,
    label: "repeated_expression",
    severity: "medium",
    strategyType: "structure",
    reason: "相近判断句式在短距离内重复出现，像不同版本拼接在一起，削弱段落流畅度。",
    suggestion: "合并重复判断，保留一次最准确的结果表达，并把后续句子改为原因、条件或影响。",
    steps: ["找出重复的判断句。", "保留信息量最高的一句。", "把剩余内容改成补充解释而不是再次判断。"]
  },
  {
    id: "R010",
    pattern: /(从.{1,16}角度分析|作为一款面向.{0,24}的产品|本文的研究结论不仅.{0,40}同时也|不仅.{0,40}同时|不仅.{0,40}而且)/g,
    label: "template_stack",
    severity: "medium",
    strategyType: "expression",
    reason: "该表达属于常见学术模板句式，如果连续堆叠会显得八股化，缺少自然论证推进。",
    suggestion: "减少固定句式，用具体研究对象、测量结果、限制条件或对比关系来推进段落。",
    steps: ["删减“不仅……同时……”等套式结构。", "把“从……角度”改为具体分析对象。", "用一到两个具体结论替代泛化总结。"]
  },
  {
    id: "R011",
    pattern: /(把.{0,30}改为.{0,40}|改为因果或对比|相较于语言润色|去掉所有括号注释|合并重复内容|降低AI味)/g,
    label: "meta_revision_trace",
    severity: "high",
    strategyType: "compliance",
    reason: "文本中出现了对改写方式的自我指令，说明草稿编辑痕迹被误保留到了正文中。",
    suggestion: "把这类自我指令从正文中删除，再根据真实论文逻辑重新组织句子。",
    steps: ["删除“把……改为……”这类操作说明。", "确认正文只保留论文内容。", "如果确实需要对比，直接写对比结论，不写改写指令。"]
  },
  {
    id: "R012",
    pattern: /(但|然而|但根据).{0,16}(但|然而|但根据)/g,
    label: "style_inconsistency",
    severity: "medium",
    strategyType: "structure",
    reason: "短距离内连续转折，容易形成拼接感，说明段落逻辑推进不够自然。",
    suggestion: "梳理转折之间的主次关系，只保留一个核心转折，其余内容改为解释、条件或结果。",
    steps: ["确定本段真正的转折点。", "删掉多余转折词。", "把剩余句子改成因果、限制或补充说明。"]
  },
  {
    id: "R013",
    pattern: /（[^）]*(X\s*ms|需用户填入|用户填入|真实值|示例数值|实际需测量|具体数值需|该数值为示例)[^）]*）/gi,
    label: "placeholder_trace",
    severity: "high",
    strategyType: "compliance",
    reason: "括号中保留了占位符、示例数值或待用户补充提示，属于明显草稿痕迹，不能进入论文正文。",
    suggestion: "删除占位符提示；有实测值就写真实值，没有实测值就改为谨慎的定性表述。",
    steps: ["删除“需用户填入”“示例数值”等提示。", "补入真实测量值或范围。", "没有数据时避免写精确数值。"],
    needUserInput: true
  },
  {
    id: "R014",
    pattern: /(虽然.{0,45}然而|虽然.{0,45}但|同样受制于.{0,45}但|然而.{0,45}但)/g,
    label: "over_neat_transition",
    severity: "medium",
    strategyType: "structure",
    reason: "转折结构过于工整，且短距离连续出现，容易显得像模板化对比而非自然论证。",
    suggestion: "减少成组转折，只保留最关键的限制或反差，其余内容改为直接说明。",
    steps: ["找出本段最重要的一个转折。", "删掉重复的“虽然/然而/但”。", "用具体结果或条件连接句子。"]
  },
  {
    id: "R015",
    pattern: /(该性能优势可能源自.{0,50}具体机制需结合.{0,30}进一步验证|具体机制需结合.{0,30}进一步验证)/g,
    label: "verbose_mechanism",
    severity: "low",
    strategyType: "expression",
    reason: "机制解释偏长且书面化，如果上下文证据不足，会显得像自动生成的谨慎套话。",
    suggestion: "压缩机制解释，保留可验证的判断，并说明需要后续验证的具体对象。",
    steps: ["缩短长句。", "保留明确机制或验证对象。", "避免用过长的谨慎套话替代真实证据。"]
  },
  {
    id: "R016",
    pattern: /(例如用户可在短期内无损失退款.{0,30}更愿意尝试不同配置|从而更愿意尝试不同配置)/g,
    label: "over_explained_example",
    severity: "low",
    strategyType: "expression",
    reason: "举例解释过细，像是在解释概念本身，可能削弱摘要的凝练性。",
    suggestion: "摘要中保留概括性结果即可，过细的例子可移到正文分析部分。",
    steps: ["删减过细举例。", "保留与结论直接相关的信息。", "把概念解释移至正文。"]
  },
  {
    id: "R017",
    pattern: /(.{2,24}日趋普遍.{0,30}但.{0,30}仍缺乏.{0,30}这使.{0,30}(风险|困境|问题))/g,
    label: "problem_gap_significance",
    severity: "medium",
    strategyType: "structure",
    reason: "开篇采用“现象普遍-研究空白-问题意义”的三段式模板，容易显得像自动生成的学术摘要。",
    suggestion: "直接交代研究对象和真实问题，减少套式铺垫。",
    steps: ["删减泛化背景。", "写清楚具体研究对象。", "用真实观察或测量问题替代抽象意义句。"]
  },
  {
    id: "R018",
    pattern: /(采用定量与定性相结合的方法|定量与定性相结合|系统评估.{0,30}(表现|影响|效果|价值))/g,
    label: "template_stack",
    severity: "medium",
    strategyType: "expression",
    reason: "“定量与定性相结合”“系统评估”是高频方法套话，如未说明具体方法，会显得空泛。",
    suggestion: "写出具体测量指标、样本、比较对象或评价维度。",
    steps: ["替换笼统方法名称。", "补充实际测量维度。", "说明评价对象和比较基准。"],
    needUserInput: true
  },
  {
    id: "R019",
    pattern: /(\[[A-Z]\]\s*%|\[Y\]\s*%|\[X\]|\[待填\]|（[^）]*(\[Y\]|Y%|X%)[^）]*）)/gi,
    label: "placeholder_trace",
    severity: "high",
    strategyType: "compliance",
    reason: "文本中存在方括号变量或百分比占位符，说明真实数据尚未填写，不能作为正文提交。",
    suggestion: "补充真实测量值；没有数据时删除精确百分比或改成定性描述。",
    steps: ["删除 [Y]% 这类占位符。", "核对真实数据来源。", "无法核实时不要保留精确数值。"],
    needUserInput: true
  },
  {
    id: "R020",
    pattern: /(约\s*[123]\s*%|多出约\s*[123]\s*%|降低约\s*[123]\s*%|优化幅度约\s*[123]\s*%)/g,
    label: "suspicious_metric",
    severity: "high",
    strategyType: "compliance",
    reason: "小幅百分比在上下文中可能缺乏解释，容易像为了制造数据感而加入的精确数字。",
    suggestion: "核验该数值是否来自真实测量；如果只是示例，应删除或改为定性表述。",
    steps: ["确认数据来源和计算方式。", "说明样本量或测试条件。", "没有真实依据时删除该百分比。"],
    needUserInput: true
  },
  {
    id: "R021",
    pattern: /（例如.{0,50}(从而|因此|更愿意|可在|能够).{0,40}）/g,
    label: "over_explained_example",
    severity: "low",
    strategyType: "expression",
    reason: "括号中用较长例子解释概念，像模型在补充说明，摘要中会显得冗余。",
    suggestion: "删去括号内解释，保留正文中的核心判断。",
    steps: ["删除过长括号解释。", "保留核心结论。", "需要举例时移到正文段落。"]
  },
  {
    id: "R022",
    pattern: /(既.{0,20}(优势|价值|改善).{0,40}(短板|不足|局限|风险)|主要风险点|同时也.{0,30}(短板|风险|局限))/g,
    label: "both_sides_conclusion",
    severity: "medium",
    strategyType: "structure",
    reason: "结论同时强调优势和短板，再落到风险点，容易显得全面但缺乏明确判断。",
    suggestion: "明确本文最重要的结论，把限制条件作为补充，而不是平均铺陈。",
    steps: ["先写最核心结论。", "只保留与结论直接相关的限制。", "避免为了平衡而平衡。"]
  },
  {
    id: "R023",
    pattern: /(背景|现状|问题).{0,80}(方法|采用|评估).{0,100}(结果|表明|显示).{0,100}(结论|因此|本文认为)/g,
    label: "abstract_template_flow",
    severity: "medium",
    strategyType: "structure",
    reason: "段落按“背景-方法-结果-结论”过于规整推进，像套用了摘要模板，缺少重点取舍。",
    suggestion: "弱化模板顺序，优先突出一个核心发现，再交代方法和限制。",
    steps: ["找出最重要的发现。", "压缩背景和方法套话。", "避免四段式平均铺陈。"]
  },
  {
    id: "R024",
    pattern: /(实证依据|试错风险|优先级调度|资源超售策略|抖动风险|共享带宽|CPU抢占|高负载抖动|工单响应|计费策略)/g,
    label: "jargon_stacking",
    severity: "low",
    strategyType: "expression",
    reason: "术语密度较高，如果缺少自然衔接，会显得像概念堆叠而不是作者自己的分析。",
    suggestion: "减少同一段内的术语数量，补清术语之间的因果或层级关系。",
    steps: ["保留与核心结论直接相关的术语。", "删除装饰性黑话。", "说明相邻术语之间的逻辑关系。"]
  },
  {
    id: "R025",
    pattern: /(N\s*=\s*\d+|P\s*[<＜]\s*0\.\d+|p\s*[<＜]\s*0\.\d+|详见实验部分|详见.{0,8}部分|本例中.{0,20}峰值约为.{0,20}倍)/g,
    label: "over_precise_abstract",
    severity: "medium",
    strategyType: "structure",
    reason: "摘要中塞入样本量、显著性、实验部分引用或过细统计说明，会显得像实验报告内引，削弱摘要凝练性。",
    suggestion: "摘要保留概括性结论，把样本量、显著性和实验细节移到方法或结果部分。",
    steps: ["删除摘要中的过细统计内引。", "保留一条最关键结果。", "把详细数值放到正文实验部分。"]
  },
  {
    id: "R026",
    pattern: /(稳定在以下|稳定在以内|低于以下|控制在以下|保持在以下|降低约\d+%，[^。；，]*稳定在以下)/g,
    label: "incomplete_metric",
    severity: "high",
    strategyType: "compliance",
    reason: "句子出现“稳定在以下”等未完成数值表达，像生成时漏填了具体指标。",
    suggestion: "补充真实数值和单位；没有实测值时删除该精确判断。",
    steps: ["检查是否漏填数值。", "补充真实测量值和单位。", "无法核实时改为定性描述。"],
    needUserInput: true
  },
  {
    id: "R027",
    pattern: /(延迟|丢包|计费|工单|响应|超售|故障|排查|抖动).{0,25}(延迟|丢包|计费|工单|响应|超售|故障|排查|抖动).{0,25}(延迟|丢包|计费|工单|响应|超售|故障|排查|抖动).{0,25}(延迟|丢包|计费|工单|响应|超售|故障|排查|抖动)/g,
    label: "checklist_summary",
    severity: "medium",
    strategyType: "structure",
    reason: "短段落内平均塞入多个指标，像检查清单而不是围绕核心发现展开的摘要。",
    suggestion: "压缩次要维度，突出一个主结论和一到两个支撑指标。",
    steps: ["选出最核心发现。", "删除或后移次要指标。", "让摘要围绕一个判断展开。"]
  },
  {
    id: "R028",
    pattern: /(背景|现状).{0,60}(问题|风险|不足).{0,80}(方法|采用|评估).{0,100}(结果|显示|表明).{0,100}(讨论|分析|解释).{0,100}(结论|发现|表明)/g,
    label: "six_part_template",
    severity: "medium",
    strategyType: "structure",
    reason: "段落完整覆盖“背景-问题-方法-结果-讨论-结论”链条，结构过于工整，像教科书式摘要模板。",
    suggestion: "打破平均铺陈，围绕一个最核心发现组织摘要。",
    steps: ["压缩背景和讨论。", "突出最重要的结果。", "删去模板化过渡。"]
  },
  {
    id: "R029",
    pattern: /(【[^】]*(请补充|请提供|待填|真实|实测|行业参考标准)[^】]*】|\[[^\]]*(请补充|请提供|待填|真实|实测|行业参考标准)[^\]]*\])/g,
    label: "placeholder_trace",
    severity: "high",
    strategyType: "compliance",
    reason: "文本中出现方括号或中文方括号待填提示，属于明显生成草稿残留。",
    suggestion: "删除待填提示；有真实材料就补入正文，没有材料则保留为人工待办而非论文正文。",
    steps: ["删除【请补充】或 [请提供]。", "核实是否有真实数据或标准。", "没有依据时不要保留该判断。"],
    needUserInput: true
  },
  {
    id: "R030",
    pattern: /(4\.2\s*小时.{0,40}(4\s*小时|接近)|N\s*=\s*\d+.{0,40}P\s*[<＜]\s*0\.\d+|P\s*[<＜]\s*0\.\d+.{0,40}N\s*=\s*\d+)/g,
    label: "performative_quant",
    severity: "high",
    strategyType: "compliance",
    reason: "精确数字、样本量和显著性组合得过于标准化，且前后解释可能牵强，需核验真实数据来源。",
    suggestion: "核对数据、样本和统计方法；如果只是示例或生成痕迹，应删除精确数字。",
    steps: ["确认数据是否来自真实测试。", "检查统计结论是否支持原文判断。", "无法核验时删除或改为定性表述。"],
    needUserInput: true
  },
  {
    id: "R031",
    pattern: /(这些发现表明.{0,80}后续研究可进一步|后续研究可进一步|未来研究可进一步|这些发现不仅.{0,60}也为.{0,60}提供)/g,
    label: "bridge_conclusion",
    severity: "medium",
    strategyType: "structure",
    reason: "结尾采用“这些发现表明……后续研究可进一步……”的承上启下模板，显得像论文摘要套话。",
    suggestion: "改为更直接的结论或实际建议，避免为了收束而套用研究展望句。",
    steps: ["删除泛化研究展望。", "直接写出核心判断。", "根据文章类型给出明确建议或限制。"]
  }
];

const sampleText = `随着人工智能技术的不断发展，AIGC技术在高校论文写作中得到了广泛应用，并对高校学术诚信带来了机遇与挑战。

目前，学生在论文写作中会使用生成式人工智能进行资料整理、提纲生成和语言润色。相关研究表明，这种方式能够在一定程度上提高写作效率，但也可能导致论文表达趋于模板化。

首先，AIGC工具可以帮助学生快速形成文章结构。其次，AIGC工具可以优化语言表达。最后，AIGC工具还可以辅助学生完善论文内容。综上所述，合理使用AIGC具有重要意义。

如果要进一步讨论该问题，还需要结合学校政策、导师反馈或学生实际写作过程中的案例进行分析。`;

const state = {
  paragraphs: [],
  selectedId: null,
  filter: "all",
  meta: {},
  modelEnabled: false,
  modelStatus: "idle"
};

const els = {
  sourceText: document.querySelector("#sourceText"),
  textStats: document.querySelector("#textStats"),
  sectionSelect: document.querySelector("#sectionSelect"),
  disciplineSelect: document.querySelector("#disciplineSelect"),
  strengthSelect: document.querySelector("#strengthSelect"),
  analyzeBtn: document.querySelector("#analyzeBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  loadSampleBtn: document.querySelector("#loadSampleBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  startPanel: document.querySelector("#startPanel"),
  resultPanel: document.querySelector("#resultPanel"),
  paragraphList: document.querySelector("#paragraphList"),
  summaryBadge: document.querySelector("#summaryBadge"),
  originalTextView: document.querySelector("#originalTextView"),
  highlightedText: document.querySelector("#highlightedText"),
  editedText: document.querySelector("#editedText"),
  editStats: document.querySelector("#editStats"),
  activeParagraphTitle: document.querySelector("#activeParagraphTitle"),
  suggestionList: document.querySelector("#suggestionList"),
  issueCount: document.querySelector("#issueCount"),
  backToInputBtn: document.querySelector("#backToInputBtn"),
  reanalyzeBtn: document.querySelector("#reanalyzeBtn"),
  riskFilters: document.querySelector("#riskFilters"),
  suggestionTemplate: document.querySelector("#suggestionTemplate"),
  modelToggle: document.querySelector("#modelToggle"),
  apiKeyInput: document.querySelector("#apiKeyInput"),
  saveKeyToggle: document.querySelector("#saveKeyToggle"),
  baseUrlInput: document.querySelector("#baseUrlInput"),
  modelInput: document.querySelector("#modelInput"),
  clearKeyBtn: document.querySelector("#clearKeyBtn"),
  testModelBtn: document.querySelector("#testModelBtn"),
  modelStatus: document.querySelector("#modelStatus"),
  resultModelStatus: document.querySelector("#resultModelStatus")
};

function segmentText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}|(?<=。)\n|(?<=；)\n|(?<=！)\n|(?<=？)\n/g)
    .map(item => item.trim())
    .filter(item => item.length >= 8)
    .map((textValue, index) => ({
      paragraphId: `p${String(index + 1).padStart(3, "0")}`,
      originalText: textValue,
      editedText: textValue,
      riskLevel: "low",
      labels: [],
      issues: [],
      source: "rule"
    }));
}

function diagnoseParagraphWithRules(paragraph) {
  const issues = [];

  rules.forEach(rule => {
    const matches = [...paragraph.editedText.matchAll(rule.pattern)];
    matches.slice(0, 4).forEach((match, index) => {
      const spanText = match[0];
      issues.push({
        issueId: `${paragraph.paragraphId}-${rule.id}-${index}`,
        ruleId: rule.id,
        spanText,
        startOffset: match.index,
        endOffset: match.index + spanText.length,
        label: rule.label,
        reason: rule.reason,
        strategyType: rule.strategyType,
        actionSteps: rule.steps,
        suggestion: rule.suggestion,
        rewriteSample: buildRuleRewriteSample(rule.label, spanText),
        needUserInput: Boolean(rule.needUserInput),
        userInputPrompt: rule.needUserInput ? "请补充真实文献、数据、案例、政策或研究过程材料。" : "",
        severity: rule.severity,
        status: "pending",
        source: "rule"
      });
    });
  });

  paragraph.issues = issues;
  refreshParagraphRisk(paragraph);
  return paragraph;
}

function buildRuleRewriteSample(label, spanText) {
  if (label === "template_expression") {
    return "";
  }
  if (label === "vague_argument") {
    return "";
  }
  if (label === "citation_needed") {
    return "";
  }
  if (label === "need_real_material") {
    return "";
  }
  if (label === "mechanical_structure") {
    return "";
  }
  if (label === "residual_instruction") {
    return "";
  }
  if (label === "repeated_expression") {
    return "";
  }
  if (label === "template_stack") {
    return "";
  }
  if (label === "meta_revision_trace") {
    return "";
  }
  if (label === "style_inconsistency") {
    return "";
  }
  return "";
}

function refreshParagraphRisk(paragraph) {
  paragraph.labels = [...new Set(paragraph.issues.map(item => item.label))];
  paragraph.riskLevel = calculateRisk(paragraph.issues);
}

function calculateRisk(issues) {
  if (issues.some(item => item.needUserInput)) return "need_user_input";
  const highCount = issues.filter(item => item.severity === "high").length;
  const mediumCount = issues.filter(item => item.severity === "medium").length;
  if (highCount || mediumCount >= 2 || issues.length >= 4) return "high";
  if (mediumCount || issues.length >= 2) return "medium";
  return "low";
}

async function analyze() {
  const paragraphs = segmentText(els.sourceText.value);
  if (!paragraphs.length) {
    alert("请先输入至少一段论文文本。");
    return;
  }

  state.meta = {
    sectionType: els.sectionSelect.value,
    discipline: els.disciplineSelect.value,
    strength: els.strengthSelect.value,
    createdAt: new Date().toLocaleString()
  };
  state.paragraphs = paragraphs.map(diagnoseParagraphWithRules);
  state.selectedId = state.paragraphs[0].paragraphId;
  state.filter = "all";
  state.modelEnabled = els.modelToggle.checked;

  els.startPanel.classList.add("hidden");
  els.resultPanel.classList.remove("hidden");
  els.exportBtn.disabled = false;
  els.reanalyzeBtn.disabled = false;
  renderAll();

  if (state.modelEnabled) {
    await runModelDiagnosisForAll();
  }
}

async function runModelDiagnosisForAll() {
  const config = readModelConfig();
  if (!config.apiKey) {
    setModelStatus("未填写 API 密钥，已使用本地规则诊断。", "warn");
    return;
  }

  setBusy(true);
  const batches = chunkArray(state.paragraphs, 1);
  let modelErrorCount = 0;
  const modelErrors = [];
  setModelStatus(`正在调用模型分析段落…… 0/${state.paragraphs.length}`, "loading");
  try {
    for (let index = 0; index < batches.length; index += 1) {
      const batch = batches[index];
      const doneCount = index;
      setModelStatus(`正在调用模型分析段落…… ${doneCount}/${state.paragraphs.length}`, "loading");
      const payload = await fetchModelDiagnosis(batch, config);
      mergeModelResult(payload.result);
      if (payload.result?.model_error) {
        modelErrorCount += 1;
        modelErrors.push(payload.result.model_error);
      }
      renderAll();
      setModelStatus(`正在调用模型分析段落…… ${Math.min(index + 1, state.paragraphs.length)}/${state.paragraphs.length}`, "loading");
    }

    const analyzed = state.paragraphs.filter(item => item.source === "model").length;
    if (modelErrorCount) {
      const firstError = modelErrors[0] ? `首个错误：${modelErrors[0]}` : "";
      setModelStatus(`模型逐段分析完成，${analyzed} 段已合并，${modelErrorCount} 段失败并保留规则结果。${firstError}`, "warn");
    } else {
      setModelStatus(`模型诊断已合并到结果中，共分析 ${analyzed} 段。`, "ok");
    }
  } catch (error) {
    setModelStatus(`模型调用失败：${error.message}。当前保留本地规则诊断结果。`, "error");
  } finally {
    setBusy(false);
  }
}

async function reanalyzeActiveParagraph() {
  const paragraph = getActiveParagraph();
  if (!paragraph) return;

  const originalButtonText = els.reanalyzeBtn.textContent;
  els.reanalyzeBtn.textContent = "分析中...";
  setBusy(true);
  setModelStatus("正在用本地规则重新分析当前段落……", "loading");

  paragraph.editedText = els.editedText.value.trim();
  diagnoseParagraphWithRules(paragraph);
  renderAll();

  if (readModelConfig().apiKey) {
    setModelStatus("正在重新分析当前段落……", "loading");
    try {
      const payload = await fetchModelDiagnosis([paragraph]);
      mergeModelResult(payload.result);
      state.modelEnabled = true;
      if (payload.result?.model_error) {
        setModelStatus(`模型输出解析失败，当前段落保留规则重析。${payload.result.model_error}`, "warn");
      } else {
        setModelStatus("当前段落已完成模型分析。", "ok");
      }
      renderAll();
    } catch (error) {
      setModelStatus(`重新分析失败：${error.message}`, "error");
    } finally {
      setBusy(false);
      els.reanalyzeBtn.textContent = originalButtonText;
    }
    return;
  }

  setModelStatus("当前段落已完成规则重析。若要使用模型，请展开模型配置并填写 API Key。", "warn");
  setBusy(false);
  els.reanalyzeBtn.textContent = originalButtonText;
}

async function fetchModelDiagnosis(paragraphs, existingConfig = null) {
  const config = existingConfig || readModelConfig();
  const response = await fetch("/api/model-diagnose", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...config,
      meta: state.meta,
      paragraphs: paragraphs.map(item => ({
        paragraph_id: item.paragraphId,
        text: item.editedText
      }))
    })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "模型接口调用失败");
  }
  return payload;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function mergeModelResult(result) {
  if (!result || !Array.isArray(result.paragraphs)) {
    throw new Error("模型返回结构缺少 paragraphs");
  }

  result.paragraphs.forEach(modelParagraph => {
    const paragraph = state.paragraphs.find(item => item.paragraphId === modelParagraph.paragraph_id);
    if (!paragraph) return;

    const modelIssues = Array.isArray(modelParagraph.issues) ? modelParagraph.issues : [];
    if (!modelIssues.length) return;
    const normalizedIssues = modelIssues.map((issue, index) => normalizeModelIssue(issue, paragraph, index));
    paragraph.issues = mergeIssues(paragraph.issues, normalizedIssues);
    paragraph.riskLevel = normalizeRisk(modelParagraph.risk_level) || calculateRisk(paragraph.issues);
    paragraph.labels = [...new Set(paragraph.issues.map(item => item.label))];
    paragraph.source = "model";
  });
}

function mergeIssues(ruleIssues, modelIssues) {
  const existing = new Set();
  const merged = [];

  [...modelIssues, ...ruleIssues].forEach(issue => {
    const key = `${issue.label}-${issue.spanText}`;
    if (existing.has(key)) return;
    existing.add(key);
    merged.push(issue);
  });

  return merged.slice(0, 8);
}

function normalizeModelIssue(issue, paragraph, index) {
  const spanText = String(issue.span_text || issue.spanText || paragraph.editedText.slice(0, 60)).trim();
  const foundOffset = paragraph.editedText.indexOf(spanText);
  const startOffset = Number.isInteger(issue.start_offset) ? issue.start_offset : Math.max(foundOffset, 0);
  const endOffset = Number.isInteger(issue.end_offset) ? issue.end_offset : startOffset + spanText.length;
  const label = normalizeLabel(issue.label);
  const strategyType = normalizeStrategy(issue.strategy_type);

  return {
    issueId: issue.issue_id || `${paragraph.paragraphId}-AI-${index}`,
    ruleId: "AI",
    spanText,
    startOffset,
    endOffset,
    label,
    reason: issue.reason || "模型认为该处存在表达质量或论证充分性问题。",
    strategyType,
    actionSteps: normalizeSteps(issue.action_steps),
    suggestion: issue.suggestion || "请根据论文真实材料进行具体化修改。",
    rewriteSample: normalizeRewriteSample(issue.rewrite_sample),
    needUserInput: Boolean(issue.need_user_input),
    userInputPrompt: issue.user_input_prompt || "",
    severity: normalizeSeverity(issue.severity),
    status: "pending",
    source: "model"
  };
}

function normalizeRisk(value) {
  return ["low", "medium", "high", "need_user_input"].includes(value) ? value : "";
}

function normalizeLabel(value) {
  const valid = Object.keys(labelNames);
  return valid.includes(value) ? value : "content";
}

function normalizeStrategy(value) {
  return ["expression", "content", "structure", "compliance"].includes(value) ? value : "content";
}

function normalizeSeverity(value) {
  return ["low", "medium", "high"].includes(value) ? value : "medium";
}

function normalizeSteps(value) {
  if (Array.isArray(value) && value.length) return value.map(String).slice(0, 5);
  return ["具体说明问题对象。", "补充真实材料或分析依据。", "保留原意，减少模板化表述。"];
}

function normalizeRewriteSample(value) {
  const sample = String(value || "").trim();
  if (!sample) return "";
  if (looksLikeInstruction(sample)) return "";
  return sample;
}

function looksLikeInstruction(text) {
  return /^(建议|请|需要|可|可以|应|应该|将|把|改为|删除|补充|合并|保留|避免|减少|改写|替换|围绕|先|再|如果|如需)/.test(text)
    || /(例如|如：|示例|需补充|方可改写|不要|不能|系统不|由用户)/.test(text);
}

function renderAll() {
  renderParagraphs();
  renderActiveParagraph();
  renderSummary();
}

function renderParagraphs() {
  const visible = state.paragraphs.filter(item => state.filter === "all" || item.riskLevel === state.filter);
  els.paragraphList.innerHTML = "";

  visible.forEach(paragraph => {
    const absoluteIndex = state.paragraphs.indexOf(paragraph);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `paragraph-item ${paragraph.riskLevel} ${paragraph.paragraphId === state.selectedId ? "active" : ""}`;
    button.dataset.id = paragraph.paragraphId;
    button.innerHTML = `
      <span class="paragraph-meta">
        <strong>段落 ${absoluteIndex + 1}</strong>
        <span>${riskNames[paragraph.riskLevel]} · ${paragraph.source === "model" ? "模型" : "规则"}</span>
      </span>
      <span class="paragraph-preview">${escapeHtml(paragraph.editedText)}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedId = paragraph.paragraphId;
      renderAll();
    });
    els.paragraphList.appendChild(button);
  });
}

function renderActiveParagraph() {
  const paragraph = getActiveParagraph();
  if (!paragraph) return;

  els.activeParagraphTitle.textContent = `段落 ${state.paragraphs.indexOf(paragraph) + 1}：${riskNames[paragraph.riskLevel]}`;
  els.originalTextView.innerHTML = buildOriginalText(paragraph);
  els.editedText.value = paragraph.editedText;
  els.editStats.textContent = `${paragraph.editedText.length} 字`;
  renderSuggestions(paragraph);
}

function renderSuggestions(paragraph) {
  els.suggestionList.innerHTML = "";
  els.issueCount.textContent = `${paragraph.issues.length} 条`;

  if (!paragraph.issues.length) {
    els.suggestionList.innerHTML = `<p class="notice">当前段落未命中明显模板化或空泛表达，可保留或进行轻度润色。</p>`;
    return;
  }

  paragraph.issues.forEach(issue => {
    const card = els.suggestionTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector(".issue-label").textContent = `${labelNames[issue.label] || issue.label} · ${issue.source === "model" ? "模型" : "规则"}`;
    card.querySelector(".issue-status").textContent = statusName(issue.status);
    card.querySelector(".span-text").textContent = issue.spanText;
    card.querySelector(".issue-reason").textContent = issue.reason;
    card.querySelector(".issue-steps").innerHTML = `<ol>${issue.actionSteps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
    card.querySelector(".rewrite-sample").textContent = issue.rewriteSample || "无可直接替换文本，请按上方策略手动处理。";
    card.querySelector(".accept-btn").addEventListener("click", () => updateIssueStatus(issue.issueId, "accepted"));
    card.querySelector(".need-btn").addEventListener("click", () => updateIssueStatus(issue.issueId, "need_input"));
    card.querySelector(".ignore-btn").addEventListener("click", () => updateIssueStatus(issue.issueId, "ignored"));
    els.suggestionList.appendChild(card);
  });
}

function buildHighlightedText(paragraph) {
  const issues = [...paragraph.issues].sort((a, b) => a.startOffset - b.startOffset);
  let html = "";
  let cursor = 0;

  issues.forEach(issue => {
    if (issue.startOffset < cursor) return;
    const safeStart = Math.max(0, Math.min(issue.startOffset, paragraph.editedText.length));
    const safeEnd = Math.max(safeStart, Math.min(issue.endOffset, paragraph.editedText.length));
    html += escapeHtml(paragraph.editedText.slice(cursor, safeStart));
    html += `<mark class="mark ${paragraph.riskLevel}" title="${escapeHtml(labelNames[issue.label] || issue.label)}">${escapeHtml(paragraph.editedText.slice(safeStart, safeEnd))}</mark>`;
    cursor = safeEnd;
  });
  html += escapeHtml(paragraph.editedText.slice(cursor));
  return html;
}

function buildOriginalText(paragraph) {
  const originalIssues = paragraph.issues.map(issue => {
    const startOffset = paragraph.originalText.indexOf(issue.spanText);
    return {
      ...issue,
      startOffset,
      endOffset: startOffset + issue.spanText.length
    };
  }).filter(issue => issue.startOffset >= 0);

  return buildMarkedText(paragraph.originalText, originalIssues, paragraph.riskLevel);
}

function buildCurrentText(paragraph) {
  const acceptedIssues = paragraph.issues
    .filter(issue => issue.status === "accepted" && issue.rewriteSample)
    .map(issue => {
      const startOffset = paragraph.editedText.indexOf(issue.rewriteSample);
      return {
        ...issue,
        startOffset,
        endOffset: startOffset + issue.rewriteSample.length,
        label: "accepted_change"
      };
    })
    .filter(issue => issue.startOffset >= 0);

  if (acceptedIssues.length) {
    return buildMarkedText(paragraph.editedText, acceptedIssues, "accepted");
  }

  return buildHighlightedText(paragraph);
}

function buildMarkedText(text, marks, riskLevel) {
  const sortedMarks = [...marks].sort((a, b) => a.startOffset - b.startOffset);
  let html = "";
  let cursor = 0;

  sortedMarks.forEach(mark => {
    if (mark.startOffset < cursor) return;
    const safeStart = Math.max(0, Math.min(mark.startOffset, text.length));
    const safeEnd = Math.max(safeStart, Math.min(mark.endOffset, text.length));
    html += escapeHtml(text.slice(cursor, safeStart));
    html += `<mark class="mark ${riskLevel}" title="${escapeHtml(labelNames[mark.label] || "已采纳改动")}">${escapeHtml(text.slice(safeStart, safeEnd))}</mark>`;
    cursor = safeEnd;
  });
  html += escapeHtml(text.slice(cursor));
  return html;
}

function updateIssueStatus(issueId, status) {
  const paragraph = getActiveParagraph();
  const issue = paragraph.issues.find(item => item.issueId === issueId);
  if (!issue) return;
  issue.status = status;

  if (status === "accepted") {
    const replacement = normalizeRewriteSample(issue.rewriteSample);
    if (replacement) {
      paragraph.editedText = replaceFirst(paragraph.editedText, issue.spanText, replacement);
      paragraph.editedText = paragraph.editedText.replace(/\s{2,}/g, " ");
      issue.rewriteSample = replacement;
      flashEditBox();
    } else if (shouldDeleteOnAccept(issue)) {
      paragraph.editedText = replaceFirst(paragraph.editedText, issue.spanText, "");
      paragraph.editedText = paragraph.editedText.replace(/\s{2,}/g, " ");
      flashEditBox();
    } else {
      setModelStatus("这条建议没有可直接写入正文的改写文本，已标记采纳但未改动正文。", "warn");
    }
  }

  renderAll();
}

function shouldDeleteOnAccept(issue) {
  return ["residual_instruction", "meta_revision_trace", "placeholder_trace", "over_explained_example"].includes(issue.label);
}

function flashEditBox() {
  els.editedText.classList.remove("changed");
  window.setTimeout(() => els.editedText.classList.add("changed"), 0);
}

function renderSummary() {
  const counts = state.paragraphs.reduce((acc, item) => {
    acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
    return acc;
  }, {});
  els.summaryBadge.textContent = `高 ${counts.high || 0} / 中 ${counts.medium || 0} / 需补充 ${counts.need_user_input || 0}`;
}

function updateStats() {
  const paragraphs = segmentText(els.sourceText.value);
  els.textStats.textContent = `${els.sourceText.value.trim().length} 字 / ${paragraphs.length} 段`;
}

function exportReport() {
  const stats = state.paragraphs.reduce((acc, paragraph) => {
    paragraph.labels.forEach(label => {
      acc[label] = (acc[label] || 0) + 1;
    });
    return acc;
  }, {});

  const lines = [
    "# 论文原创表达诊断报告",
    "",
    `- 处理时间：${state.meta.createdAt}`,
    `- 章节类型：${state.meta.sectionType}`,
    `- 学科：${state.meta.discipline}`,
    `- 优化强度：${state.meta.strength}`,
    `- 模型增强：${state.modelEnabled ? "已启用" : "未启用"}`,
    `- 段落数量：${state.paragraphs.length}`,
    "",
    "## 风险概览",
    ...Object.entries(riskNames).map(([key, name]) => `- ${name}：${state.paragraphs.filter(item => item.riskLevel === key).length}`),
    "",
    "## 问题分布",
    ...Object.entries(stats).map(([key, count]) => `- ${labelNames[key] || key}：${count}`),
    "",
    "## 段落建议"
  ];

  state.paragraphs.forEach((paragraph, index) => {
    lines.push("", `### 段落 ${index + 1}｜${riskNames[paragraph.riskLevel]}｜${paragraph.source === "model" ? "模型增强" : "规则诊断"}`, "");
    if (!paragraph.issues.length) {
      lines.push("- 未命中明显问题。");
      return;
    }
    paragraph.issues.forEach(issue => {
      lines.push(`- 问题：${labelNames[issue.label] || issue.label}`);
      lines.push(`  - 来源：${issue.source === "model" ? "模型" : "规则"}`);
      lines.push(`  - 原文片段：${issue.spanText}`);
      lines.push(`  - 原因：${issue.reason}`);
      lines.push(`  - 解决策略：${issue.suggestion}`);
      lines.push(`  - 状态：${statusName(issue.status)}`);
      if (issue.needUserInput || issue.status === "need_input") {
        lines.push(`  - 需补充：${issue.userInputPrompt || "请补充真实材料。"}`);
      }
    });
  });

  lines.push("", "## 合规提示", "本报告仅用于论文表达质量诊断与修改记录，不保证降低任何 AIGC 检测系统结果，也不应用于规避学校、期刊或机构的学术审查。");

  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `论文原创表达诊断报告-${Date.now()}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

function backToInput() {
  els.resultPanel.classList.add("hidden");
  els.startPanel.classList.remove("hidden");
  setModelStatus("已返回编辑页。修改文本后可重新开始诊断。", "idle");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function testModelConnection() {
  const config = readModelConfig();
  if (!config.apiKey) {
    setModelStatus("请先填写 API 密钥。", "warn");
    return;
  }
  setBusy(true);
  setModelStatus("正在测试模型连接……", "loading");
  try {
    const payload = await fetch("/api/model-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config)
    });
    const result = await payload.json();
    if (!payload.ok) throw new Error(result.error || "连接失败");
    setModelStatus("模型连接成功。", "ok");
    saveModelConfig();
  } catch (error) {
    setModelStatus(`模型连接失败：${error.message}`, "error");
  } finally {
    setBusy(false);
  }
}

function readModelConfig() {
  return {
    apiKey: els.apiKeyInput.value.trim(),
    baseUrl: els.baseUrlInput.value.trim() || "https://api.deepseek.com",
    model: els.modelInput.value.trim() || "deepseek-chat"
  };
}

function saveModelConfig() {
  localStorage.setItem("mvp_model_base_url", els.baseUrlInput.value.trim());
  localStorage.setItem("mvp_model_name", els.modelInput.value.trim());
  localStorage.setItem("mvp_model_enabled", String(els.modelToggle.checked));
  localStorage.setItem("mvp_model_save_key", String(els.saveKeyToggle.checked));
  if (els.saveKeyToggle.checked) {
    localStorage.setItem("mvp_model_api_key", els.apiKeyInput.value.trim());
  } else {
    localStorage.removeItem("mvp_model_api_key");
  }
}

function loadModelConfig() {
  els.baseUrlInput.value = localStorage.getItem("mvp_model_base_url") || "https://api.deepseek.com";
  els.modelInput.value = localStorage.getItem("mvp_model_name") || "deepseek-chat";
  els.modelToggle.checked = localStorage.getItem("mvp_model_enabled") === "true";
  els.saveKeyToggle.checked = localStorage.getItem("mvp_model_save_key") === "true";
  els.apiKeyInput.value = els.saveKeyToggle.checked
    ? (localStorage.getItem("mvp_model_api_key") || "")
    : "";
  if (els.apiKeyInput.value) {
    setModelStatus("已从本机浏览器读取 API Key。", "ok");
  }
}

function clearSavedKey() {
  localStorage.removeItem("mvp_model_api_key");
  localStorage.setItem("mvp_model_save_key", "false");
  els.apiKeyInput.value = "";
  els.saveKeyToggle.checked = false;
  setModelStatus("已清除本机保存的 API Key。", "warn");
}

function setModelStatus(message, type = "idle") {
  els.modelStatus.textContent = message;
  els.modelStatus.dataset.status = type;
  if (els.resultModelStatus) {
    els.resultModelStatus.textContent = message;
    els.resultModelStatus.dataset.status = type;
  }
}

function setBusy(isBusy) {
  els.analyzeBtn.disabled = isBusy;
  els.reanalyzeBtn.disabled = isBusy || !state.paragraphs.length;
  els.testModelBtn.disabled = isBusy;
}

function getActiveParagraph() {
  return state.paragraphs.find(item => item.paragraphId === state.selectedId);
}

function statusName(status) {
  return {
    pending: "待处理",
    accepted: "已采纳",
    ignored: "已忽略",
    need_input: "需补充"
  }[status] || "待处理";
}

function replaceFirst(text, target, replacement) {
  const index = text.indexOf(target);
  if (index < 0) return text;
  return `${text.slice(0, index)}${replacement}${text.slice(index + target.length)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.sourceText.addEventListener("input", updateStats);
els.analyzeBtn.addEventListener("click", analyze);
els.clearBtn.addEventListener("click", () => {
  els.sourceText.value = "";
  updateStats();
});
els.loadSampleBtn.addEventListener("click", () => {
  els.sourceText.value = sampleText;
  updateStats();
});
els.exportBtn.addEventListener("click", exportReport);
els.backToInputBtn.addEventListener("click", backToInput);
els.reanalyzeBtn.addEventListener("click", reanalyzeActiveParagraph);
els.testModelBtn.addEventListener("click", testModelConnection);
els.clearKeyBtn.addEventListener("click", clearSavedKey);
els.modelToggle.addEventListener("change", saveModelConfig);
els.baseUrlInput.addEventListener("change", saveModelConfig);
els.modelInput.addEventListener("change", saveModelConfig);
els.saveKeyToggle.addEventListener("change", saveModelConfig);
els.apiKeyInput.addEventListener("change", saveModelConfig);
els.editedText.addEventListener("input", () => {
  const paragraph = getActiveParagraph();
  if (!paragraph) return;
  paragraph.editedText = els.editedText.value;
  els.editStats.textContent = `${paragraph.editedText.length} 字`;
});
els.riskFilters.addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.filter = button.dataset.filter;
  document.querySelectorAll(".filter-btn").forEach(item => item.classList.toggle("active", item === button));
  renderParagraphs();
});

loadModelConfig();
updateStats();
