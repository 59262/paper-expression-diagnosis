const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const MAX_BODY_BYTES = 2_000_000;
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/model-test") {
      const body = await readJson(req);
      const result = await callModel({
        ...body,
        meta: { sectionType: "general", discipline: "general", strength: "medium" },
        paragraphs: [{ paragraph_id: "p001", text: "随着人工智能技术的发展，论文写作方式发生了变化。" }]
      });
      sendJson(res, { ok: true, result });
      return;
    }

    if (req.method === "POST" && req.url === "/api/model-diagnose") {
      const body = await readJson(req);
      validateModelPayload(body);
      const result = await callModelSafely(body);
      sendJson(res, { ok: true, result });
      return;
    }

    if (req.method !== "GET") {
      sendJson(res, { error: "Method not allowed" }, 405);
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, { error: error.message || "Server error" }, 500);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`MVP app running at http://localhost:${PORT}`);
});

function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.resolve(ROOT, `.${pathname}`);

  const relativePath = path.relative(ROOT, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    sendJson(res, { error: "Forbidden" }, 403);
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, { error: "Not found" }, 404);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
    });
    res.end(data);
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > MAX_BODY_BYTES) {
        reject(new Error("请求内容过大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("请求 JSON 解析失败"));
      }
    });
    req.on("error", reject);
  });
}

function validateModelPayload(payload) {
  if (!payload || typeof payload !== "object") throw new Error("请求体格式错误");
  if (typeof payload.apiKey !== "string" || !payload.apiKey.trim()) throw new Error("缺少 API 密钥");
  if (payload.apiKey.length > 512) throw new Error("API 密钥长度异常");
  if (typeof payload.model !== "string" || !payload.model.trim()) throw new Error("缺少模型名称");
  if (payload.model.length > 200) throw new Error("模型名称长度异常");
  if (payload.baseUrl !== undefined && (typeof payload.baseUrl !== "string" || payload.baseUrl.length > 2048)) {
    throw new Error("模型地址格式错误");
  }
  if (!Array.isArray(payload.paragraphs) || !payload.paragraphs.length || payload.paragraphs.length > 100) {
    throw new Error("缺少待分析段落");
  }
  payload.paragraphs.forEach(item => {
    if (!item || typeof item !== "object" || typeof item.paragraph_id !== "string" || typeof item.text !== "string") {
      throw new Error("段落数据格式错误");
    }
    if (item.paragraph_id.length > 200 || item.text.length > 20_000) {
      throw new Error("段落数据长度异常");
    }
  });
}

