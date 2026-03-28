const http = require("http");
const https = require("https");

const VLLM_BASE = process.env.VLLM_BASE || "http://localhost:8000";
const VLLM_MODEL = process.env.VLLM_MODEL || "openai/gpt-oss-20b";
const PORT = process.env.PORT || 3456;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// Convert Anthropic messages request -> OpenAI chat completions request
function anthropicToOpenAI(body) {
  const messages = [];

  if (body.system) {
    const systemContent =
      typeof body.system === "string"
        ? body.system
        : body.system.map((b) => b.text || "").join("\n");
    messages.push({ role: "system", content: systemContent });
  }

  for (const msg of body.messages || []) {
    if (typeof msg.content === "string") {
      messages.push({ role: msg.role, content: msg.content });
      continue;
    }
    if (Array.isArray(msg.content)) {
      const parts = [];
      const toolResults = [];
      for (const block of msg.content) {
        if (block.type === "text") {
          parts.push({ type: "text", text: block.text });
        } else if (block.type === "tool_use") {
          // assistant tool call - handled below
        } else if (block.type === "tool_result") {
          toolResults.push(block);
        } else if (block.type === "image") {
          parts.push({
            type: "image_url",
            image_url: {
              url: `data:${block.source.media_type};base64,${block.source.data}`,
            },
          });
        }
      }

      // Handle assistant messages with tool_use blocks
      const toolUseBlocks = msg.content.filter((b) => b.type === "tool_use");
      if (msg.role === "assistant" && toolUseBlocks.length > 0) {
        const textBlocks = msg.content.filter((b) => b.type === "text");
        const textContent = textBlocks.map((b) => b.text).join("") || null;
        messages.push({
          role: "assistant",
          content: textContent,
          tool_calls: toolUseBlocks.map((b) => ({
            id: b.id,
            type: "function",
            function: {
              name: b.name,
              arguments: JSON.stringify(b.input || {}),
            },
          })),
        });
        continue;
      }

      // Handle tool results (user role)
      if (toolResults.length > 0) {
        for (const tr of toolResults) {
          const content =
            typeof tr.content === "string"
              ? tr.content
              : Array.isArray(tr.content)
              ? tr.content.map((c) => c.text || "").join("")
              : JSON.stringify(tr.content);
          messages.push({
            role: "tool",
            tool_call_id: tr.tool_use_id,
            content,
          });
        }
        if (parts.length > 0) {
          messages.push({
            role: "user",
            content: parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts,
          });
        }
        continue;
      }

      messages.push({
        role: msg.role,
        content: parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts,
      });
    }
  }

  const openAIBody = {
    model: VLLM_MODEL,
    messages,
    max_tokens: body.max_tokens || 4096,
    stream: body.stream || false,
  };

  if (body.temperature !== undefined) openAIBody.temperature = body.temperature;
  if (body.top_p !== undefined) openAIBody.top_p = body.top_p;
  if (body.stop_sequences) openAIBody.stop = body.stop_sequences;

  // Convert Anthropic tools -> OpenAI tools
  if (body.tools && body.tools.length > 0) {
    openAIBody.tools = body.tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.input_schema || { type: "object", properties: {} },
      },
    }));
    if (body.tool_choice) {
      if (body.tool_choice.type === "auto") openAIBody.tool_choice = "auto";
      else if (body.tool_choice.type === "any") openAIBody.tool_choice = "required";
      else if (body.tool_choice.type === "tool") {
        openAIBody.tool_choice = {
          type: "function",
          function: { name: body.tool_choice.name },
        };
      }
    }
  }

  return openAIBody;
}

// Convert OpenAI response -> Anthropic response
function openAIToAnthropic(openAIResp, model) {
  const choice = openAIResp.choices?.[0];
  if (!choice) {
    return {
      id: openAIResp.id || "msg_unknown",
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "No response from model." }],
      model: model || VLLM_MODEL,
      stop_reason: "end_turn",
      usage: { input_tokens: 0, output_tokens: 0 },
    };
  }

  const content = [];
  const msg = choice.message;

  if (msg.content) {
    content.push({ type: "text", text: msg.content });
  }

  if (msg.tool_calls && msg.tool_calls.length > 0) {
    for (const tc of msg.tool_calls) {
      let input = {};
      try { input = JSON.parse(tc.function.arguments || "{}"); } catch {}
      content.push({
        type: "tool_use",
        id: tc.id,
        name: tc.function.name,
        input,
      });
    }
  }

  if (content.length === 0) {
    content.push({ type: "text", text: "" });
  }

  const stopMap = {
    stop: "end_turn",
    length: "max_tokens",
    tool_calls: "tool_use",
    content_filter: "end_turn",
  };

  return {
    id: openAIResp.id || `msg_${Date.now()}`,
    type: "message",
    role: "assistant",
    content,
    model: model || VLLM_MODEL,
    stop_reason: stopMap[choice.finish_reason] || "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: openAIResp.usage?.prompt_tokens || 0,
      output_tokens: openAIResp.usage?.completion_tokens || 0,
    },
  };
}

