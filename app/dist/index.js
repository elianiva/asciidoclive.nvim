var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// index.js
var import_neovim = require("neovim");

// server.js
var import_http = __toESM(require("http"), 1);
var import_restana = __toESM(require("restana"), 1);
var import_ws = require("ws");
var import_asciidoctor = __toESM(require("asciidoctor"), 1);
var import_events = __toESM(require("events"), 1);
var import_promises = require("fs/promises");
var asciidoctor = (0, import_asciidoctor.default)();
var service = (0, import_restana.default)();
var myEvent = new import_events.default();
var cache = "";
async function startServer(nvim2) {
  service.get("/", async (_, res) => {
    const cssPath = await nvim2.getVar("asciidoc_lp_css_path") || "template/sakura.css";
    const css = await (0, import_promises.readFile)(cssPath, {
      encoding: "utf-8"
    });
    let template = await (0, import_promises.readFile)("template/index.html", {
      encoding: "utf-8"
    });
    if (css) {
      template = template.replace(/\{css\}/, `<style>${css}</style>`);
    }
    res.setHeader("Content-Type", "text/html").send(template);
  });
  const server = import_http.default.createServer(service);
  const wss = new import_ws.WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    myEvent.on("update", async (data = "") => {
      try {
        const result = asciidoctor.convert(data);
        cache = result;
        ws.send(result);
      } catch (err) {
        await nvim2.errWriteLine(err);
      }
    });
    if (cache) {
      ws.send(cache);
    }
  });
  const PORT = await nvim2.getVar("asciidoc_lp_port") || 3e3;
  const HOST = "127.0.0.1";
  server.listen(PORT, HOST, async () => {
    await nvim2.outWriteLine(`Asciidoc Live Preview Server is running on: http://${HOST}:${PORT}`);
  });
  nvim2.on("notification", async (method, args) => {
    if (method === "refresh_content") {
      const opts = args[0] || args;
      const bufnr = opts.bufnr;
      const buffers = await nvim2.buffers;
      const buf = buffers.find((b) => b.id === bufnr);
      const content = await buf.getLines();
      myEvent.emit("update", content);
    }
  });
}

// index.js
var address = process.env.ASCIIDOC_LP_ADDRESS || process.env.NVIM_LISTEN_ADDRESS || "/tmp/nvim";
var nvim = (0, import_neovim.attach)({ socket: address });
nvim.channelId.then(async (channelId) => {
  await nvim.setVar("asciidoc_lp_chan_id", channelId);
});
startServer(nvim);
