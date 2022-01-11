import http from "http";
import restana from "restana";
import { WebSocketServer } from "ws";
import Asciidoctor from "asciidoctor";
import EventEmitter from "events";
import { readFile } from "fs/promises";

const asciidoctor = Asciidoctor();
const service = restana();
const myEvent = new EventEmitter();

let cache = "";

/**
 * Start the live server
 *
 * @param {import("neovim").Neovim} nvim - Neovim node client
 */
export async function startServer(nvim) {
  service.get("/", async (_, res) => {
    const cssPath =
      (await nvim.getVar("asciidoc_lp_css_path")) || "template/sakura.css";
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
        await nvim.errWriteLine(err);
      }
    });

    // use cached result if exists on initial page load
    if (cache) {
      ws.send(cache);
    }
  });

  const PORT = (await nvim.getVar("asciidoc_lp_port")) || 3000;
  const HOST = "127.0.0.1";
  server.listen(PORT, HOST, async () => {
    await nvim.outWriteLine(
      `Asciidoc Live Preview Server is running on: http://${HOST}:${PORT}`
    );
  });

  nvim.on("notification", async (method, args) => {
    if (method === "refresh_content") {
      const opts = args[0] || args;
      const bufnr = opts.bufnr;
      const buffers = await nvim.buffers;
      const buf = buffers.find((b) => b.id === bufnr);
      const content = await buf.getLines();

      myEvent.emit("update", content);
    }
  });
}