// Stream conversion: OpenAI SSE -> Anthropic SSE
function streamOpenAIToAnthropic(res, openAIStream, msgId, model) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send message_start
  const startEvent = {
    type: "message_start",
    message: {
      id: msgId,
      type: "message",
      role: "assistant",
      content: [],
      model: model || VLLM_MODEL,
      stop_reason: null,
      usage: { input_tokens: 0, output_tokens: 0 },
    },
  };
  res.write(`event: message_start\ndata: ${JSON.stringify(startEvent)}\n\n`);
  res.write(`event: content_block_start\ndata: ${JSON.stringify({ type: "content_block_start", index: 0, content_block: { type: "text", text: "" } })}\n\n`);
  res.write(`event: ping\ndata: ${JSON.stringify({ type: "ping" })}\n\n`);

  let buffer = "";
  let toolCallBuffers = {};
  let textBlockOpen = true;
  let toolBlockIndex = 1;

  openAIStream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      let parsed;
      try { parsed = JSON.parse(data); } catch { continue; }

      const delta = parsed.choices?.[0]?.delta;
      if (!delta) continue;

      // Text delta
      if (delta.content) {
        res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: delta.content } })}\n\n`);
      }

      // Tool call deltas
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          if (!toolCallBuffers[idx]) {
            // Close text block if open
            if (textBlockOpen) {
              res.write(`event: content_block_stop\ndata: ${JSON.stringify({ type: "content_block_stop", index: 0 })}\n\n`);
              textBlockOpen = false;
            }
            const blockIdx = toolBlockIndex++;
            toolCallBuffers[idx] = { id: tc.id, name: "", args: "", blockIdx };
            res.write(`event: content_block_start\ndata: ${JSON.stringify({ type: "content_block_start", index: blockIdx, content_block: { type: "tool_use", id: tc.id || `tool_${idx}`, name: tc.function?.name || "", input: {} } })}\n\n`);
          }
          const buf = toolCallBuffers[idx];
          if (tc.function?.name) buf.name += tc.function.name;
          if (tc.function?.arguments) {
            buf.args += tc.function.arguments;
            res.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: "content_block_delta", index: buf.blockIdx, delta: { type: "input_json_delta", partial_json: tc.function.arguments } })}\n\n`);
          }
        }
      }

      const finishReason = parsed.choices?.[0]?.finish_reason;
      if (finishReason) {
        if (textBlockOpen) {
          res.write(`event: content_block_stop\ndata: ${JSON.stringify({ type: "content_block_stop", index: 0 })}\n\n`);
        }
        for (const buf of Object.values(toolCallBuffers)) {
          res.write(`event: content_block_stop\ndata: ${JSON.stringify({ type: "content_block_stop", index: buf.blockIdx })}\n\n`);
        }
        const stopMap = { stop: "end_turn", length: "max_tokens", tool_calls: "tool_use" };
        res.write(`event: message_delta\ndata: ${JSON.stringify({ type: "message_delta", delta: { stop_reason: stopMap[finishReason] || "end_turn", stop_sequence: null }, usage: { output_tokens: parsed.usage?.completion_tokens || 0 } })}\n\n`);
        res.write(`event: message_stop\ndata: ${JSON.stringify({ type: "message_stop" })}\n\n`);
        res.end();
      }
    }
  });

  openAIStream.on("end", () => {
    if (!res.writableEnded) res.end();
  });

  openAIStream.on("error", (err) => {
    log(`Stream error: ${err.message}`);
    if (!res.writableEnded) res.end();
  });
}

function forwardToVllm(path, method, body, onResponse) {
  const url = new URL(VLLM_BASE + path);
  const isHttps = url.protocol === "https:";
  const lib = isHttps ? https : http;
  const bodyStr = JSON.stringify(body);

  const opts = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname + url.search,
    method,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(bodyStr),
      Authorization: "Bearer none",
    },
  };

  const req = lib.request(opts, onResponse);
  req.on("error", (err) => {
    log(`vllm request error: ${err.message}`);
    onResponse(null, err);
  });
  req.write(bodyStr);
  req.end();
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  log(`${req.method} ${url.pathname}`);

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,anthropic-version,x-api-key,anthropic-beta");
  if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }

  // Health check
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", target: VLLM_BASE, model: VLLM_MODEL }));
    return;
  }

  // Models endpoint
  if (req.method === "GET" && (url.pathname === "/v1/models" || url.pathname === "/models")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      object: "list",
      data: [{ id: VLLM_MODEL, object: "model", created: Date.now(), owned_by: "local" }],
    }));
    return;
  }

  // Only handle POST /v1/messages
  if (req.method !== "POST" || !url.pathname.includes("/messages")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `Not found: ${url.pathname}` }));
    return;
  }

  let rawBody = "";
  req.on("data", (chunk) => (rawBody += chunk));
  req.on("end", () => {
    let anthropicBody;
    try { anthropicBody = JSON.parse(rawBody); } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    const openAIBody = anthropicToOpenAI(anthropicBody);
    const isStream = anthropicBody.stream === true;
    const msgId = `msg_${Date.now()}`;

    log(`→ model=${openAIBody.model} stream=${isStream} tools=${openAIBody.tools?.length || 0} msgs=${openAIBody.messages.length}`);

    forwardToVllm("/v1/chat/completions", "POST", openAIBody, (vllmRes, err) => {
      if (err || !vllmRes) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { type: "api_error", message: err?.message || "upstream error" } }));
        return;
      }

      log(`← vllm status=${vllmRes.statusCode}`);

      if (isStream) {
        streamOpenAIToAnthropic(res, vllmRes, msgId, openAIBody.model);
        return;
      }

      let respBody = "";
      vllmRes.on("data", (c) => (respBody += c));
      vllmRes.on("end", () => {
        if (vllmRes.statusCode !== 200) {
          res.writeHead(vllmRes.statusCode, { "Content-Type": "application/json" });
          res.end(respBody);
          return;
        }
        let openAIResp;
        try { openAIResp = JSON.parse(respBody); } catch {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { type: "api_error", message: "Failed to parse upstream response" } }));
          return;
        }
        const anthropicResp = openAIToAnthropic(openAIResp, openAIBody.model);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(anthropicResp));
      });
    });
  });
});

server.listen(PORT, () => {
  log(`Anthropic→OpenAI proxy listening on port ${PORT}`);
  log(`Forwarding to: ${VLLM_BASE} model: ${VLLM_MODEL}`);
});