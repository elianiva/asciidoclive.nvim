// index.js
import { attach } from "neovim";

// server.js
import http from "http";
import restana from "restana";
import { WebSocketServer } from "ws";
import Asciidoctor from "asciidoctor";
import EventEmitter from "events";
import { readFile } from "fs/promises";
var asciidoctor = Asciidoctor();
var service = restana();
var myEvent = new EventEmitter();
var cache = "";
async function startServer(nvim2) {
  service.get("/", async (_, res) => {
    const cssPath = await nvim2.getVar("asciidoc_lp_css_path") || "template/sakura.css";
    const css = await readFile(cssPath, {
      encoding: "utf-8"
    });
    let template = await readFile("template/index.html", {
      encoding: "utf-8"
    });
    if (css) {
      template = template.replace(/\{css\}/, `<style>${css}</style>`);
    }
    res.setHeader("Content-Type", "text/html").send(template);
  });
  const server = http.createServer(service);
  const wss = new WebSocketServer({ server, path: "/ws" });
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
var nvim = attach({ socket: address });
nvim.channelId.then(async (channelId) => {
  await nvim.setVar("asciidoc_lp_chan_id", channelId);
});
startServer(nvim);
