import { attach } from "neovim";
import { startServer } from "./server.js";

const address =
  process.env.ASCIIDOC_LP_ADDRESS ||
  process.env.NVIM_LISTEN_ADDRESS ||
  "/tmp/nvim";

const nvim = attach({ socket: address });

nvim.channelId.then(async (channelId) => {
  await nvim.setVar("asciidoc_lp_chan_id", channelId);
});

startServer(nvim);