async function callModel(payload) {
  validateModelPayload(payload);
  const baseUrl = normalizeBaseUrl(payload.baseUrl || "https://api.openai.com/v1");
  const endpoint = `${baseUrl}/chat/completions`;
  const prompt = buildPrompt(payload);

  let response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${payload.apiKey}`
    },
      body: JSON.stringify({
        model: payload.model,
        temperature: 0.1,
        max_tokens: 1600,
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        messages: [
        {
          role: "system",
          content: "你是合规的学术写作表达诊断助手。你只帮助识别模板化、空泛化、缺证据、缺作者判断、结构机械、残留写作指令、占位符残留、可疑数据表达、问题-空白-意义模板、摘要模板推进、六段式模板链条、术语堆叠、摘要细节过载、标准化量化口吻、数值缺失、清单式摘要、重复拼接、改写痕迹、过度工整转折、两头说结论、承上启下收尾和风格不一致等写作质量问题，不承诺降低任何 AIGC 检测分数，不提供规避检测策略，不编造文献、数据、访谈、政策或案例。"
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  let data = await response.json().catch(() => ({}));
  if (!response.ok && isResponseFormatError(data)) {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${payload.apiKey}`
      },
      body: JSON.stringify({
        model: payload.model,
        temperature: 0.1,
        max_tokens: 1600,
        thinking: { type: "disabled" },
        messages: [
          {
            role: "system",
            content: "你是合规的学术写作表达诊断助手。你只帮助识别模板化、空泛化、缺证据、缺作者判断、结构机械、残留写作指令、占位符残留、可疑数据表达、问题-空白-意义模板、摘要模板推进、六段式模板链条、术语堆叠、摘要细节过载、标准化量化口吻、数值缺失、清单式摘要、重复拼接、改写痕迹、过度工整转折、两头说结论、承上启下收尾和风格不一致等写作质量问题，不承诺降低任何 AIGC 检测分数，不提供规避检测策略，不编造文献、数据、访谈、政策或案例。"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    const message = data.error?.message || data.message || `模型接口返回 ${response.status}`;
    throw new Error(message);
  }

  let content = extractModelContent(data);
  if (!content && shouldRetryWithDeepSeekChat(payload)) {
    data = await retryWithDeepSeekChat(endpoint, payload, prompt);
    content = extractModelContent(data);
  }
  if (!content) {
    const finishReason = data.choices?.[0]?.finish_reason;
    throw new Error(`模型没有返回文本内容${finishReason ? `，finish_reason=${finishReason}` : ""}`);
  }

  try {
    return parseModelJson(content);
  } catch (error) {
    return repairModelJson(endpoint, payload, content, error.message);
  }
}

function shouldRetryWithDeepSeekChat(payload) {
  const baseUrl = String(payload.baseUrl || "").toLowerCase();
  const model = String(payload.model || "").toLowerCase();
  return baseUrl.includes("deepseek") && model !== "deepseek-chat";
}

async function retryWithDeepSeekChat(endpoint, payload, prompt) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${payload.apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.1,
      max_tokens: 1600,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "你是合规的学术写作表达诊断助手。只输出合法 JSON，不要输出 Markdown、解释或额外文字。"
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  let data = await response.json().catch(() => ({}));
  if (!response.ok && isResponseFormatError(data)) {
    const retry = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${payload.apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.1,
        max_tokens: 1600,
        messages: [
          {
            role: "system",
            content: "你是合规的学术写作表达诊断助手。只输出合法 JSON，不要输出 Markdown、解释或额外文字。"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    data = await retry.json().catch(() => ({}));
    if (!retry.ok) {
      const message = data.error?.message || data.message || `DeepSeek 兼容模型重试返回 ${retry.status}`;
      throw new Error(message);
    }
  } else if (!response.ok) {
    const message = data.error?.message || data.message || `DeepSeek 兼容模型重试返回 ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function isResponseFormatError(data) {
  const message = String(data.error?.message || data.message || "").toLowerCase();
  return message.includes("response_format")
    || message.includes("json_object")
    || message.includes("json schema")
    || message.includes("unsupported");
}

async function callModelSafely(payload) {
  try {
    return await callModel(payload);
  } catch (error) {
    return {
      paragraphs: payload.paragraphs.map(item => ({
        paragraph_id: item.paragraph_id,
        risk_level: "low",
        issues: []
      })),
      model_error: error.message || "模型输出解析失败"
    };
  }
}

async function repairModelJson(endpoint, payload, brokenContent, parseError) {
  let response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${payload.apiKey}`
    },
      body: JSON.stringify({
        model: payload.model,
        temperature: 0,
        max_tokens: 1600,
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        messages: [
        {
          role: "system",
          content: "你是 JSON 修复器。只输出修复后的合法 JSON，不要输出 Markdown、解释、注释或额外文字。"
        },
        {
          role: "user",
          content: [
            "下面内容本应是论文诊断结果 JSON，但解析失败。",
            `解析错误：${parseError}`,
            "请修复为合法 JSON，保持原有字段和语义，结构必须包含 paragraphs 数组。",
            "",
            brokenContent
          ].join("\n")
        }
      ]
    })
  });

  let data = await response.json().catch(() => ({}));
  if (!response.ok && isResponseFormatError(data)) {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${payload.apiKey}`
      },
      body: JSON.stringify({
        model: payload.model,
        temperature: 0,
        max_tokens: 1600,
        thinking: { type: "disabled" },
        messages: [
          {
            role: "system",
            content: "你是 JSON 修复器。只输出修复后的合法 JSON，不要输出 Markdown、解释、注释或额外文字。"
          },
          {
            role: "user",
            content: [
              "下面内容本应是论文诊断结果 JSON，但解析失败。",
              `解析错误：${parseError}`,
              "请修复为合法 JSON，保持原有字段和语义，结构必须包含 paragraphs 数组。",
              "",
              brokenContent
            ].join("\n")
          }
        ]
      })
    });
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    const message = data.error?.message || data.message || `JSON 修复请求返回 ${response.status}`;
    throw new Error(message);
  }

  const repaired = extractModelContent(data);
  if (!repaired) {
    throw new Error("模型 JSON 解析失败，且修复请求没有返回内容");
  }

  try {
    return parseModelJson(repaired);
  } catch (error) {
    throw new Error(`模型返回 JSON 仍不合法：${error.message}`);
  }
}

function extractModelContent(data) {
  const choice = data.choices?.[0];
  const message = choice?.message || {};
  if (typeof message.content === "string" && message.content.trim()) {
    return message.content;
  }
  if (Array.isArray(message.content)) {
    const text = message.content
      .map(part => typeof part === "string" ? part : part?.text || "")
      .join("")
      .trim();
    if (text) return text;
  }
  if (typeof choice?.text === "string" && choice.text.trim()) {
    return choice.text;
  }
  return "";
}

function normalizeBaseUrl(value) {
  const raw = String(value).trim().replace(/\/+$/, "").replace(/\/chat\/completions$/, "");
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("模型地址必须是完整的 HTTP(S) URL");
  }
  if (!["https:", "http:"].includes(parsed.protocol)) {
    throw new Error("模型地址只支持 HTTP(S)");
  }
  if (parsed.username || parsed.password || parsed.hash) {
    throw new Error("模型地址不得包含账号、密码或片段");
  }
  if (parsed.protocol === "http:" && !isLoopbackHost(parsed.hostname)) {
    throw new Error("非本机模型地址必须使用 HTTPS");
  }
  if (isBlockedHost(parsed.hostname)) {
    throw new Error("模型地址指向受限制的本机或内网地址");
  }
  return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
}

function isLoopbackHost(hostname) {
  const host = String(hostname).toLowerCase();
  return host === "localhost" || host === "[::1]" || host === "::1" || /^127(?:\.\d{1,3}){3}$/.test(host);
}

function isBlockedHost(hostname) {
  const host = String(hostname).toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "0.0.0.0" || host === "::" || host === "169.254.169.254" || host === "metadata.google.internal") return true;
  if (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  return false;
}

function buildPrompt(payload) {
  const meta = payload.meta || {};
  const paragraphs = payload.paragraphs.map(item => ({
    paragraph_id: item.paragraph_id,
    text: String(item.text || "").slice(0, 1200)
  }));

  return [
    "请诊断以下论文段落的表达质量风险，并输出严格 JSON。本次请求通常只包含一个段落，请只返回该段落的诊断结果。",
    "",
    "元信息：",
    JSON.stringify({
      section_type: meta.sectionType || meta.section_type || "general",
      discipline: meta.discipline || "general",
      optimization_strength: meta.strength || meta.optimization_strength || "medium"
    }, null, 2),
    "",
    "要求：",
    "1. 不要输出具体 AI 检测分数。",
    "2. 不要承诺通过或降低任何检测。",
    "3. 不要编造文献、作者、年份、数据、访谈、政策或案例。",
    "4. 需要真实材料时，将 need_user_input 设为 true。",
    "5. rewrite_sample 必须是可以直接替换 span_text 的正文文本，不允许写修改意见、解释、建议、操作步骤或“例如”。",
    "6. 每段最多返回 3 条 issues，优先返回最明显的问题。",
    "7. 如果发现“（此处删除）”“（需补充数据后方可改写）”“把……改为……”等残留写作指令或自我改写说明，必须标记出来，并建议从正文中删除。",
    "8. 如果发现短距离重复判断、模板句式堆砌、连续转折或语调风格突然变化，也要作为表达质量问题返回。",
    "9. 如果缺少事实依据、真实数据或真实引用，rewrite_sample 必须为空字符串，need_user_input 必须为 true。",
    "10. rewrite_sample 不得以“建议”“请”“可”“可以”“应”“应该”“将”“把”“改为”“删除”“补充”“合并”“例如”等指导语开头。",
    "11. 如果发现“X ms”“需用户填入真实值”“该数值为示例”“实际需测量”“示例数值”等占位符，必须标记 placeholder_trace，need_user_input=true，rewrite_sample 为空字符串。",
    "12. 如果发现“虽然……然而……但……”等过于工整或连续的转折对比结构，可标记 over_neat_transition。",
    "13. 如果机制说明过长且证据不足，可标记 verbose_mechanism；如果摘要中过细解释概念或举例，可标记 over_explained_example。",
    "14. 如果发现 [Y]%、[X]、[待填] 等方括号占位符，必须标记 placeholder_trace。",
    "15. 如果发现约1%、约3%等上下文中缺乏解释的奇怪小比例数据，标记 suspicious_metric，need_user_input=true。",
    "16. 如果开篇是“现象日趋普遍-但仍缺乏-导致风险/意义”的套路结构，标记 problem_gap_significance。",
    "17. 如果结论采用既有优势又有短板、最后再点风险的均衡收尾，标记 both_sides_conclusion。",
    "18. 如果摘要按“背景-方法-结果-结论”机械推进且平均分配篇幅，标记 abstract_template_flow。",
    "19. 如果术语密集堆叠且逻辑衔接不自然，标记 jargon_stacking。",
    "20. 如果摘要中出现 N=、P<0.05、详见实验部分、峰值约为正常值的2倍等过细统计或指向性说明，标记 over_precise_abstract。",
    "21. 如果出现“稳定在以下”“控制在以下”等明显缺少数值的表达，标记 incomplete_metric，need_user_input=true，rewrite_sample 为空字符串。",
    "22. 如果摘要把延迟、丢包、计费、工单、超售、故障排查等多个维度平均塞入，标记 checklist_summary。",
    "23. 如果摘要完整呈现“背景-问题-方法-结果-讨论-结论”的教科书链条，标记 six_part_template。",
    "24. 如果发现【请补充实测百分比】、[请提供真实行业参考标准...] 这类中文或英文括号待填，标记 placeholder_trace。",
    "25. 如果精确数字、N=、P<0.05 和牵强解释组合得像在模仿量化研究，标记 performative_quant，need_user_input=true。",
    "26. 如果结尾出现“这些发现表明……后续研究可进一步……”或类似研究展望套话，标记 bridge_conclusion。",
    "",
    "标签只能使用：template_expression, vague_argument, lack_evidence, lack_author_view, mechanical_structure, overly_smooth_logic, citation_needed, need_real_material, residual_instruction, repeated_expression, template_stack, meta_revision_trace, style_inconsistency, placeholder_trace, suspicious_metric, problem_gap_significance, abstract_template_flow, six_part_template, jargon_stacking, over_precise_abstract, performative_quant, incomplete_metric, checklist_summary, over_neat_transition, verbose_mechanism, over_explained_example, both_sides_conclusion, bridge_conclusion。",
    "风险等级只能使用：low, medium, high, need_user_input。",
    "策略类型只能使用：expression, content, structure, compliance。",
    "",
    "输出必须是一个 JSON 对象，不要 Markdown，不要解释文字。结构如下：",
    JSON.stringify({
      paragraphs: [
        {
          paragraph_id: "p001",
          risk_level: "low|medium|high|need_user_input",
          issues: [
            {
              issue_id: "p001-ai-001",
              span_text: "原文片段",
              label: "template_expression",
              reason: "为什么有模板化或低质量表达风险",
              strategy_type: "expression|content|structure|compliance",
              action_steps: ["可执行步骤1", "可执行步骤2"],
              suggestion: "合规修改方向",
              rewrite_sample: "可直接替换原文片段的正文文本；无法安全替换时为空字符串",
              need_user_input: false,
              user_input_prompt: "",
              severity: "low|medium|high"
            }
          ]
        }
      ]
    }, null, 2),
    "",
    "待分析段落：",
    JSON.stringify(paragraphs, null, 2)
  ].join("\n");
}

function parseModelJson(content) {
  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error(error.message || "模型返回内容不是合法 JSON");
  }
}

function sendJson(res, payload, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'"
  });
  res.end(JSON.stringify(payload));
}
